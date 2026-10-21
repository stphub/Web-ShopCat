// ตั้งผู้ใช้เป็นแอดมิน: npm run make-admin -- อีเมล@ที่สมัครไว้แล้ว
// (ต้องสมัครสมาชิกในเว็บด้วยอีเมลนั้นก่อน) ใส่ --remove ท้ายคำสั่งเพื่อถอนสิทธิ์
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email || email.startsWith('--')) {
    console.error('วิธีใช้: npm run make-admin -- อีเมล@ที่สมัครไว้แล้ว');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('ไม่พบ MONGODB_URI ในไฟล์ .env');
    process.exit(1);
  }
  const role = process.argv.includes('--remove') ? 'user' : 'admin';
  await mongoose.connect(process.env.MONGODB_URI);
  const u = await User.findOneAndUpdate({ email }, { role }, { new: true });
  console.log(u ? 'ตั้ง ' + u.email + ' เป็น ' + u.role + ' แล้ว' : 'ไม่พบผู้ใช้อีเมลนี้ สมัครสมาชิกในเว็บก่อน');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
