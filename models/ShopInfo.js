const mongoose = require('mongoose');

// ข้อมูลติดต่อของร้าน มีเอกสารเดียว (key = 'shop') แอดมินแก้ได้จากหน้า "ตั้งค่าร้าน"
const FIELDS = ['phone', 'lineId', 'email', 'facebook', 'address', 'hours', 'promptpayId', 'promptpayName'];

const shopInfoSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'shop', unique: true },
    phone: { type: String, default: '', maxlength: 30 },
    lineId: { type: String, default: '', maxlength: 40 },
    email: { type: String, default: '', maxlength: 254 },
    facebook: { type: String, default: '', maxlength: 300 },
    address: { type: String, default: '', maxlength: 400 },
    hours: { type: String, default: '', maxlength: 200 },
    // รับเงินผ่าน PromptPay: เบอร์โทร 10 หลัก / เลขบัตรประชาชน-ภาษี 13 หลัก / e-Wallet 15 หลัก และชื่อบัญชีที่แสดงให้ลูกค้าเช็ก
    promptpayId: { type: String, default: '', maxlength: 20 },
    promptpayName: { type: String, default: '', maxlength: 80 },
  },
  { timestamps: true }
);

const ShopInfo = mongoose.model('ShopInfo', shopInfoSchema);

// อ่านข้อมูลร้าน (ยังไม่เคยตั้งค่า = ช่องว่างทั้งหมด)
async function getShopInfo() {
  const d = await ShopInfo.findOne({ key: 'shop' }).lean();
  const out = {};
  FIELDS.forEach((f) => {
    out[f] = (d && d[f]) || '';
  });
  return out;
}

module.exports = ShopInfo;
module.exports.getShopInfo = getShopInfo;
module.exports.FIELDS = FIELDS;
