const mongoose = require('mongoose');

// รายการโปรด: หนึ่งแถวต่อหนึ่งคู่ (ผู้ใช้, สินค้า) กันซ้ำด้วย unique index
const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
