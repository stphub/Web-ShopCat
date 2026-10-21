const express = require('express');
const mongoose = require('mongoose');
const Address = require('../models/Address');
const { requireAuth } = require('./auth');
const { validateAddress } = require('../lib/address');
const { MAX_ADDRESSES } = require('../config/shop');

const router = express.Router();
router.use(requireAuth);

function sendError(res, e) {
  console.error(e);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
}

const notFound = (res) => res.status(404).json({ error: 'ไม่พบที่อยู่' });

router.get('/', async (req, res) => {
  try {
    const list = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    res.json({ addresses: list.map((a) => a.toPublic()) });
  } catch (e) {
    sendError(res, e);
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = validateAddress(req.body, { withLabel: true });
    if (error) return res.status(400).json({ field: error[0], error: error[1] });
    const count = await Address.countDocuments({ user: req.user._id });
    if (count >= MAX_ADDRESSES) {
      return res.status(400).json({ error: 'บันทึกที่อยู่ได้สูงสุด ' + MAX_ADDRESSES + ' รายการ ลบรายการเก่าก่อน' });
    }
    const makeDefault = count === 0 || Boolean(req.body && req.body.isDefault);
    if (makeDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const a = await Address.create({ ...data, user: req.user._id, isDefault: makeDefault });
    res.status(201).json({ address: a.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const { data, error } = validateAddress(req.body, { withLabel: true });
    if (error) return res.status(400).json({ field: error[0], error: error[1] });
    const a = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, data, { new: true });
    if (!a) return notFound(res);
    res.json({ address: a.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

router.post('/:id/default', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const a = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!a) return notFound(res);
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    a.isDefault = true;
    await a.save();
    res.json({ address: a.toPublic() });
  } catch (e) {
    sendError(res, e);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const a = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!a) return notFound(res);
    if (a.isDefault) {
      // ลบที่อยู่หลัก: ตั้งรายการที่เก่าที่สุดที่เหลือเป็นที่อยู่หลักแทน
      const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: 1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    res.json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
});

module.exports = router;
