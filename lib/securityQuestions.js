const crypto = require('crypto');

// คำถามความปลอดภัยสำหรับกู้รหัสผ่านโดยไม่ใช้อีเมล (เก็บเฉพาะ id ของคำถามกับแฮชของคำตอบ)
const QUESTIONS = [
  { id: 'cat1', text: 'ชื่อแมวตัวแรกของคุณคืออะไร' },
  { id: 'school', text: 'ชื่อโรงเรียนประถมของคุณคืออะไร' },
  { id: 'city', text: 'คุณเกิดที่จังหวัดอะไร' },
  { id: 'food', text: 'อาหารจานโปรดสมัยเด็กของคุณคืออะไร' },
  { id: 'friend', text: 'ชื่อเล่นเพื่อนสนิทสมัยเด็กของคุณคืออะไร' },
  { id: 'phone', text: 'เลข 4 ตัวท้ายของเบอร์โทรที่ใช้ประจำของคุณคืออะไร' },
];
const BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

// ทำให้คำตอบเทียบกันได้: ตัดช่องว่างทั้งหมด ตัวพิมพ์เล็ก (กันพิมพ์ต่างกันนิดหน่อย)
function normalizeAnswer(a) {
  return String(a || '').normalize('NFC').toLowerCase().replace(/\s+/g, '');
}

// อีเมลที่ไม่มีบัญชี/ไม่ได้ตั้งคำถาม จะได้คำถามปลอมที่คงที่ เพื่อไม่บอกว่ามีอีเมลนี้หรือไม่
function fakeQuestionFor(email) {
  const n = crypto.createHash('sha256').update('q:' + email).digest()[0];
  return QUESTIONS[n % QUESTIONS.length];
}

module.exports = { QUESTIONS, BY_ID, normalizeAnswer, fakeQuestionFor };
