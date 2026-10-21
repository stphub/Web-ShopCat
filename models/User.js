const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // เก็บอีเมลเป็นตัวพิมพ์เล็กเสมอ และห้ามซ้ำกันด้วย unique index
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    // เก็บเฉพาะค่าแฮชของรหัสผ่าน ไม่เก็บรหัสผ่านจริง (บัญชีที่สมัครด้วย Google ไม่มีรหัสผ่าน)
    passwordHash: { type: String, select: false, required: function () { return !this.googleId; } },
    // รหัสผู้ใช้ของ Google (sub) ใช้จับคู่บัญชีตอนล็อกอินด้วย Google
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String, maxlength: 500 },
    // ชื่อเล่น (แสดงแทนชื่อจริงบนหน้าเว็บ) และรูปโปรไฟล์ที่อัปโหลดเอง (รหัสรูปในคอลเลกชัน Image)
    nickname: { type: String, trim: true, maxlength: 30 },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    // สิทธิ์ผู้ใช้ ตั้งเป็น admin ได้ผ่านคำสั่ง npm run make-admin เท่านั้น
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // ลิงก์รีเซ็ตรหัสผ่าน: เก็บเฉพาะค่าแฮชของ token และเวลาหมดอายุ (ไม่เก็บ token จริง)
    // คำถามความปลอดภัย: เก็บ id คำถามและแฮชของคำตอบ + ตัวนับตอบผิด/เวลาล็อก
    secQ: { type: String },
    secAHash: { type: String, select: false },
    secFails: { type: Number, default: 0, select: false },
    secLockUntil: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  // รูปที่อัปโหลดเองมาก่อนรูปจาก Google
  const picture = this.avatar ? '/api/images/' + this.avatar : this.picture || null;
  return { id: this._id.toString(), name: this.name, nickname: this.nickname || '', email: this.email, picture, hasAvatar: !!this.avatar, role: this.role || 'user', hasSecQ: !!this.secQ };
};

module.exports = mongoose.model('User', userSchema);
