const mongoose = require('mongoose');

// pending = รอร้านตรวจสอบ, approved = ร้านอนุมัติ (ร้านคืนเงิน/ส่งของใหม่ แล้วกดว่าดำเนินการเสร็จ),
// rejected = ร้านไม่อนุมัติ (ต้องมีข้อความอธิบาย), withdrawn = ลูกค้ายกเลิกคำขอเอง
const STATUSES = ['pending', 'approved', 'rejected', 'withdrawn'];
const REASONS = ['damaged', 'wrong_item', 'missing', 'other'];
const RESOLUTIONS = ['refund', 'replace', 'other'];

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNo: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    reason: { type: String, enum: REASONS, required: true },
    detail: { type: String, default: '', maxlength: 1000 },
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    adminNote: { type: String, default: '', maxlength: 500 },
    resolution: { type: String, enum: RESOLUTIONS },
    resolvedAt: Date, // เวลาที่ร้านอนุมัติ/ไม่อนุมัติ
    completedAt: Date, // เวลาที่ร้านดำเนินการเสร็จ (คืนเงินหรือส่งของใหม่แล้ว)
  },
  { timestamps: true }
);

returnSchema.methods.toPublic = function () {
  const r = this.toObject();
  const u = this.populated('user') ? this.user : null;
  return {
    id: String(r._id),
    order: String(r.order && r.order._id ? r.order._id : r.order),
    orderNo: r.orderNo,
    items: r.items.map((i) => ({ product: String(i.product), name: i.name, qty: i.qty })),
    reason: r.reason,
    detail: r.detail || '',
    photos: (r.photos || []).map((id) => '/api/returns/images/' + id),
    status: r.status,
    adminNote: r.adminNote || '',
    resolution: r.resolution || null,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt || null,
    completedAt: r.completedAt || null,
    customer: u ? { name: u.name, email: u.email } : undefined,
  };
};

const Return = mongoose.model('Return', returnSchema);
module.exports = Return;
module.exports.STATUSES = STATUSES;
module.exports.REASONS = REASONS;
module.exports.RESOLUTIONS = RESOLUTIONS;
