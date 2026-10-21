const crypto = require('crypto');

// token รีเซ็ตรหัสผ่าน: ส่งให้ผู้ใช้ทางอีเมลเป็นค่าจริง แต่เก็บในฐานข้อมูลเป็นแฮช
// ถ้าฐานข้อมูลรั่ว ก็เอาไปรีเซ็ตรหัสผ่านใครไม่ได้
function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

module.exports = { newToken, hashToken };
