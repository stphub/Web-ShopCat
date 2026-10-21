const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Order = require('../models/Order');
const Image = require('../models/Image');
const Return = require('../models/Return');
const { requireAuth, requireAdmin } = require('./auth');
const { detectType } = require('./images');
const { RETURN_WINDOW_DAYS, MAX_RETURN_PHOTOS, MAX_RETURNS_PER_ORDER, MAX_QTY } = require('../config/shop');

const { STATUSES, REASONS, RESOLUTIONS } = Return;
const DAY_MS = 86400000;
const MAX_BYTES = 1024 * 1024; // เท่ากับรูปสินค้า หน้าเว็บย่อรูปก่อนส่ง

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

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'อัปโหลดรูปถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' },
});
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// ---------------------------------------------------------------------------
// ลูกค้า
// ---------------------------------------------------------------------------
const customerRouter = express.Router();
customerRouter.use(requireAuth);

// อัปโหลดรูปหลักฐาน (เก็บแบบ kind='return' ผูกกับเจ้าของ ดูได้เฉพาะเจ้าของกับแอดมิน)
customerRouter.post(
  '/images',
  uploadLimiter,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_BYTES }),
  async (req, res) => {
    try {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ error: 'ไม่พบไฟล์รูป ส่งได้เฉพาะ JPG, PNG หรือ WebP' });
      }
      const type = detectType(buf);
      if (!type) return res.status(400).json({ error: 'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP' });
      const img = await Image.create({ data: buf, contentType: type, size: buf.length, kind: 'return', owner: req.user._id });
      res.status(201).json({ id: img._id.toString(), url: '/api/returns/images/' + img._id });
    } catch (e) {
      sendError(res, e);
    }
  }
);

// ดูรูปหลักฐาน: เฉพาะเจ้าของรูปหรือแอดมิน
customerRouter.get('/images/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const img = await Image.findOne({ _id: req.params.id, kind: 'return' });
    if (!img) return res.status(404).end();
    const isOwner = img.owner && String(img.owner) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') return res.status(404).end();
    res.set({
      'Content-Type': img.contentType,
      'Content-Length': String(img.data.length),
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(img.data);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

customerRouter.get('/mine', async (req, res) => {
  try {
    const list = await Return.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json({ returns: list.map((r) => r.toPublic()) });
  } catch (e) {
    sendError(res, e);
  }
});

customerRouter.post('/', createLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    if (!mongoose.isValidObjectId(body.orderId)) throw fail(404, 'ไม่พบออเดอร์');
    const order = await Order.findOne({ _id: body.orderId, user: req.user._id });
    if (!order) throw fail(404, 'ไม่พบออเดอร์');
    if (order.status !== 'received') throw fail(409, 'แจ้งคืนหรือเปลี่ยนสินค้าได้หลังจากกดยืนยันรับสินค้าแล้วเท่านั้น');
    const until = new Date((order.receivedAt || order.updatedAt).getTime() + RETURN_WINDOW_DAYS * DAY_MS);
    if (Date.now() > until.getTime()) {
      throw fail(409, 'เกินกำหนดแจ้งคืนสินค้าแล้ว (แจ้งได้ภายใน ' + RETURN_WINDOW_DAYS + ' วันหลังยืนยันรับสินค้า) กรุณาติดต่อร้านโดยตรง');
    }

    const existing = await Return.find({ order: order._id }).select('status');
    if (existing.some((r) => r.status === 'pending')) throw fail(409, 'ออเดอร์นี้มีคำขอที่รอร้านตรวจสอบอยู่แล้ว');
    if (existing.some((r) => r.status === 'approved')) throw fail(409, 'ออเดอร์นี้มีคำขอที่ร้านอนุมัติแล้ว กรุณารอร้านดำเนินการ');
    if (existing.length >= MAX_RETURNS_PER_ORDER) throw fail(409, 'ออเดอร์นี้แจ้งคืนครบจำนวนครั้งที่กำหนดแล้ว กรุณาติดต่อร้านโดยตรง');

    // รายการสินค้า: ต้องอยู่ในออเดอร์ และจำนวนไม่เกินที่สั่ง
    if (!Array.isArray(body.items) || body.items.length === 0) throw fail(400, 'กรุณาเลือกสินค้าที่ต้องการแจ้ง', { field: 'items' });
    const byProduct = new Map(order.items.map((i) => [String(i.product), i]));
    const seen = new Set();
    const items = [];
    for (const raw of body.items) {
      const key = String(raw && raw.product);
      const line = byProduct.get(key);
      const qty = Number(raw && raw.qty);
      if (!line || seen.has(key)) throw fail(400, 'รายการสินค้าไม่ถูกต้อง', { field: 'items' });
      if (!Number.isInteger(qty) || qty < 1 || qty > Math.min(line.qty, MAX_QTY)) {
        throw fail(400, 'จำนวนของ "' + line.name + '" ต้องอยู่ระหว่าง 1 ถึง ' + line.qty, { field: 'items' });
      }
      seen.add(key);
      items.push({ product: line.product, name: line.name, qty });
    }

    const reason = String(body.reason || '');
    if (!REASONS.includes(reason)) throw fail(400, 'กรุณาเลือกเหตุผล', { field: 'reason' });
    const detail = String(body.detail || '').trim();
    if (detail.length > 1000) throw fail(400, 'รายละเอียดยาวเกิน 1000 ตัวอักษร', { field: 'detail' });
    if (reason === 'other' && detail.length < 5) throw fail(400, 'กรุณาอธิบายรายละเอียดอย่างน้อย 5 ตัวอักษร', { field: 'detail' });

    // รูปหลักฐาน: อย่างน้อย 1 รูป เป็นรูปที่ตัวเองอัปโหลด และยังไม่ถูกใช้ในคำขออื่น
    const ids = Array.isArray(body.photos) ? [...new Set(body.photos.map(String))] : [];
    if (ids.length < 1) throw fail(400, 'กรุณาแนบรูปหลักฐานอย่างน้อย 1 รูป', { field: 'photos' });
    if (ids.length > MAX_RETURN_PHOTOS) throw fail(400, 'แนบรูปได้ไม่เกิน ' + MAX_RETURN_PHOTOS + ' รูป', { field: 'photos' });
    if (!ids.every((id) => mongoose.isValidObjectId(id))) throw fail(400, 'รูปหลักฐานไม่ถูกต้อง', { field: 'photos' });
    const found = await Image.countDocuments({ _id: { $in: ids }, kind: 'return', owner: req.user._id });
    if (found !== ids.length) throw fail(400, 'รูปหลักฐานไม่ถูกต้อง กรุณาอัปโหลดใหม่', { field: 'photos' });
    if (await Return.exists({ photos: { $in: ids } })) throw fail(400, 'รูปนี้ถูกใช้กับคำขออื่นแล้ว กรุณาอัปโหลดใหม่', { field: 'photos' });

    const r = await Return.create({
      order: order._id,
      orderNo: order.orderNo,
      user: req.user._id,
      items,
      reason,
      detail,
      photos: ids,
    });
    res.status(201).json({ return: r.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

// ลูกค้ายกเลิกคำขอของตัวเอง (ได้เฉพาะที่ยังรอร้านตรวจสอบ)
customerRouter.post('/:id/withdraw', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบคำขอ');
    const r = await Return.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'pending' },
      { status: 'withdrawn' },
      { new: true }
    );
    if (!r) {
      const cur = await Return.findOne({ _id: req.params.id, user: req.user._id }).select('status');
      if (!cur) throw fail(404, 'ไม่พบคำขอ');
      throw fail(409, 'ยกเลิกได้เฉพาะคำขอที่ยังรอร้านตรวจสอบ');
    }
    res.json({ return: r.toPublic() });
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
    const q = {};
    if (STATUSES.includes(String(req.query.status || ''))) q.status = req.query.status;
    const list = await Return.find(q).sort({ createdAt: -1 }).limit(200).populate('user', 'name email');
    res.json({ returns: list.map((r) => r.toPublic()) });
  } catch (e) {
    sendError(res, e);
  }
});

adminRouter.get('/summary', async (req, res) => {
  try {
    res.json({ pending: await Return.countDocuments({ status: 'pending' }) });
  } catch (e) {
    sendError(res, e);
  }
});

// อนุมัติ/ไม่อนุมัติ (เฉพาะที่ยังรอตรวจสอบ) หรือกด "ดำเนินการเสร็จแล้ว" สำหรับที่อนุมัติแล้ว
adminRouter.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw fail(404, 'ไม่พบคำขอ');
    const cur = await Return.findById(req.params.id);
    if (!cur) throw fail(404, 'ไม่พบคำขอ');
    const body = req.body || {};
    const now = new Date();

    if (body.completed === true) {
      if (cur.status !== 'approved') throw fail(409, 'กดดำเนินการเสร็จได้เฉพาะคำขอที่อนุมัติแล้ว');
      const done = await Return.findOneAndUpdate(
        { _id: cur._id, status: 'approved', completedAt: { $exists: false } },
        { completedAt: now },
        { new: true }
      ).populate('user', 'name email');
      if (!done) throw fail(409, 'คำขอนี้ถูกบันทึกว่าดำเนินการเสร็จแล้ว');
      return res.json({ return: done.toPublic() });
    }

    const next = String(body.status || '');
    if (next !== 'approved' && next !== 'rejected') throw fail(400, 'สถานะไม่ถูกต้อง');
    if (cur.status !== 'pending') throw fail(409, 'คำขอนี้ถูกตัดสินไปแล้ว หรือลูกค้ายกเลิกแล้ว');
    const adminNote = String(body.adminNote || '').trim();
    if (adminNote.length > 500) throw fail(400, 'ข้อความยาวเกิน 500 ตัวอักษร', { field: 'adminNote' });

    const set = { status: next, adminNote, resolvedAt: now };
    if (next === 'approved') {
      const resolution = String(body.resolution || '');
      if (!RESOLUTIONS.includes(resolution)) throw fail(400, 'กรุณาเลือกวิธีดำเนินการ (คืนเงิน/ส่งของใหม่/อื่น ๆ)', { field: 'resolution' });
      set.resolution = resolution;
    } else if (adminNote.length < 3) {
      throw fail(400, 'กรุณาบอกเหตุผลที่ไม่อนุมัติให้ลูกค้าทราบ', { field: 'adminNote' });
    }

    // เงื่อนไข status เดิมกันลูกค้ายกเลิกพร้อมกับที่แอดมินกด
    const updated = await Return.findOneAndUpdate({ _id: cur._id, status: 'pending' }, set, { new: true }).populate('user', 'name email');
    if (!updated) throw fail(409, 'คำขอนี้เพิ่งถูกเปลี่ยนสถานะ กรุณารีเฟรชแล้วลองใหม่');
    res.json({ return: updated.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

// ข้อผิดพลาดจากการรับไฟล์ (เช่น ไฟล์ใหญ่เกิน) ให้ตอบเป็นข้อความไทย
customerRouter.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'รูปใหญ่เกินไป (ไม่เกิน 1 MB) ลองเลือกรูปอื่น' });
  }
  console.error(err);
  res.status(400).json({ error: 'อัปโหลดรูปไม่สำเร็จ' });
});

module.exports = { customerRouter, adminRouter };
