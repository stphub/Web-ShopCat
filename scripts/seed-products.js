// ใส่สินค้าตัวอย่างลงฐานข้อมูล: npm run seed
// ถ้ามีสินค้าอยู่แล้วจะไม่ทำอะไร (ใส่ --force เพื่อใส่เพิ่มทั้งชุดอีกครั้ง)
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const seed = require('../data/seedProducts');

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('ไม่พบ MONGODB_URI ในไฟล์ .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Product.countDocuments();
  if (count > 0 && !process.argv.includes('--force')) {
    console.log('มีสินค้าอยู่แล้ว ' + count + ' รายการ ไม่ได้เพิ่มอะไร (ใช้ --force ถ้าต้องการเพิ่มชุดตัวอย่างซ้ำ)');
  } else {
    await Product.insertMany(seed);
    console.log('เพิ่มสินค้าตัวอย่าง ' + seed.length + ' รายการแล้ว');
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
