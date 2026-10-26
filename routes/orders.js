const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Address = require('../models/Address');
const Image = require('../models/Image');
const { detectType } = require('./images');
const { expireUnpaid } = require('../lib/expirePending');
const { requireAuth, requireAdmin } = require('./auth');
const { validateAddress } = require('../lib/address');
const { FREE_SHIPPING_FROM, SHIPPING_FEE, MAX_QTY, MAX_ADDRESSES, PAY_WINDOW_MINUTES } = require('../config/shop');

const { STATUSES } = Order;

// สถานะที่แอดมินเปลี่ยนต่อได้ (ยกเลิกแล้วคืนสต็อกให้อัตโนมัติ)
const TRANSITIONS = {
  pending: ['paid', 'cancelled'], // ออเดอร์เก็บเงินปลายทาง (cod) ข้ามไป shipped ได้เลย (ดู COD_PENDING_EXTRA)
  paid: ['shipped', 'cancelled', 'pending'],
  shipped: [], // shipped -> received ลูกค้าเป็นคนกดเองเท่านั้น (แอดมินกดแทนไม่ได้)
  received: [],
  cancelled: [],
};

const COD_PENDING_EXTRA = 'shipped';
const PAY_METHODS = ['promptpay', 'cod'];

const SLIP_MAX_BYTES = 1024 * 1024;
const slipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'แนบสลิปถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// ลบรูปสลิปของออเดอร์ (ถ้ามี) ใช้ตอนยกเลิก/ปฏิเสธ/แนบใหม่
async function dropSlipImage(imageId) {
  if (imageId) await Image.deleteOne({ _id: imageId, kind: 'slip' }).catch(() => {});
}

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'สั่งซื้อถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

function fail(status, message, extra) {
  const e = new Error(message);
  e.status = status;
  e.extra = extra || {};
  return e;
}

function sendError(res, e) {
  if (e && e.status) return res.status(e.status).json({ error: e.message, ...e.extra });
  console.error(e);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
}

// เลขออเดอร์อ่านง่าย เช่น MW261017-K7QF (วันที่ตามเวลาไทย + ตัวอักษรสุ่มที่ไม่สับสนกัน)
function genOrderNo() {
  const d = new Date(Date.now() + 7 * 3600e3).toISOString().slice(2, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += alphabet[crypto.randomInt(alphabet.length)];
  return 'MW' + d + '-' + s;
}

async function giveBack(lines) {
  await Promise.all(lines.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })));
}

// ตัดสต็อกทีละสินค้าแบบอะตอมมิก (ตัดได้เฉพาะเมื่อสต็อกพอ) ถ้าตัวใดไม่พอจะคืนที่ตัดไปแล้วทั้งหมด
async function takeStock(lines) {
  const taken = [];
  try {
    for (const l of lines) {
      const r = await Product.updateOne(
        { _id: l.product, active: true, stock: { $gte: l.qty } },
        { $inc: { stock: -l.qty } }
      );
      if (r.modifiedCount !== 1) {
        const fresh = await Product.findById(l.product).select('name stock');
        const left = fresh ? fresh.stock : 0;
        throw fail(409, 'สินค้า "' + l.name + '" ' + (left > 0 ? 'เหลือเพียง ' + left + ' ชิ้น' : 'หมดแล้ว') + ' กรุณาปรับจำนวนในตะกร้า', { code: 'STOCK' });
      }
      taken.push(l);
    }
  } catch (e) {
    await giveBack(taken);
    throw e;
  }
}

// ---------------------------------------------------------------------------
// ลูกค้า
// ---------------------------------------------------------------------------
const customerRouter = express.Router();
customerRouter.use(requireAuth);

customerRouter.post('/', orderLimiter, async (req, res) => {
  let taken = false;
  let lines = [];
  try {
    const body = req.body || {};

    // 1) รายการสินค้า: รวมรหัสซ้ำ ตรวจรูปแบบ
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      throw fail(400, 'ตะกร้าว่างหรือมีรายการมากเกินไป');
    }
    const want = new Map();
    for (const it of body.items) {
      const id = String((it && it.productId) || '');
      const qty = Number(it && it.qty);
      if (!mongoose.isValidObjectId(id) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        throw fail(400, 'ข้อมูลสินค้าในตะกร้าไม่ถูกต้อง (จำนวน 1-' + MAX_QTY + ' ชิ้นต่อรายการ)');
      }
      want.set(id, Math.min(MAX_QTY, (want.get(id) || 0) + qty));
    }

    // 2) ราคาและชื่อสินค้าอ่านจากฐานข้อมูลเท่านั้น ไม่เชื่อค่าที่หน้าเว็บส่งมา
    const products = await Product.find({ _id: { $in: [...want.keys()] }, active: true });
    if (products.length !== want.size) {
      throw fail(409, 'มีสินค้าในตะกร้าที่ไม่มีขายแล้ว กรุณาลบออกจากตะกร้า', { code: 'STOCK' });
    }
    lines = products.map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      qty: want.get(String(p._id)),
      kind: p.kind,
      color: p.color,
      imageUrl: p.image ? '/api/images/' + p.image : null,
    }));
    const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const payMethod = body.payMethod === undefined ? 'promptpay' : String(body.payMethod);
    if (!PAY_METHODS.includes(payMethod)) throw fail(400, 'วิธีชำระเงินไม่ถูกต้อง');

    // 3) ที่อยู่จัดส่ง: ใช้ที่บันทึกไว้ หรือกรอกใหม่
    let address;
    let inline = null;
    if (body.addressId) {
      if (!mongoose.isValidObjectId(String(body.addressId))) throw fail(400, 'ที่อยู่ไม่ถูกต้อง');
      const saved = await Address.findOne({ _id: body.addressId, user: req.user._id });
      if (!saved) throw fail(400, 'ไม่พบที่อยู่ที่เลือก', { field: 'address' });
      address = { name: saved.name, tel: saved.tel, line: saved.line };
    } else {
      const { data, error } = validateAddress(body.address);
      if (error) throw fail(400, error[1], { field: error[0] });
      address = { name: data.name, tel: data.tel, line: data.line };
      inline = data;
    }

    // 4) ตัดสต็อก แล้วสร้างออเดอร์ (ถ้าสร้างไม่สำเร็จจะคืนสต็อก)
    await takeStock(lines);
    taken = true;
    let order = null;
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      try {
        order = await Order.create({
          orderNo: genOrderNo(),
          user: req.user._id,
          items: lines,
          subtotal,
          shipping,
          total,
          address,
          payMethod,
          // เก็บเงินปลายทางไม่ต้องรีบโอน จึงไม่นับถอยหลังยกเลิกอัตโนมัติ
          payExpiresAt: payMethod === 'cod' ? null : new Date(Date.now() + PAY_WINDOW_MINUTES * 60 * 1000),
        });
      } catch (e) {
        if (!(e && e.code === 11000)) throw e; // เลขออเดอร์ซ้ำ (แทบไม่เกิด) ให้สุ่มใหม่
      }
    }
    if (!order) throw new Error('สร้างเลขออเดอร์ไม่สำเร็จ');

    // 5) บันทึกที่อยู่ใหม่ไว้ใช้ครั้งหน้า (ถ้าลูกค้าติ๊กไว้) ไม่ให้ล้มทั้งออเดอร์ถ้าขั้นนี้พลาด
    if (inline && body.saveAddress) {
      try {
        const count = await Address.countDocuments({ user: req.user._id });
        if (count < MAX_ADDRESSES) {
          await Address.create({ user: req.user._id, ...inline, label: '', isDefault: count === 0 });
        }
      } catch (e) {
        console.error('บันทึกที่อยู่ไม่สำเร็จ', e.message);
      }
    }

    res.status(201).json({ order: order.toPublic() });
  } catch (e) {
    if (taken && !(e && e.status === 409)) {
      // สร้างออเดอร์ล้มเหลวหลังตัดสต็อกแล้ว คืนสต็อกทั้งหมด
      await giveBack(lines).catch(() => {});
    }
    sendError(res, e);
  }
});

customerRouter.get('/', async (req, res) => {
  try {
    await expireUnpaid(); // ครบเวลาแล้วยกเลิกทันที ก่อนส่งรายการให้ลูกค้า
    const list = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ orders: list.map((o) => o.toPublic()) });
  } catch (e) {
    sendError(res, e);
  }
});

// ลูกค้ายกเลิกเองได้เฉพาะออเดอร์ที่ยังรอชำระเงิน
customerRouter.post('/:id/cancel', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบออเดอร์');
    const o = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'pending' },
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    );
    if (!o) throw fail(409, 'ยกเลิกไม่ได้ ออเดอร์นี้ชำระเงินหรือถูกยกเลิกไปแล้ว ติดต่อร้านหากต้องการความช่วยเหลือ');
    await giveBack(o.items);
    await dropSlipImage(o.slip && o.slip.image);
    res.json({ order: o.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

// ลูกค้าแนบสลิปโอนเงินให้ออเดอร์ที่ยังรอชำระเงิน (แนบใหม่ได้ รูปเดิมจะถูกแทนที่) แอดมินตรวจแล้วกดยืนยันเอง
customerRouter.post(
  '/:id/slip',
  slipLimiter,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: SLIP_MAX_BYTES }),
  async (req, res) => {
    let img = null;
    try {
      if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบออเดอร์');
      await expireUnpaid();
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length === 0) throw fail(400, 'ไม่พบไฟล์รูป ส่งได้เฉพาะ JPG, PNG หรือ WebP');
      const type = detectType(buf);
      if (!type) throw fail(400, 'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP');
      const mine = await Order.findOne({ _id: req.params.id, user: req.user._id });
      if (!mine) throw fail(404, 'ไม่พบออเดอร์');
      if (mine.status === 'cancelled' && mine.cancelReason === 'timeout') throw fail(409, 'ออเดอร์นี้ถูกยกเลิกเพราะไม่ได้ชำระเงินภายในเวลาที่กำหนด กรุณาสั่งซื้อใหม่');
      if (mine.payMethod === 'cod') throw fail(409, 'ออเดอร์นี้เลือกชำระเงินปลายทาง ไม่ต้องแนบสลิป');
      if (mine.status !== 'pending') throw fail(409, 'ออเดอร์นี้ไม่ได้รอชำระเงินแล้ว แนบสลิปไม่ได้');
      img = await Image.create({ data: buf, contentType: type, size: buf.length, kind: 'slip', owner: req.user._id });
      const before = mine.slip && mine.slip.image;
      const o = await Order.findOneAndUpdate(
        { _id: mine._id, status: 'pending' },
        { slip: { image: img._id, at: new Date(), rejectNote: '' } },
        { new: true }
      );
      if (!o) throw fail(409, 'ออเดอร์นี้เพิ่งเปลี่ยนสถานะ แนบสลิปไม่ได้');
      await dropSlipImage(before);
      res.status(201).json({ order: o.toPublic() });
    } catch (e) {
      if (img && e) await dropSlipImage(img._id);
      sendError(res, e);
    }
  }
);

// ดูรูปสลิป: เฉพาะเจ้าของออเดอร์หรือแอดมิน
customerRouter.get('/:id/slip', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const q = { _id: req.params.id };
    if (req.user.role !== 'admin') q.user = req.user._id;
    const o = await Order.findOne(q).select('slip');
    if (!o || !o.slip || !o.slip.image) return res.status(404).end();
    const img = await Image.findOne({ _id: o.slip.image, kind: 'slip' });
    if (!img) return res.status(404).end();
    res.set({
      'Content-Type': img.contentType,
      'Content-Length': String(img.data.length),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(img.data);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

// ข้อผิดพลาดจากการรับไฟล์ (เช่นไฟล์ใหญ่เกิน)
customerRouter.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'รูปสลิปใหญ่เกินไป (ไม่เกิน 1 MB) ลองเลือกรูปอื่น' });
  next(err);
});

// ลูกค้ากดยืนยันว่าได้รับสินค้าแล้ว ทำได้เฉพาะออเดอร์ของตัวเองที่ร้านจัดส่งแล้ว (กดได้ครั้งเดียว)
// หลังยืนยันแล้วจึงรีวิวสินค้าในออเดอร์นี้ได้
customerRouter.post('/:id/receive', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบออเดอร์');
    const o = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'shipped' },
      { status: 'received', receivedAt: new Date() },
      { new: true }
    );
    if (!o) {
      const cur = await Order.findOne({ _id: req.params.id, user: req.user._id }).select('status');
      if (!cur) throw fail(404, 'ไม่พบออเดอร์');
      if (cur.status === 'received') throw fail(409, 'คุณยืนยันรับสินค้าของออเดอร์นี้ไปแล้ว');
      throw fail(409, 'ยืนยันรับสินค้าได้เมื่อร้านจัดส่งแล้วเท่านั้น');
    }
    res.json({ order: o.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

// ---------------------------------------------------------------------------
// แอดมิน
// ---------------------------------------------------------------------------
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/', async (req, res) => {
  try {
    await expireUnpaid();
    const q = {};
    if (STATUSES.includes(String(req.query.status || ''))) q.status = req.query.status;
    const list = await Order.find(q).sort({ createdAt: -1 }).limit(200).populate('user', 'name email');
    res.json({ orders: list.map((o) => o.toPublic()) });
  } catch (e) {
    sendError(res, e);
  }
});

adminRouter.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบออเดอร์');
    const cur = await Order.findById(req.params.id);
    if (!cur) throw fail(404, 'ไม่พบออเดอร์');

    const body = req.body || {};
    const next = body.status === undefined ? cur.status : String(body.status);
    if (!STATUSES.includes(next)) throw fail(400, 'สถานะไม่ถูกต้อง');

    const set = {};
    if (body.tracking !== undefined) {
      const t = String(body.tracking).trim();
      if (t.length > 60) throw fail(400, 'เลขพัสดุยาวเกิน 60 ตัวอักษร', { field: 'tracking' });
      set.tracking = t;
    }

    if (next !== cur.status) {
      const allowed = TRANSITIONS[cur.status].concat(cur.status === 'pending' && cur.payMethod === 'cod' ? [COD_PENDING_EXTRA] : []);
      if (!allowed.includes(next)) {
        throw fail(409, 'เปลี่ยนสถานะจากนี้ไปเป็นสถานะที่เลือกไม่ได้');
      }
      set.status = next;
      const now = new Date();
      if (next === 'paid') set.paidAt = now;
      if (next === 'pending') {
        set.paidAt = null;
        set.payExpiresAt = null; // แอดมินย้อนกลับเอง ไม่นับถอยหลังยกเลิกอัตโนมัติ
      }
      if (next === 'shipped') {
        set.shippedAt = now;
        if (cur.payMethod === 'cod' && cur.status === 'pending') set.payExpiresAt = null;
      }
      if (next === 'cancelled') set.cancelledAt = now;
    } else if (cur.status !== 'shipped' && cur.status !== 'paid' && !(cur.status === 'pending' && cur.payMethod === 'cod') && body.tracking !== undefined) {
      throw fail(409, 'ใส่เลขพัสดุได้เมื่อชำระเงินแล้วหรือจัดส่งแล้ว');
    }
    if (Object.keys(set).length === 0) return res.json({ order: cur.toPublic() });

    // เงื่อนไข status เดิมกันสองคนกดพร้อมกัน (และกันการคืนสต็อกซ้ำ)
    const updated = await Order.findOneAndUpdate({ _id: cur._id, status: cur.status }, set, { new: true }).populate('user', 'name email');
    if (!updated) throw fail(409, 'ออเดอร์นี้เพิ่งถูกเปลี่ยนโดยผู้อื่น กรุณารีเฟรชแล้วลองใหม่');
    if (set.status === 'cancelled') {
      await giveBack(updated.items);
      await dropSlipImage(updated.slip && updated.slip.image);
    }
    res.json({ order: updated.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

// แอดมินปฏิเสธสลิป (เช่นยอดไม่ตรง/สลิปไม่ชัด): ลบสลิปและแจ้งเหตุผลให้ลูกค้าแนบใหม่ ทำได้เฉพาะออเดอร์ที่ยังรอชำระเงิน
adminRouter.post('/:id/reject-slip', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบออเดอร์');
    const note = String((req.body && req.body.note) || '').trim().slice(0, 200) || 'สลิปไม่ถูกต้อง กรุณาแนบสลิปใหม่';
    const cur = await Order.findOne({ _id: req.params.id, status: 'pending', 'slip.image': { $exists: true, $ne: null } });
    if (!cur) throw fail(409, 'ไม่มีสลิปรอตรวจในออเดอร์นี้ (อาจถูกเปลี่ยนสถานะไปแล้ว)');
    const updated = await Order.findOneAndUpdate(
      { _id: cur._id, status: 'pending', payMethod: { $ne: 'cod' } },
      { $unset: { 'slip.image': 1, 'slip.at': 1 }, 'slip.rejectNote': note, payExpiresAt: new Date(Date.now() + PAY_WINDOW_MINUTES * 60 * 1000) },
      { new: true }
    ).populate('user', 'name email');
    await dropSlipImage(cur.slip.image);
    res.json({ order: updated.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

module.exports = { customerRouter, adminRouter };
