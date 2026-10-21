const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Image = require('../models/Image');
const { requireAuth } = require('./auth');
const { detectType } = require('./images');

const router = express.Router();
router.use(requireAuth);

const MAX_AVATAR_BYTES = 512 * 1024; // หน้าเว็บย่อเป็นรูปจัตุรัสเล็ก ๆ ก่อนส่ง (ราว 20-60 KB)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'แก้โปรไฟล์ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// แก้ชื่อและชื่อเล่น (ชื่อเล่นว่าง = ลบทิ้ง)
router.put('/', limiter, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const nickname = String(req.body.nickname || '').trim();
    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อ', field: 'name' });
    if (name.length > 80) return res.status(400).json({ error: 'ชื่อยาวเกิน 80 ตัวอักษร', field: 'name' });
    if (nickname.length > 30) return res.status(400).json({ error: 'ชื่อเล่นยาวเกิน 30 ตัวอักษร', field: 'nickname' });
    const update = nickname ? { name, nickname } : { name, $unset: { nickname: 1 } };
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ user: user.toPublic() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// อัปโหลดรูปโปรไฟล์ (แทนรูปเดิม และลบรูปเก่าทิ้ง)
router.post(
  '/avatar',
  limiter,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_AVATAR_BYTES }),
  async (req, res) => {
    try {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ error: 'ไม่พบไฟล์รูป ส่งได้เฉพาะ JPG, PNG หรือ WebP' });
      }
      const type = detectType(buf);
      if (!type) return res.status(400).json({ error: 'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP' });
      const img = await Image.create({ data: buf, contentType: type, size: buf.length, kind: 'avatar', owner: req.user._id });
      const before = await User.findByIdAndUpdate(req.user._id, { avatar: img._id }, { new: false });
      if (before && before.avatar) await Image.deleteOne({ _id: before.avatar, kind: 'avatar', owner: req.user._id });
      const user = await User.findById(req.user._id);
      res.json({ user: user.toPublic() });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
    }
  }
);

// ลบรูปโปรไฟล์ (กลับไปใช้รูป Google ถ้ามี ไม่งั้นใช้ตัวอักษรแรกของชื่อ)
router.delete('/avatar', limiter, async (req, res) => {
  try {
    const before = await User.findByIdAndUpdate(req.user._id, { $unset: { avatar: 1 } }, { new: false });
    if (before && before.avatar) await Image.deleteOne({ _id: before.avatar, kind: 'avatar', owner: req.user._id });
    const user = await User.findById(req.user._id);
    res.json({ user: user.toPublic() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ข้อผิดพลาดจากการรับไฟล์ (เช่นไฟล์ใหญ่เกิน)
router.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'รูปใหญ่เกินไป ลองเลือกรูปอื่น' });
  console.error(err);
  res.status(400).json({ error: 'อัปโหลดรูปไม่สำเร็จ' });
});

module.exports = router;
