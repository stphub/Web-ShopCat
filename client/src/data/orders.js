import { currentLocale } from '../i18n';

// ป้ายสถานะออเดอร์ (ข้อความไทยเป็นคีย์ ตอนแสดงให้ครอบด้วย t(ORDER_STATUS[x])) และตัวช่วยแสดงวันเวลาตามภาษาที่เลือก
export const ORDER_STATUS = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  shipped: 'จัดส่งแล้ว',
  received: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

// ป้ายสถานะที่คำนึงถึงวิธีชำระเงิน: ออเดอร์เก็บเงินปลายทางที่ยังไม่ยืนยันคือ "รอร้านยืนยัน" ไม่ใช่ "รอชำระเงิน"
export function orderStatusLabel(o) {
  if (o.payMethod === 'cod') {
    if (o.status === 'pending') return 'รอร้านยืนยันออเดอร์';
    if (o.status === 'paid') return 'ร้านยืนยันแล้ว เตรียมจัดส่ง';
  }
  return ORDER_STATUS[o.status];
}

export function fmtDateTime(v) {
  try {
    return new Date(v).toLocaleString(currentLocale(), { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });
  } catch {
    return '';
  }
}

export function fmtDate(v) {
  try {
    return new Date(v).toLocaleDateString(currentLocale(), { dateStyle: 'medium', timeZone: 'Asia/Bangkok' });
  } catch {
    return '';
  }
}
