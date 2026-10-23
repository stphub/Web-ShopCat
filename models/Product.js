const mongoose = require('mongoose');

// ค่าที่อนุญาต (หน้าเว็บใช้ชุดเดียวกัน)
const CATEGORIES = ['food', 'treat', 'toy', 'litter', 'home', 'wear'];
const AGES = ['all', 'kitten', 'adult', 'senior'];
const KINDS = ['bag', 'can', 'pouch', 'mouse', 'wand', 'sand', 'box', 'post', 'bed', 'collar', 'fountain'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    nameEn: { type: String, trim: true, maxlength: 120, default: '' }, // ชื่อภาษาอังกฤษ (ไม่บังคับ ถ้าว่างใช้ชื่อไทยแทน)
    cat: { type: String, required: true, enum: CATEGORIES },
    age: { type: String, required: true, enum: AGES, default: 'all' },
    price: { type: Number, required: true, min: 0, max: 1000000 }, // บาท
    was: { type: Number, min: 0, max: 1000000, default: 0 }, // ราคาก่อนลด (0 = ไม่ลด)
    size: { type: String, trim: true, maxlength: 60, default: '' },
    sizeEn: { type: String, trim: true, maxlength: 60, default: '' }, // ขนาด/น้ำหนักภาษาอังกฤษ (ไม่บังคับ)
    kind: { type: String, required: true, enum: KINDS }, // รูปแบบภาพประกอบ
    color: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    stock: { type: Number, required: true, min: 0, max: 100000, default: 0 },
    pop: { type: Number, min: 0, max: 10, default: 5 }, // ลำดับแนะนำ ยิ่งมากยิ่งขึ้นก่อน
    active: { type: Boolean, default: true }, // ปิดไว้ = ซ่อนจากหน้าร้าน
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null }, // รูปสินค้า (ถ้าไม่มีจะใช้ภาพประกอบแทน)
    // รูปเพิ่มเติม (รูปที่ 2 เป็นต้นไป) เรียงตามลำดับที่แสดง รูปหลักอยู่ที่ image
    gallery: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 }, // คะแนนรีวิวเฉลี่ย (คำนวณใหม่ทุกครั้งที่มีรีวิวเปลี่ยน)
    ratingCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

productSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    nameEn: this.nameEn || '',
    cat: this.cat,
    age: this.age,
    price: this.price,
    was: this.was || 0,
    size: this.size,
    sizeEn: this.sizeEn || '',
    kind: this.kind,
    color: this.color,
    stock: this.stock,
    pop: this.pop,
    active: this.active,
    image: this.image ? this.image.toString() : null,
    imageUrl: this.image ? '/api/images/' + this.image : null,
    gallery: (this.gallery || []).map((g) => g.toString()),
    // รูปทั้งหมดเรียงตามลำดับแสดง (รูปหลักก่อน) สำหรับแกลเลอรีและหน้าแอดมิน
    photos: [this.image, ...(this.gallery || [])].filter(Boolean).map((g) => ({ id: g.toString(), url: '/api/images/' + g })),
    ratingAvg: this.ratingAvg || 0,
    ratingCount: this.ratingCount || 0,
  };
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
module.exports.CATEGORIES = CATEGORIES;
module.exports.AGES = AGES;
module.exports.KINDS = KINDS;
