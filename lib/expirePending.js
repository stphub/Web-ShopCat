const Order = require('../models/Order');
const Product = require('../models/Product');
const Image = require('../models/Image');

// ยกเลิกออเดอร์ที่หมดเวลาชำระเงินและยังไม่ได้แนบสลิป พร้อมคืนสต็อก
// เงื่อนไข status/payExpiresAt/ไม่มีสลิป อยู่ใน filter ของแต่ละออเดอร์ จึงไม่ชนกับลูกค้าที่แนบสลิปหรือแอดมินที่เปลี่ยนสถานะพร้อมกัน
// ออเดอร์เก่าที่ไม่มี payExpiresAt จะไม่ถูกยกเลิกอัตโนมัติ
async function expireUnpaid(now = new Date()) {
  const due = await Order.find({
    status: 'pending',
    payExpiresAt: { $lte: now },
    $or: [{ 'slip.image': { $exists: false } }, { 'slip.image': null }],
  }).select('_id');
  let n = 0;
  for (const d of due) {
    const o = await Order.findOneAndUpdate(
      {
        _id: d._id,
        status: 'pending',
        payExpiresAt: { $lte: now },
        $or: [{ 'slip.image': { $exists: false } }, { 'slip.image': null }],
      },
      { status: 'cancelled', cancelledAt: now, cancelReason: 'timeout' },
      { new: true }
    );
    if (!o) continue;
    n += 1;
    await Promise.all(o.items.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })));
  }
  return n;
}

// ตรวจทุก 20 วินาที (นอกจากนี้หน้าที่ดึงรายการออเดอร์จะเรียกตรวจก่อนทุกครั้ง จึงยกเลิกทันทีเมื่อครบเวลา)
function startExpireSweep() {
  const tick = () =>
    expireUnpaid()
      .then((n) => n && console.log('ยกเลิกออเดอร์ที่หมดเวลาชำระเงิน ' + n + ' ออเดอร์'))
      .catch((e) => console.error('ยกเลิกออเดอร์หมดเวลาไม่สำเร็จ:', e.message));
  tick();
  setInterval(tick, 20 * 1000).unref();
}

module.exports = { expireUnpaid, startExpireSweep };
