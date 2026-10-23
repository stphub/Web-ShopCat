import { useId, useState } from 'react';
import { Stars, StarInput } from './Stars';
import ReviewPhotoPicker from './ReviewPhotoPicker';
import { api } from '../api';
import { useI18n } from '../i18n';
import { useProducts } from '../context/ProductsContext';

// รีวิวสินค้าหนึ่งชิ้นจากหน้าคำสั่งซื้อ ใช้ได้เมื่อออเดอร์เป็น "ได้รับสินค้าแล้ว"
// review = รีวิวที่เคยเขียนไว้ (หรือ null) onSaved(productId, review) แจ้งหน้าแม่หลังบันทึกสำเร็จ
export default function OrderItemReview({ item, review, onSaved }) {
  const uid = useId();
  const { t, pname } = useI18n();
  const { byId } = useProducts();
  const itemName = byId[item.product] ? pname(byId[item.product]) : item.name;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // เปิดฟอร์มทุกครั้งให้ดึงรีวิวล่าสุดมาใส่ (สินค้าเดียวกันอาจอยู่หลายออเดอร์ แต่มีรีวิวได้หนึ่งอันต่อสินค้า)
  const start = () => {
    setRating(review ? review.rating : 0);
    setComment(review ? review.comment : '');
    setPhotos(review && review.photos ? review.photos : []);
    setErr(null);
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!rating) {
      setErr(t('กรุณาให้คะแนน 1-5 ดาว'));
      return;
    }
    setBusy(true);
    try {
      const d = await api.reviews.save(item.product, { rating, comment, photos: photos.map((p) => p.id) });
      onSaved(item.product, { id: d.review.id, rating: d.review.rating, comment: d.review.comment, photos: d.review.photos });
      setOpen(false);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="itemreview">
        {review ? (
          <div className="rv-done">
            <Stars value={review.rating} size={14} />
            <span className="meta">{t('รีวิวแล้ว')}{review.photos && review.photos.length ? ' · ' + t('แนบรูป {n}', { n: review.photos.length }) : ''}</span>
            <button type="button" className="rm" onClick={start} aria-label={t('แก้ไขรีวิว {name}', { name: itemName })}>{t('แก้ไขรีวิว')}</button>
          </div>
        ) : (
          <button type="button" className="ghost" onClick={start} aria-label={t('เขียนรีวิว {name}', { name: itemName })}>{t('เขียนรีวิว')}</button>
        )}
      </div>
    );
  }

  return (
    <form className="itemreview rv-inline" onSubmit={save} noValidate>
      <StarInput value={rating} onChange={setRating} disabled={busy} />
      <label htmlFor={uid + '-c'} className="rv-label">
        {t('ความคิดเห็น (ไม่บังคับ)')}
        <textarea id={uid + '-c'} rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
      <ReviewPhotoPicker photos={photos} onChange={setPhotos} disabled={busy} />
      {err && <div className="err" role="alert">{err}</div>}
      <div className="actions">
        <button className="submit" type="submit" disabled={busy}>{review ? t('บันทึกการแก้ไข') : t('ส่งรีวิว')}</button>
        <button type="button" className="ghost" onClick={() => setOpen(false)} disabled={busy}>{t('ยกเลิก')}</button>
      </div>
    </form>
  );
}
