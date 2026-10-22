require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { router: authRouter } = require('./routes/auth');
const { publicRouter: productsRouter, adminRouter: adminProductsRouter } = require('./routes/products');
const { publicRouter: imagesRouter, adminRouter: adminImagesRouter } = require('./routes/images');
const { customerRouter: ordersRouter, adminRouter: adminOrdersRouter } = require('./routes/orders');
const addressesRouter = require('./routes/addresses');
const reviewsRouter = require('./routes/reviews');
const statsRouter = require('./routes/stats');
const contactRouter = require('./routes/contact');
const adminContactRouter = contactRouter.adminRouter;
const wishlistRouter = require('./routes/wishlist');
const profileRouter = require('./routes/profile');
const { customerRouter: returnsRouter, adminRouter: adminReturnsRouter } = require('./routes/returns');
const { publicRouter: shopInfoRouter, adminRouter: adminShopInfoRouter } = require('./routes/shopInfo');
const { startAutoReceive } = require('./lib/autoReceive');
const { startExpireSweep } = require('./lib/expirePending');

const { MONGODB_URI, JWT_SECRET } = process.env;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI || !JWT_SECRET || JWT_SECRET === 'change-me') {
  console.error('ตั้งค่า MONGODB_URI และ JWT_SECRET ในไฟล์ .env ก่อน (ดูตัวอย่างใน .env.example)');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
// อยู่หลังพร็อกซีของผู้ให้บริการโฮสต์ (Render/Railway ฯลฯ): ให้อ่าน IP จริงของลูกค้า (ตัวจำกัดจำนวนครั้งต้องใช้) และรู้ว่าเป็น https
// TRUST_PROXY = จำนวนพร็อกซีที่ผ่านก่อนถึงเซิร์ฟเวอร์ (Render ตรง ๆ = 1, หน้าเว็บอยู่ Vercel แล้วส่งต่อ /api มา Render = 2)
if (process.env.NODE_ENV === 'production') app.set('trust proxy', Math.max(1, Math.floor(Number(process.env.TRUST_PROXY)) || 1));
// header ความปลอดภัยพื้นฐาน
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  if (process.env.NODE_ENV === 'production') res.set('Strict-Transport-Security', 'max-age=15552000');
  next();
});
// ให้ผู้ให้บริการโฮสต์เช็กว่าเซิร์ฟเวอร์ยังทำงานอยู่
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/admin/images', adminImagesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin/messages', adminContactRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/profile', profileRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/admin/returns', adminReturnsRouter);
app.use('/api/shop-info', shopInfoRouter);
app.use('/api/admin/shop-info', adminShopInfoRouter);
app.use('/api/admin/stats', statsRouter);
app.use('/api', reviewsRouter); // /api/products/:id/reviews และ /api/reviews/:id
app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบเส้นทางนี้' }));

// เสิร์ฟหน้าเว็บ React ที่ build แล้ว (client/dist) และส่งทุกหน้าให้ React Router จัดการต่อ
const dist = path.join(__dirname, 'client', 'dist');
app.use(express.static(dist));
app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('ยังไม่ได้ build หน้าเว็บ รัน npm run build ก่อน (หรือใช้ npm run client:dev ตอนพัฒนา)');
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log('เปิดร้านที่ http://localhost:' + PORT));
    startAutoReceive();
    startExpireSweep();
  })
  .catch((err) => {
    console.error('เชื่อมต่อ MongoDB ไม่สำเร็จ:', err.message);
    process.exit(1);
  });
