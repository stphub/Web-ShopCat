const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const { requireAuth } = require('./auth');
const { MAX_WISHLIST } = require('../config/shop');

const router = express.Router();
router.use(requireAuth);

function sendError(res, e) {
  console.error(e);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
}

// รหัสสินค้าในรายการโปรดของฉัน (ใหม่สุดก่อน) หน้าเว็บมีข้อมูลสินค้าอยู่แล้ว จึงส่งแค่รหัส
router.get('/', async (req, res) => {
  try {
    const rows = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 }).select('product');
    res.json({ ids: rows.map((r) => String(r.product)) });
  } catch (e) {
    sendError(res, e);
  }
});

// เพิ่ม (กดซ้ำไม่เกิดรายการซ้ำ)
router.put('/:productId', async (req, res) => {
  try {
    const id = req.params.productId;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    if (!(await Product.exists({ _id: id, active: true }))) return res.status(404).json({ error: 'ไม่พบสินค้านี้' });
    if (!(await Wishlist.exists({ user: req.user._id, product: id })) && (await Wishlist.countDocuments({ user: req.user._id })) >= MAX_WISHLIST) {
      return res.status(409).json({ error: 'รายการโปรดเต็มแล้ว (สูงสุด ' + MAX_WISHLIST + ' รายการ) ลองเอารายการเก่าออกก่อน' });
    }
    try {
      await Wishlist.updateOne({ user: req.user._id, product: id }, { $setOnInsert: { user: req.user._id, product: id } }, { upsert: true });
    } catch (e) {
      if (!(e && e.code === 11000)) throw e; // กดพร้อมกันสองครั้ง ถือว่าสำเร็จ
    }
    res.json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return res.json({ ok: true });
    await Wishlist.deleteOne({ user: req.user._id, product: req.params.productId });
    res.json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
});

module.exports = router;
