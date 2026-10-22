const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const { requireAuth, requireAdmin, optionalAuth } = require('./auth');
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
router.post('/', limiter, optionalAuth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อ', field: 'name' });
    if (name.length > 80) return res.status(400).json({ error: 'ชื่อยาวเกิน 80 ตัวอักษร', field: 'name' });
    if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง', field: 'email' });
    if (message.length < 5) return res.status(400).json({ error: 'กรุณาพิมพ์ข้อความอย่างน้อย 5 ตัวอักษร', field: 'message' });
    if (message.length > 2000) return res.status(400).json({ error: 'ข้อความยาวเกิน 2000 ตัวอักษร', field: 'message' });

    // เก็บลงฐานข้อมูลก่อนเสมอ แอดมินอ่านได้ที่หน้า "ข้อความ" แม้ส่งอีเมลไม่ได้
    const doc = await Message.create({ name, email, message, user: req.user ? req.user._id : null });

    // แจ้งทางอีเมลเป็นของแถม: ไม่รอผลและไม่ทำให้การส่งล้มเหลว (รอสูงสุด 8 วินาที)
    (async () => {
      try {
        const shop = await getShopInfo();
        const to = process.env.CONTACT_EMAIL || shop.email || process.env.MAIL_FROM || process.env.SMTP_USER;
        if (!to || !process.env.SMTP_HOST) return;
        await Promise.race([
          sendMail({
            to,
            replyTo: email.replace(/[\r\n]/g, ''),
            subject: 'ข้อความจากหน้าติดต่อเรา: ' + name.replace(/[\r\n]/g, ' '),
            text: 'จาก: ' + name + ' <' + email + '>\n\n' + message,
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('หมดเวลา')), 8000)),
        ]);
        await Message.updateOne({ _id: doc._id }, { emailed: true });
      } catch (e) {
        console.error('แจ้งอีเมลข้อความติดต่อไม่สำเร็จ (ข้อความถูกเก็บไว้ในระบบแล้ว):', e.message);
      }
    })();
    res.json({ ok: true, message: 'ส่งข้อความถึงร้านแล้ว ขอบคุณที่ติดต่อ ร้านจะตอบกลับทางอีเมลที่ให้ไว้' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ลูกค้าที่ล็อกอิน: ดูข้อความที่เคยส่งและคำตอบจากร้าน
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const list = await Message.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ messages: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

// ---------- แอดมิน: อ่านและจัดการข้อความ ----------
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/', async (req, res) => {
  try {
    const q = {};
    if (Message.STATUSES.includes(req.query.status)) q.status = req.query.status;
    const list = await Message.find(q).sort({ createdAt: -1 }).limit(200);
    res.json({ messages: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

adminRouter.get('/summary', async (req, res) => {
  try {
    res.json({ unread: await Message.countDocuments({ status: 'new' }) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

adminRouter.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบข้อความ' });
    const status = String(req.body.status || '');
    if (!Message.STATUSES.includes(status)) return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    const m = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!m) return res.status(404).json({ error: 'ไม่พบข้อความ' });
    res.json({ message: m });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

// ตอบข้อความ: เก็บคำตอบไว้ ลูกค้าที่ล็อกอินเห็นในหน้า "บัญชีของฉัน" และลองส่งอีเมลให้ด้วย (ถ้าตั้ง SMTP ไว้)
adminRouter.post('/:id/reply', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบข้อความ' });
    const reply = String(req.body.reply || '').trim();
    if (reply.length < 2) return res.status(400).json({ error: 'กรุณาพิมพ์คำตอบ' });
    if (reply.length > 2000) return res.status(400).json({ error: 'คำตอบยาวเกิน 2000 ตัวอักษร' });
    const m = await Message.findByIdAndUpdate(req.params.id, { reply, repliedAt: new Date(), status: 'replied' }, { new: true });
    if (!m) return res.status(404).json({ error: 'ไม่พบข้อความ' });
    if (process.env.SMTP_HOST) {
      Promise.race([
        sendMail({ to: m.email, subject: 'ตอบกลับจากร้านของแมวเหมียว', text: reply + '\n\n---\nข้อความของคุณ: ' + m.message }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('หมดเวลา')), 8000)),
      ]).catch((e) => console.error('ส่งอีเมลคำตอบไม่สำเร็จ (คำตอบถูกเก็บไว้ในระบบแล้ว):', e.message));
    }
    res.json({ message: m });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

adminRouter.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบข้อความ' });
    await Message.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

module.exports = router;
module.exports.adminRouter = adminRouter;
