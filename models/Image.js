const mongoose = require('mongoose');

// รูปสินค้าเก็บเป็นข้อมูลไบนารีในคอลเลกชันแยก เพื่อไม่ให้รายการสินค้าหนักตามไปด้วย
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
    size: { type: Number, required: true },
    // 'product' = รูปสินค้า (เปิดดูได้ทุกคน), 'slip' = สลิปโอนเงิน (เจ้าของออเดอร์และแอดมินเท่านั้น), 'avatar' = รูปโปรไฟล์ผู้ใช้, 'review' = รูปแนบรีวิว (เปิดดูได้ทุกคน), 'return' = รูปหลักฐานคืนสินค้า (เจ้าของและแอดมินเท่านั้น)
    kind: { type: String, enum: ['product', 'return', 'avatar', 'review', 'slip'], default: 'product' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
