const express = require('express');
const mongoose = require('mongoose');
const Image = require('../models/Image');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('./auth');

const MAX_BYTES = 1024 * 1024; // 1 MB (หน้าเว็บย่อรูปให้เหลือราว 100-200 KB ก่อนส่ง)

// ตรวจชนิดไฟล์จากไบต์แรกของไฟล์จริง ไม่เชื่อชื่อไฟล์หรือ Content-Type ที่ผู้ใช้ส่งมา
function detectType(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}

// ---------- สาธารณะ: แสดงรูป ----------
const publicRouter = express.Router();
publicRouter.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const img = await Image.findById(req.params.id);
    if (!img || img.kind === 'return' || img.kind === 'slip') return res.status(404).end();
    res.set({
      'Content-Type': img.contentType,
      'Content-Length': String(img.data.length),
      // เปลี่ยนรูป = ได้รหัสใหม่ จึงให้เบราว์เซอร์จำไว้นานได้
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(img.data);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

// ---------- แอดมินเท่านั้น: อัปโหลดรูป ----------
const adminRouter = express.Router();
adminRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_BYTES }),
  async (req, res) => {
    try {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ error: 'ไม่พบไฟล์รูป ส่งได้เฉพาะ JPG, PNG หรือ WebP' });
      }
      const type = detectType(buf);
      if (!type) return res.status(400).json({ error: 'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP' });
      const img = await Image.create({ data: buf, contentType: type, size: buf.length });
      res.status(201).json({ id: img._id.toString(), url: '/api/images/' + img._id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
    }
  }
);

// ลบรูปที่ยังไม่ได้ผูกกับสินค้า (หน้าแอดมินเรียกตอนเปลี่ยนใจก่อนกดบันทึก) ถ้าสินค้าใช้อยู่จะไม่ลบ
adminRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบรูป' });
    if (await Product.exists({ $or: [{ image: req.params.id }, { gallery: req.params.id }] })) {
      return res.status(409).json({ error: 'รูปนี้ถูกใช้กับสินค้าอยู่ ลบไม่ได้' });
    }
    await Image.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ข้อผิดพลาดจากการรับไฟล์ (เช่น ไฟล์ใหญ่เกิน) ให้ตอบเป็นข้อความไทย
adminRouter.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'รูปใหญ่เกินไป (ไม่เกิน 1 MB) ลองเลือกรูปอื่น' });
  }
  console.error(err);
  res.status(400).json({ error: 'อัปโหลดรูปไม่สำเร็จ' });
});

module.exports = { publicRouter, adminRouter, detectType };
