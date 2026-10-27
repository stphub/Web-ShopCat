// ชั้นป้องกัน CSRF เพิ่มจาก cookie sameSite=lax: คำขอที่เปลี่ยนข้อมูล (POST/PUT/PATCH/DELETE) ต้องมาจากหน้าเว็บของร้านเอง
// เบราว์เซอร์ส่งหัว Origin มาให้ทุกครั้งที่ส่งคำขอแบบนี้ ถ้าไม่ตรงกับที่อนุญาตจะปฏิเสธ
// ที่อนุญาต: APP_URL (หน้าเว็บบน Vercel) + ALLOWED_ORIGINS (คั่นด้วยจุลภาค เช่น โดเมนของร้านเองในอนาคต) + โฮสต์ของเซิร์ฟเวอร์เอง
// ใช้งานเฉพาะตอนตั้ง APP_URL ไว้ (production) ถ้าไม่ตั้งจะไม่ตรวจ เพื่อไม่ให้ตอนพัฒนาบนเครื่องใช้ไม่ได้
function originOf(v) {
  try {
    return new URL(v).origin;
  } catch {
    return null;
  }
}

function originCheck() {
  const allowed = new Set(
    [process.env.APP_URL, ...String(process.env.ALLOWED_ORIGINS || '').split(',')].map((s) => originOf(String(s || '').trim())).filter(Boolean)
  );
  const enabled = allowed.size > 0 && process.env.SKIP_ORIGIN_CHECK !== '1';
  return (req, res, next) => {
    if (!enabled || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (!origin) return next(); // ไม่ใช่เบราว์เซอร์ (เช่น curl/สคริปต์ของเจ้าของ) ไม่มีคุกกี้ของลูกค้าให้ถูกแอบใช้
    if (allowed.has(origin) || origin === req.protocol + '://' + req.get('host')) return next();
    res.status(403).json({ error: 'คำขอนี้ไม่ได้มาจากหน้าเว็บของร้าน' });
  };
}

module.exports = { originCheck };
