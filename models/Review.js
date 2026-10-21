const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    // รูปแนบรีวิว (รหัสรูปในคอลเลกชัน Image kind='review') ไม่เกิน 3 รูป
    photos: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }], default: [] },
    comment: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// หนึ่งคนรีวิวสินค้าหนึ่งชิ้นได้ครั้งเดียว (รีวิวใหม่จะแทนที่ของเดิม)
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

// แสดงชื่อแบบปิดบังบางส่วนต่อสาธารณะ เช่น "สมชาย" -> "สม***"
function maskName(name) {
  const chars = Array.from(String(name || '').trim());
  if (chars.length === 0) return 'ลูกค้า';
  return chars.slice(0, Math.min(2, chars.length)).join('') + '***';
}

reviewSchema.methods.toPublic = function (viewerId) {
  return {
    id: this._id.toString(),
    rating: this.rating,
    comment: this.comment,
    photos: (this.photos || []).map((id) => ({ id: String(id), url: '/api/images/' + id })),
    name: maskName(this.userName),
    createdAt: this.createdAt,
    mine: !!viewerId && String(this.user) === String(viewerId),
  };
};

module.exports = mongoose.model('Review', reviewSchema);
