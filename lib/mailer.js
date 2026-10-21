// ส่งอีเมลผ่าน SMTP (ตั้ง SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM ใน .env)
// ถ้ายังไม่ได้ตั้งค่า (หรือยังไม่ได้ติดตั้ง nodemailer) จะพิมพ์ข้อความลงหน้าจอ terminal แทน
// เพื่อให้ทดสอบบนเครื่องตัวเองได้โดยไม่ต้องมีเซิร์ฟเวอร์อีเมล
let transport;
function getTransport() {
  if (transport !== undefined) return transport;
  transport = null;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return transport;
  try {
    const nodemailer = require('nodemailer');
    const port = Number(SMTP_PORT) || 587;
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  } catch (e) {
    console.error('ตั้ง SMTP_HOST แล้วแต่ใช้ nodemailer ไม่ได้ (รัน npm install ก่อน):', e.message);
  }
  return transport;
}

async function sendMail({ to, subject, text, replyTo }) {
  const t = getTransport();
  if (!t) {
    console.log('\n[อีเมล - ยังไม่ได้ตั้งค่า SMTP จึงแสดงแทนการส่งจริง]\nถึง: ' + to + '\n' + (replyTo ? 'ตอบกลับไปที่: ' + replyTo + '\n' : '') + 'หัวเรื่อง: ' + subject + '\n' + text + '\n');
    return;
  }
  await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, replyTo });
}

module.exports = { sendMail };
