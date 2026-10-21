const mongoose = require('mongoose');
const { AUTO_RECEIVE_DAYS, RETURN_WINDOW_DAYS, PAY_WINDOW_MINUTES } = require('../config/shop');

// pending = รอชำระเงิน, paid = ร้านยืนยันชำระเงินแล้ว, shipped = ร้านจัดส่งแล้ว,
// received = ลูกค้ากดยืนยันรับสินค้าแล้ว (ถึงจะรีวิวได้), cancelled = ยกเลิก
const STATUSES = ['pending', 'paid', 'shipped', 'received', 'cancelled'];

// เก็บสำเนาข้อมูลสินค้า ณ ตอนสั่งซื้อ (ชื่อ ราคา) เพื่อให้ออเดอร์เก่าไม่เปลี่ยนเมื่อสินค้าถูกแก้ไขหรือลบภายหลัง
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    kind: String,
    color: String,
    imageUrl: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    address: {
      name: { type: String, required: true },
      tel: { type: String, required: true },
      line: { type: String, required: true },
    },
    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    tracking: { type: String, maxlength: 60, default: '' },
    paidAt: Date,
    shippedAt: Date,
    receivedAt: Date,
    autoReceived: { type: Boolean, default: false }, // true = ระบบยืนยันรับสินค้าให้อัตโนมัติ
    cancelledAt: Date,
    // ต้องชำระ (แนบสลิป) ก่อนเวลานี้ ไม่งั้นถูกยกเลิกอัตโนมัติ ('timeout' = ยกเลิกเพราะหมดเวลา)
    payExpiresAt: Date,
    cancelReason: { type: String, default: '' },
    // สลิปโอนเงินที่ลูกค้าแนบ (รูปเก็บใน Image kind='slip') และข้อความเมื่อแอดมินปฏิเสธสลิป
    slip: {
      image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
      at: Date,
      rejectNote: { type: String, maxlength: 200, default: '' },
    },
  },
  { timestamps: true }
);

// ใช้ตรวจว่าผู้ใช้เคยซื้อสินค้านี้ (ออเดอร์ที่ชำระแล้ว/จัดส่งแล้ว) ก่อนให้รีวิว
orderSchema.index({ user: 1, status: 1, 'items.product': 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.methods.toPublic = function () {
  const o = this.toObject();
  const u = this.populated('user') ? this.user : null;
  return {
    id: String(o._id),
    orderNo: o.orderNo,
    items: o.items.map((i) => ({
      product: String(i.product),
      name: i.name,
      price: i.price,
      qty: i.qty,
      kind: i.kind,
      color: i.color,
      imageUrl: i.imageUrl || null,
    })),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    address: o.address,
    status: o.status,
    tracking: o.tracking || '',
    createdAt: o.createdAt,
    paidAt: o.paidAt || null,
    shippedAt: o.shippedAt || null,
    receivedAt: o.receivedAt || null,
    autoReceived: !!o.autoReceived,
    // แจ้งคืน/เปลี่ยนสินค้าได้ถึงวันที่นี้ (เฉพาะออเดอร์ที่ลูกค้ารับแล้ว)
    returnUntil: o.status === 'received' && o.receivedAt ? new Date(new Date(o.receivedAt).getTime() + RETURN_WINDOW_DAYS * 86400000) : null,
    // วันที่ระบบจะยืนยันรับสินค้าให้เอง (เฉพาะออเดอร์ที่จัดส่งแล้วและยังไม่ถูกยืนยัน)
    autoReceiveAt: o.status === 'shipped' && o.shippedAt ? new Date(new Date(o.shippedAt).getTime() + AUTO_RECEIVE_DAYS * 86400000) : null,
    cancelledAt: o.cancelledAt || null,
    // เวลาที่เหลือให้ชำระ (วินาที) คิดฝั่งเซิร์ฟเวอร์เพื่อไม่ให้นาฬิกาเครื่องลูกค้าคลาดเคลื่อน (null = ไม่นับถอยหลัง)
    payRemainingSec:
      o.status === 'pending' && o.payExpiresAt && !(o.slip && o.slip.image)
        ? Math.max(0, Math.ceil((new Date(o.payExpiresAt).getTime() - Date.now()) / 1000))
        : null,
    cancelledByTimeout: o.status === 'cancelled' && o.cancelReason === 'timeout',
    hasSlip: !!(o.slip && o.slip.image),
    slipAt: (o.slip && o.slip.at) || null,
    slipRejectNote: (o.slip && o.slip.rejectNote) || '',
    customer: u ? { name: u.name, email: u.email } : undefined,
  };
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
module.exports.STATUSES = STATUSES;
