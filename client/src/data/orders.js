import { currentLocale } from '../i18n';

// ป้ายสถานะออเดอร์ (ข้อความไทยเป็นคีย์ ตอนแสดงให้ครอบด้วย t(ORDER_STATUS[x])) และตัวช่วยแสดงวันเวลาตามภาษาที่เลือก
export const ORDER_STATUS = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  shipped: 'จัดส่งแล้ว',
  received: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

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
