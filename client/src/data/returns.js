// ป้ายและตัวเลือกของระบบแจ้งคืน/เปลี่ยนสินค้า (ต้องตรงกับค่าใน models/Return.js ฝั่งเซิร์ฟเวอร์)
export const REASONS = [
  ['damaged', 'สินค้าเสียหาย'],
  ['wrong_item', 'ได้รับสินค้าไม่ตรงกับที่สั่ง'],
  ['missing', 'ได้รับสินค้าไม่ครบ'],
  ['other', 'อื่น ๆ'],
];
export const REASON_LABEL = Object.fromEntries(REASONS);

export const RETURN_STATUS = {
  pending: 'รอร้านตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
  withdrawn: 'ยกเลิกคำขอแล้ว',
};

export const RESOLUTIONS = [
  ['refund', 'คืนเงิน'],
  ['replace', 'ส่งสินค้าใหม่ / เปลี่ยนสินค้า'],
  ['other', 'อื่น ๆ (ร้านจะติดต่อกลับ)'],
];
export const RESOLUTION_LABEL = Object.fromEntries(RESOLUTIONS);

export const MAX_PHOTOS = 4;
