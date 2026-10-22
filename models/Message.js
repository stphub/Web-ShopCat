const mongoose = require('mongoose');

// ข้อความจากหน้า "ติดต่อเรา" เก็บไว้ในฐานข้อมูลเสมอ (ไม่พึ่งอีเมลที่ Render แพ็กเกจฟรีมักบล็อก)
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 254 },
    message: { type: String, required: true, maxlength: 2000 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new', index: true },
    emailed: { type: Boolean, default: false },
    reply: { type: String, default: '', maxlength: 2000 },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    ret.hasUser = !!ret.user; // ลูกค้าล็อกอินตอนส่งไหม (ตอบในเว็บได้เฉพาะกรณีนี้)
    delete ret.user;
    return ret;
  },
});

messageSchema.statics.STATUSES = ['new', 'read', 'replied'];

module.exports = mongoose.model('Message', messageSchema);
