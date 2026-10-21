const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Return = require('../models/Return');
const { requireAuth, requireAdmin } = require('./auth');
const { LOW_STOCK } = require('../config/shop');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const BKK_MS = 7 * 3600e3; // ไทยไม่มีเวลาออมแสง ใช้ UTC+7 คงที่
const DAY_MS = 86400e3;
const dayKey = (d) => new Date(d.getTime() + BKK_MS).toISOString().slice(0, 10);

// ยอดขาย = ออเดอร์ที่ชำระเงินแล้ว จัดส่งแล้ว หรือลูกค้ารับแล้ว (ไม่นับรอชำระเงินและที่ยกเลิก) นับตามวันที่สั่งซื้อ
const SOLD = ['paid', 'shipped', 'received'];

router.get('/', async (req, res) => {
  try {
    const n = Number(req.query.days);
    const days = [7, 30, 90].includes(n) ? n : 30;
    const now = new Date();
    const todayKey = dayKey(now);
    // เที่ยงคืนตามเวลาไทยของวันแรกในช่วง
    const start = new Date(new Date(todayKey + 'T00:00:00+07:00').getTime() - (days - 1) * DAY_MS);
    const inRange = { createdAt: { $gte: start }, status: { $in: SOLD } };

    const [dailyRaw, best, lowStock, pendingAgg, statusAgg] = await Promise.all([
      Order.aggregate([
        { $match: inRange },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: inRange },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $last: '$items.name' },
            kind: { $last: '$items.kind' },
            color: { $last: '$items.color' },
            imageUrl: { $last: '$items.imageUrl' },
            qty: { $sum: '$items.qty' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          },
        },
        { $sort: { qty: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      Product.find({ active: true, stock: { $lte: LOW_STOCK } }).sort({ stock: 1, name: 1 }).limit(20),
      Order.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, orders: { $sum: 1 }, amount: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);

    const byDay = new Map(dailyRaw.map((d) => [d._id, d]));
    const daily = [];
    for (let i = 0; i < days; i++) {
      const key = dayKey(new Date(start.getTime() + i * DAY_MS));
      const d = byDay.get(key);
      daily.push({ date: key, revenue: d ? d.revenue : 0, orders: d ? d.orders : 0 });
    }
    const revenue = daily.reduce((s, d) => s + d.revenue, 0);
    const orders = daily.reduce((s, d) => s + d.orders, 0);
    const today = daily[daily.length - 1];

    const statusCounts = { pending: 0, paid: 0, shipped: 0, received: 0, cancelled: 0 };
    for (const s of statusAgg) statusCounts[s._id] = s.n;

    res.json({
      days,
      daily,
      totals: { revenue, orders, aov: orders ? Math.round(revenue / orders) : 0 },
      today: { revenue: today.revenue, orders: today.orders },
      pending: pendingAgg[0] ? { orders: pendingAgg[0].orders, amount: pendingAgg[0].amount } : { orders: 0, amount: 0 },
      statusCounts,
      pendingReturns: await Return.countDocuments({ status: 'pending' }),
      bestSellers: best.map((b) => ({
        id: String(b._id),
        name: b.name,
        kind: b.kind,
        color: b.color,
        imageUrl: b.imageUrl || null,
        qty: b.qty,
        revenue: b.revenue,
      })),
      lowStock: lowStock.map((p) => p.toPublic()),
      lowThreshold: LOW_STOCK,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

module.exports = router;
