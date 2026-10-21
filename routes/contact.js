const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendMail } = require('../lib/mailer');
const { getShopInfo } = require('../models/ShopInfo');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// กันคนส่งข้อความรบกวนร้านรัว ๆ
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'ส่งข้อความหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// ฟอร์มติดต่อร้าน: ส่งข้อความไปที่อีเมลร้าน (CONTACT_EMAIL ใน .env)
router.post('/', limiter, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อ', field: 'name' });
    if (name.length > 80) return res.status(400).json({ error: 'ชื่อยาวเกิน 80 ตัวอักษร', field: 'name' });
    if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง', field: 'email' });
    if (message.length < 5) return res.status(400).json({ error: 'กรุณาพิมพ์ข้อความอย่างน้อย 5 ตัวอักษร', field: 'message' });
    if (message.length > 2000) return res.status(400).json({ error: 'ข้อความยาวเกิน 2000 ตัวอักษร', field: 'message' });

    // ผู้รับ: CONTACT_EMAIL ใน .env → อีเมลร้านที่แอดมินตั้งในหน้า "ตั้งค่าร้าน" → MAIL_FROM → SMTP_USER
    const shop = await getShopInfo();
    const to = process.env.CONTACT_EMAIL || shop.email || process.env.MAIL_FROM || process.env.SMTP_USER || 'ยังไม่ได้ตั้งอีเมลร้าน';
    try {
      // ตัดขึ้นบรรทัดใหม่ออกจากชื่อ/อีเมล กันการแทรกหัวอีเมล
      await sendMail({
        to,
        replyTo: email.replace(/[\r\n]/g, ''),
        subject: 'ข้อความจากหน้าติดต่อเรา: ' + name.replace(/[\r\n]/g, ' '),
        text: 'จาก: ' + name + ' <' + email + '>\n\n' + message,
      });
    } catch (e) {
      console.error('ส่งข้อความติดต่อไม่สำเร็จ:', e.message);
      return res.status(502).json({ error: 'ส่งข้อความไม่สำเร็จ ลองใหม่อีกครั้งหรือติดต่อทางช่องทางอื่น' });
    }
    res.json({ ok: true, message: 'ส่งข้อความถึงร้านแล้ว ขอบคุณที่ติดต่อ ร้านจะตอบกลับทางอีเมลที่ให้ไว้' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

module.exports = router;
