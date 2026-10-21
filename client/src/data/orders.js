// ป้ายสถานะออเดอร์ (แสดงเป็นข้อความเสมอ ไม่พึ่งสีอย่างเดียว) และตัวช่วยแสดงวันเวลาแบบไทย
export const ORDER_STATUS = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  shipped: 'จัดส่งแล้ว',
  received: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

export function fmtDateTime(v) {
  try {
    return new Date(v).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });
  } catch {
    return '';
  }
}

export function fmtDate(v) {
  try {
    return new Date(v).toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' });
  } catch {
    return '';
  }
}
