const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { maskName } = Review;
const Image = require('../models/Image');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { detectType } = require('./images');

const MAX_REVIEW_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1024 * 1024;
const photoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'อัปโหลดรูปถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' },
});
const photoOut = (ids) => (ids || []).map((id) => ({ id: String(id), url: '/api/images/' + id }));
const { requireAuth, optionalAuth } = require('./auth');

const router = express.Router();

// รูปโปรไฟล์ของผู้รีวิว (รูปที่อัปโหลดเอง หรือรูปจาก Google) ใช้เป็นแผนที่ userId -> url
async function avatarMap(userIds) {
  const ids = [...new Set(userIds.map(String))];
  const users = await User.find({ _id: { $in: ids } }).select('avatar picture');
  const m = new Map();
  for (const u of users) m.set(String(u._id), u.avatar ? '/api/images/' + u.avatar : u.picture || null);
  return m;
}

function sendError(res, e) {
  console.error(e);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
}

// คำนวณคะแนนเฉลี่ยและจำนวนรีวิวใหม่ เก็บไว้ที่สินค้าเพื่อให้หน้าร้านแสดงดาวได้โดยไม่ต้องนับทุกครั้ง
async function recompute(productId) {
  const [agg] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    { ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0, ratingCount: agg ? agg.count : 0 }
  );
}

// รีวิวได้เมื่อลูกค้ากดยืนยันรับสินค้าแล้ว = มีออเดอร์ของผู้ใช้นี้ที่สถานะ received และมีสินค้านี้อยู่ในออเดอร์
function hasPurchased(userId, productId) {
  return Order.exists({ user: userId, status: 'received', 'items.product': productId });
}

// รีวิวทั้งหมดของฉัน (หน้าคำสั่งซื้อใช้แสดงว่าสินค้าชิ้นไหนรีวิวแล้ว)
router.get('/reviews/mine', requireAuth, async (req, res) => {
  try {
    const list = await Review.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(500);
    res.json({ reviews: list.map((r) => ({ id: r._id.toString(), product: String(r.product), rating: r.rating, comment: r.comment, photos: photoOut(r.photos) })) });
  } catch (e) {
    sendError(res, e);
  }
});

router.get('/products/:id/reviews', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id) || !(await Product.exists({ _id: id }))) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    const pid = new mongoose.Types.ObjectId(id);
    const [list, dist] = await Promise.all([
      Review.find({ product: pid }).sort({ createdAt: -1 }).limit(50),
      Review.aggregate([{ $match: { product: pid } }, { $group: { _id: '$rating', n: { $sum: 1 } } }]),
    ]);
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let count = 0;
    let sum = 0;
    for (const d of dist) {
      breakdown[d._id] = d.n;
      count += d.n;
      sum += d._id * d.n;
    }
    const viewer = req.user ? req.user._id : null;
    const avatars = await avatarMap(list.map((r) => r.user));
    const mine = viewer ? list.find((r) => String(r.user) === String(viewer)) || (await Review.findOne({ product: pid, user: viewer })) : null;
    res.json({
      summary: { avg: count ? Math.round((sum / count) * 10) / 10 : 0, count, breakdown },
      reviews: list.map((r) => r.toPublic(viewer, avatars.get(String(r.user)))),
      canReview: viewer ? Boolean(await hasPurchased(viewer, pid)) : false,
      myReview: mine ? { rating: mine.rating, comment: mine.comment, photos: photoOut(mine.photos) } : null,
      loggedIn: Boolean(viewer),
    });
  } catch (e) {
    sendError(res, e);
  }
});

// โปรไฟล์ผู้รีวิว (กดจากชื่อในรีวิว): ทุกคนเห็นรูป ชื่อที่ปิดบังบางส่วน และสินค้าที่เคยรีวิว
// แอดมินเห็นเพิ่ม: ชื่อเต็ม อีเมล และสินค้าที่เคยสั่งซื้อ (ประวัติการซื้อของลูกค้าไม่เปิดให้คนทั่วไปเห็น)
router.get('/reviews/:id/reviewer', optionalAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบรีวิว' });
    const r = await Review.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'ไม่พบรีวิว' });
    const isAdmin = !!req.user && req.user.role === 'admin';
    const [user, reviews] = await Promise.all([
      User.findById(r.user).select('name nickname avatar picture createdAt email'),
      Review.find({ user: r.user }).sort({ createdAt: -1 }).limit(30),
    ]);
    const products = await Product.find({ _id: { $in: reviews.map((x) => x.product) } }).select('name');
    const pname = new Map(products.map((p) => [String(p._id), p.name]));
    const out = {
      name: maskName(r.userName),
      avatar: user ? (user.avatar ? '/api/images/' + user.avatar : user.picture || null) : null,
      since: user ? user.createdAt : null,
      reviews: reviews.map((x) => ({
        id: String(x._id),
        productId: String(x.product),
        productName: pname.get(String(x.product)) || 'สินค้าที่ถูกลบแล้ว',
        rating: x.rating,
        comment: x.comment,
        photos: photoOut(x.photos),
        createdAt: x.createdAt,
      })),
    };
    if (isAdmin) {
      const orders = await Order.find({ user: r.user, status: { $ne: 'cancelled' } }).sort({ createdAt: -1 }).limit(20);
      out.admin = {
        fullName: user ? user.name : r.userName,
        nickname: user ? user.nickname || '' : '',
        email: user ? user.email : '',
        orders: orders.map((o) => ({
          id: String(o._id),
          orderNo: o.orderNo,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          items: o.items.map((i) => ({ name: i.name, qty: i.qty })),
        })),
      };
    }
    res.json(out);
  } catch (e) {
    sendError(res, e);
  }
});

// อัปโหลดรูปแนบรีวิว (เก็บแบบ kind='review' ผูกกับเจ้าของ) ต้องล็อกอิน
router.post(
  '/reviews/images',
  requireAuth,
  photoLimiter,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_PHOTO_BYTES }),
  async (req, res) => {
    try {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({ error: 'ไม่พบไฟล์รูป ส่งได้เฉพาะ JPG, PNG หรือ WebP' });
      }
      const type = detectType(buf);
      if (!type) return res.status(400).json({ error: 'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP' });
      const img = await Image.create({ data: buf, contentType: type, size: buf.length, kind: 'review', owner: req.user._id });
      res.status(201).json({ id: img._id.toString(), url: '/api/images/' + img._id });
    } catch (e) {
      sendError(res, e);
    }
  }
);

router.post('/products/:id/reviews', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id) || !(await Product.exists({ _id: id }))) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    const rating = Number(req.body && req.body.rating);
    const comment = String((req.body && req.body.comment) || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ field: 'rating', error: 'กรุณาให้คะแนน 1-5 ดาว' });
    }
    if (comment.length > 500) return res.status(400).json({ field: 'comment', error: 'ความคิดเห็นยาวเกิน 500 ตัวอักษร' });
    if (!(await hasPurchased(req.user._id, id))) {
      return res.status(403).json({ error: 'รีวิวได้หลังจากกดยืนยันรับสินค้าที่หน้า "บัญชีของฉัน" แล้วเท่านั้น' });
    }
    // รูปแนบ: ต้องเป็นรูป kind='review' ของผู้ใช้นี้เอง และไม่ถูกใช้กับรีวิวสินค้าอื่น
    const rawPhotos = Array.isArray(req.body && req.body.photos) ? req.body.photos.map(String) : [];
    const photos = [...new Set(rawPhotos)];
    if (photos.length > MAX_REVIEW_PHOTOS) {
      return res.status(400).json({ field: 'photos', error: 'แนบรูปได้ไม่เกิน ' + MAX_REVIEW_PHOTOS + ' รูป' });
    }
    if (!photos.every((p) => mongoose.isValidObjectId(p))) {
      return res.status(400).json({ field: 'photos', error: 'รูปที่แนบไม่ถูกต้อง' });
    }
    if (photos.length) {
      const [own, elsewhere] = await Promise.all([
        Image.countDocuments({ _id: { $in: photos }, kind: 'review', owner: req.user._id }),
        Review.exists({ photos: { $in: photos }, product: { $ne: id } }),
      ]);
      if (own !== photos.length || elsewhere) {
        return res.status(400).json({ field: 'photos', error: 'รูปที่แนบไม่ถูกต้อง ลองอัปโหลดใหม่' });
      }
    }
    const old = await Review.findOne({ product: id, user: req.user._id }).select('photos');
    const r = await Review.findOneAndUpdate(
      { product: id, user: req.user._id },
      { rating, comment, photos, userName: req.user.name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // ลบรูปที่ถูกเอาออกจากรีวิว
    if (old && old.photos.length) {
      const keep = new Set(photos);
      const gone = old.photos.filter((x) => !keep.has(String(x)));
      if (gone.length) await Image.deleteMany({ _id: { $in: gone }, kind: 'review' });
    }
    await recompute(id);
    res.status(201).json({ review: r.toPublic(req.user._id, req.user.avatar ? '/api/images/' + req.user.avatar : req.user.picture || null) });
  } catch (e) {
    sendError(res, e);
  }
});

// เจ้าของรีวิวลบของตัวเองได้ แอดมินลบรีวิวใดก็ได้
router.delete('/reviews/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'ไม่พบรีวิว' });
    const r = await Review.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'ไม่พบรีวิว' });
    const isOwner = String(r.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ error: 'ลบรีวิวของผู้อื่นไม่ได้' });
    await r.deleteOne();
    if (r.photos && r.photos.length) await Image.deleteMany({ _id: { $in: r.photos }, kind: 'review' });
    await recompute(r.product);
    res.json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
});

// ข้อผิดพลาดจากการรับไฟล์ (เช่นไฟล์ใหญ่เกิน)
router.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'รูปใหญ่เกินไป (ไม่เกิน 1 MB) ลองเลือกรูปอื่น' });
  next(err);
});

module.exports = router;
