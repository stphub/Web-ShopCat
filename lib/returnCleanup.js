const Image = require('../models/Image');
const Return = require('../models/Return');
const Review = require('../models/Review');

const DAY_MS = 24 * 60 * 60 * 1000;

// ลบรูปหลักฐานที่อัปโหลดไว้แต่ไม่เคยถูกใช้ในคำขอ (ลูกค้าปิดหน้าก่อนส่ง) และเก่าเกิน 1 วัน
async function cleanupOrphanReturnImages(now = new Date()) {
  const old = await Image.find({ kind: 'return', createdAt: { $lt: new Date(now.getTime() - DAY_MS) } }).select('_id');
  if (old.length === 0) return 0;
  const ids = old.map((i) => i._id);
  const used = await Return.find({ photos: { $in: ids } }).select('photos');
  const usedSet = new Set(used.flatMap((r) => r.photos.map(String)));
  const orphans = ids.filter((id) => !usedSet.has(String(id)));
  if (orphans.length === 0) return 0;
  const r = await Image.deleteMany({ _id: { $in: orphans } });
  return r.deletedCount || 0;
}

// เช่นเดียวกัน สำหรับรูปแนบรีวิวที่อัปโหลดแล้วแต่ไม่ได้กดส่งรีวิว
async function cleanupOrphanReviewImages(now = new Date()) {
  const old = await Image.find({ kind: 'review', createdAt: { $lt: new Date(now.getTime() - DAY_MS) } }).select('_id');
  if (old.length === 0) return 0;
  const ids = old.map((i) => i._id);
  const used = await Review.find({ photos: { $in: ids } }).select('photos');
  const usedSet = new Set(used.flatMap((r) => r.photos.map(String)));
  const orphans = ids.filter((id) => !usedSet.has(String(id)));
  if (orphans.length === 0) return 0;
  const r = await Image.deleteMany({ _id: { $in: orphans } });
  return r.deletedCount || 0;
}

module.exports = { cleanupOrphanReturnImages, cleanupOrphanReviewImages };
