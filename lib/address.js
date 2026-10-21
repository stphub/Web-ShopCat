// ตรวจข้อมูลที่อยู่จัดส่ง ใช้ร่วมกันทั้งตอนบันทึกที่อยู่และตอนสั่งซื้อ
function validateAddress(input, { withLabel = false } = {}) {
  const a = input || {};
  const data = {
    name: String(a.name || '').trim(),
    tel: String(a.tel || '').trim(),
    line: String(a.line || '').trim(),
  };
  if (withLabel) data.label = String(a.label || '').trim();

  const digits = data.tel.replace(/\D/g, '');
  let error = null;
  if (!data.name || data.name.length > 80) error = ['name', 'กรุณากรอกชื่อผู้รับ (ไม่เกิน 80 ตัวอักษร)'];
  else if (!/^[0-9+\-\s()]+$/.test(data.tel) || digits.length < 8 || digits.length > 15) error = ['tel', 'เบอร์โทรไม่ถูกต้อง (ตัวเลข 8-15 หลัก)'];
  else if (data.line.length < 5 || data.line.length > 300) error = ['line', 'กรุณากรอกที่อยู่จัดส่งให้ครบ (5-300 ตัวอักษร)'];
  else if (withLabel && data.label.length > 30) error = ['label', 'ชื่อที่อยู่ยาวเกิน 30 ตัวอักษร'];
  return { data, error };
}

module.exports = { validateAddress };
