const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Image = require('../models/Image');
const Review = require('../models/Review');
const { requireAuth, requireAdmin } = require('./auth');
const Wishlist = require('../models/Wishlist');
const { FREE_SHIPPING_FROM, SHIPPING_FEE, RETURN_WINDOW_DAYS, PAY_WINDOW_MINUTES, MAX_GALLERY } = require('../config/shop');

const { CATEGORIES, AGES, KINDS } = Product;

// ---------- ตรวจข้อมูลที่แอดมินส่งมา ----------
function isInt(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
}

function parseProduct(body) {
  const b = body || {};
  const data = {
    name: String(b.name || '').trim(),
    nameEn: String(b.nameEn || '').trim(),
    cat: String(b.cat || ''),
    age: String(b.age || 'all'),
    price: b.price === '' || b.price == null ? NaN : Number(b.price),
    was: b.was === '' || b.was == null ? 0 : Number(b.was),
    size: String(b.size || '').trim(),
    sizeEn: String(b.sizeEn || '').trim(),
    kind: String(b.kind || ''),
    color: String(b.color || ''),
    stock: b.stock === '' || b.stock == null ? NaN : Number(b.stock),
    pop: b.pop === '' || b.pop == null ? 5 : Number(b.pop),
    active: b.active === undefined ? true : Boolean(b.active),
    image: b.image ? String(b.image) : null,
    gallery: Array.isArray(b.gallery) ? b.gallery.map(String) : [],
  };
  let error = null;
  if (!data.name || data.name.length > 120) error = ['name', 'กรุณากรอกชื่อสินค้า (ไม่เกิน 120 ตัวอักษร)'];
  else if (data.nameEn.length > 120) error = ['nameEn', 'ชื่อภาษาอังกฤษยาวเกิน 120 ตัวอักษร'];
  else if (!CATEGORIES.includes(data.cat)) error = ['cat', 'เลือกหมวดสินค้า'];
  else if (!AGES.includes(data.age)) error = ['age', 'เลือกวัยแมว'];
  else if (!isInt(data.price, 0, 1000000)) error = ['price', 'ราคาต้องเป็นจำนวนเต็มบาท 0 ถึง 1,000,000'];
  else if (!isInt(data.was, 0, 1000000)) error = ['was', 'ราคาก่อนลดต้องเป็นจำนวนเต็มบาท'];
  else if (data.was > 0 && data.was <= data.price) error = ['was', 'ราคาก่อนลดต้องมากกว่าราคาขาย (หรือเว้นว่างถ้าไม่ลดราคา)'];
  else if (data.size.length > 60) error = ['size', 'ขนาด/น้ำหนักยาวเกิน 60 ตัวอักษร'];
  else if (data.sizeEn.length > 60) error = ['sizeEn', 'ขนาด/น้ำหนักภาษาอังกฤษยาวเกิน 60 ตัวอักษร'];
  else if (!KINDS.includes(data.kind)) error = ['kind', 'เลือกรูปแบบภาพประกอบ'];
  else if (!/^#[0-9a-fA-F]{6}$/.test(data.color)) error = ['color', 'สีต้องเป็นรหัส เช่น #f08a24'];
  else if (!isInt(data.stock, 0, 100000)) error = ['stock', 'จำนวนสต็อกต้องเป็นจำนวนเต็ม 0 ขึ้นไป'];
  else if (!isInt(data.pop, 0, 10)) error = ['pop', 'ลำดับแนะนำต้องเป็นเลข 0 ถึง 10'];
  else if (data.image && !mongoose.isValidObjectId(data.image)) error = ['image', 'รูปภาพไม่ถูกต้อง'];
  else if (data.gallery.length > MAX_GALLERY) error = ['image', 'ใส่รูปได้สูงสุด ' + (MAX_GALLERY + 1) + ' รูปต่อสินค้า'];
  else if (!data.gallery.every((g) => mongoose.isValidObjectId(g))) error = ['image', 'รูปภาพไม่ถูกต้อง'];
  else if (new Set([...data.gallery, ...(data.image ? [data.image] : [])]).size !== data.gallery.length + (data.image ? 1 : 0)) error = ['image', 'มีรูปซ้ำกัน'];
  else if (!data.image && data.gallery.length > 0) error = ['image', 'ต้องมีรูปหลักก่อนจึงใส่รูปเพิ่มเติมได้'];
  return { data, error };
}

// รูปทุกใบ (หลัก + เพิ่มเติม) ต้องมีอยู่จริงและเป็นรูปสินค้า (ไม่ใช่รูปหลักฐานคืนสินค้า)
async function imagesExist(data) {
  const ids = [...(data.image ? [data.image] : []), ...data.gallery];
  if (ids.length === 0) return true;
  return (await Image.countDocuments({ _id: { $in: ids }, kind: { $ne: 'return' } })) === ids.length;
}

function sendError(res, e) {
  console.error(e);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
}

// ---------- สาธารณะ: หน้าร้านเรียกดูสินค้า ----------
const publicRouter = express.Router();
publicRouter.get('/', async (req, res) => {
  try {
    const list = await Product.find({ active: true }).sort({ pop: -1, createdAt: 1 });
    res.json({
      products: list.map((p) => p.toPublic()),
      // ค่าส่งที่เซิร์ฟเวอร์ใช้คิดเงินจริง หน้าเว็บใช้แสดงผลให้ตรงกัน
      shipping: { freeFrom: FREE_SHIPPING_FROM, fee: SHIPPING_FEE },
      returnDays: RETURN_WINDOW_DAYS,
      payMinutes: PAY_WINDOW_MINUTES,
    });
  } catch (e) {
    sendError(res, e);
  }
});

// ---------- แอดมินเท่านั้น ----------
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/', async (req, res) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 });
    res.json({ products: list.map((p) => p.toPublic()) });
  } catch (e) {
    sendError(res, e);
  }
});

adminRouter.post('/', async (req, res) => {
  try {
    const { data, error } = parseProduct(req.body);
    if (error) return res.status(400).json({ field: error[0], error: error[1] });
    if (!(await imagesExist(data))) {
      return res.status(400).json({ field: 'image', error: 'ไม่พบรูปที่อัปโหลดไว้ ลองอัปโหลดใหม่' });
    }
    const p = await Product.create(data);
    res.status(201).json({ product: p.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

adminRouter.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    const { data, error } = parseProduct(req.body);
    if (error) return res.status(400).json({ field: error[0], error: error[1] });
    const before = await Product.findById(req.params.id);
    if (!before) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    if (!(await imagesExist(data))) {
      return res.status(400).json({ field: 'image', error: 'ไม่พบรูปที่อัปโหลดไว้ ลองอัปโหลดใหม่' });
    }
    const p = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    // รูปที่ถูกเปลี่ยนหรือถอดออก: ลบจากฐานข้อมูล ไม่ให้ค้างเปลืองพื้นที่
    const keep = new Set([...(data.image ? [data.image] : []), ...data.gallery]);
    const gone = [before.image, ...(before.gallery || [])].filter((id) => id && !keep.has(String(id)));
    if (gone.length) await Image.deleteMany({ _id: { $in: gone } });
    res.json({ product: p.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

adminRouter.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    const imgs = [p.image, ...(p.gallery || [])].filter(Boolean);
    if (imgs.length) await Image.deleteMany({ _id: { $in: imgs } });
    await Wishlist.deleteMany({ product: p._id });
    await Review.deleteMany({ product: p._id }); // รีวิวของสินค้าที่ถูกลบไม่เหลือค้าง (ออเดอร์เก่ายังเก็บสำเนาชื่อ/ราคาไว้)
    res.json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
});

module.exports = { publicRouter, adminRouter };
