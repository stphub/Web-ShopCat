const express = require('express');
const ShopInfo = require('../models/ShopInfo');
const { getShopInfo, FIELDS } = ShopInfo;
const { requireAuth, requireAdmin } = require('./auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { phone: 30, lineId: 40, email: 254, facebook: 300, address: 400, hours: 200, promptpayId: 20, promptpayName: 80 };
const LABELS = { phone: 'เบอร์โทร', lineId: 'LINE ID', email: 'อีเมล', facebook: 'ลิงก์ Facebook', address: 'ที่อยู่', hours: 'เวลาทำการ', promptpayId: 'เลข PromptPay', promptpayName: 'ชื่อบัญชี PromptPay' };

const publicRouter = express.Router();
const adminRouter = express.Router();

// ใครก็ดูได้ (หน้า "ติดต่อเรา" ใช้)
publicRouter.get('/', async (req, res) => {
  try {
    res.json({ info: await getShopInfo() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// เฉพาะแอดมิน: บันทึกข้อมูลร้าน (ช่องที่เว้นว่างคือไม่แสดงในหน้าเว็บ)
adminRouter.put('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = {};
    for (const f of FIELDS) {
      // ที่อยู่/เวลาทำการให้ขึ้นบรรทัดใหม่ได้ ช่องอื่นเป็นบรรทัดเดียว
      let v = String(req.body[f] === undefined || req.body[f] === null ? '' : req.body[f]).trim();
      if (f !== 'address' && f !== 'hours') v = v.replace(/[\r\n]+/g, ' ');
      if (v.length > LIMITS[f]) return res.status(400).json({ field: f, error: LABELS[f] + 'ยาวเกิน ' + LIMITS[f] + ' ตัวอักษร' });
      data[f] = v;
    }
    // PromptPay: เก็บเฉพาะตัวเลข (ตัดขีด/ช่องว่าง) ต้องเป็นเบอร์ 10 หลัก, เลข 13 หลัก หรือ e-Wallet 15 หลัก
    if (data.promptpayId) {
      const digits = data.promptpayId.replace(/[\s-]/g, '');
      if (!/^\d+$/.test(digits) || ![10, 13, 15].includes(digits.length) || (digits.length === 10 && !digits.startsWith('0'))) {
        return res.status(400).json({ field: 'promptpayId', error: 'เลข PromptPay ต้องเป็นเบอร์โทร 10 หลัก (ขึ้นต้น 0), เลขบัตร/ภาษี 13 หลัก หรือ e-Wallet 15 หลัก' });
      }
      data.promptpayId = digits;
    }
    if (data.email && !EMAIL_RE.test(data.email)) return res.status(400).json({ field: 'email', error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    if (data.facebook && !/^https?:\/\/\S+$/i.test(data.facebook)) {
      return res.status(400).json({ field: 'facebook', error: 'ลิงก์ Facebook ต้องขึ้นต้นด้วย https://' });
    }
    await ShopInfo.findOneAndUpdate({ key: 'shop' }, { $set: data, $setOnInsert: { key: 'shop' } }, { upsert: true, new: true });
    res.json({ info: await getShopInfo() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

module.exports = { publicRouter, adminRouter };
