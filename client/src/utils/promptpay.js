// สร้างข้อความสำหรับ QR PromptPay (มาตรฐาน EMVCo / Thai QR Payment) ใช้สแกนด้วยแอปธนาคารได้จริง
// id = เบอร์โทร 10 หลัก (0xxxxxxxxx) / เลขบัตรประชาชน-ภาษี 13 หลัก / e-Wallet 15 หลัก
// amount = ยอดเงินบาท (ไม่ใส่ = QR ไม่ระบุยอด ให้ลูกค้ากรอกเอง)

const tlv = (tag, value) => tag + String(value.length).padStart(2, '0') + value;

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) ตามที่มาตรฐาน EMVCo กำหนด
export function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function promptPayPayload(id, amount) {
  const digits = String(id || '').replace(/[\s-]/g, '');
  let subTag;
  let target;
  if (digits.length === 10 && digits.startsWith('0')) {
    subTag = '01';
    target = '0066' + digits.slice(1); // เบอร์โทรต้องแปลงเป็นรูปแบบสากล 0066 + เลขไม่รวม 0 นำหน้า
  } else if (digits.length === 13) {
    subTag = '02';
    target = digits;
  } else if (digits.length === 15) {
    subTag = '03';
    target = digits;
  } else {
    return null;
  }
  const hasAmount = Number(amount) > 0;
  const body =
    tlv('00', '01') +
    tlv('01', hasAmount ? '12' : '11') + // 12 = QR ใช้ครั้งเดียวพร้อมยอด, 11 = ใช้ซ้ำได้
    tlv('29', tlv('00', 'A000000677010111') + tlv(subTag, target)) +
    tlv('58', 'TH') +
    tlv('53', '764') +
    (hasAmount ? tlv('54', Number(amount).toFixed(2)) : '') +
    '6304';
  return body + crc16(body);
}
