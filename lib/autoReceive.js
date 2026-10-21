const Order = require('../models/Order');
const { AUTO_RECEIVE_DAYS } = require('../config/shop');
const { cleanupOrphanReturnImages, cleanupOrphanReviewImages } = require('./returnCleanup');

const DAY_MS = 24 * 60 * 60 * 1000;

// เงื่อนไขหาออเดอร์ที่จัดส่งแล้วเกินกำหนด (ออเดอร์เก่าที่ไม่มี shippedAt ใช้เวลาแก้ไขล่าสุดแทน)
function dueFilter(now = new Date(), days = AUTO_RECEIVE_DAYS) {
  const cutoff = new Date(now.getTime() - days * DAY_MS);
  return {
    status: 'shipped',
    $or: [{ shippedAt: { $lte: cutoff } }, { shippedAt: null, updatedAt: { $lte: cutoff } }],
  };
}

// เปลี่ยนออเดอร์ที่ครบกำหนดเป็น "ได้รับสินค้าแล้ว" คืนจำนวนที่เปลี่ยน
// เงื่อนไข status: 'shipped' อยู่ใน filter ด้วย จึงไม่ชนกับลูกค้าที่กดยืนยันเองพร้อมกัน
async function runAutoReceive(now = new Date()) {
  const r = await Order.updateMany(dueFilter(now), { status: 'received', receivedAt: now, autoReceived: true });
  return r.modifiedCount || 0;
}

// รันตอนเปิดเซิร์ฟเวอร์ และทุกชั่วโมงหลังจากนั้น
function startAutoReceive() {
  const tick = () =>
    runAutoReceive()
      .then((n) => n && console.log('ยืนยันรับสินค้าอัตโนมัติ ' + n + ' ออเดอร์'))
      .catch((e) => console.error('ยืนยันรับสินค้าอัตโนมัติไม่สำเร็จ:', e.message));
  const sweep = () => {
    cleanupOrphanReturnImages().catch((e) => console.error('ล้างรูปหลักฐานที่ไม่ได้ใช้ไม่สำเร็จ:', e.message));
    cleanupOrphanReviewImages().catch((e) => console.error('ล้างรูปรีวิวที่ไม่ได้ใช้ไม่สำเร็จ:', e.message));
  };
  tick();
  sweep();
  setInterval(() => {
    tick();
    sweep();
  }, 60 * 60 * 1000).unref();
}

module.exports = { dueFilter, runAutoReceive, startAutoReceive };
