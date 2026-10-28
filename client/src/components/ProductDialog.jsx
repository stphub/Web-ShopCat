import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Art from './Art';
import { Stars, StarInput } from './Stars';
import WishButton from './WishButton';
import ReviewPhotoPicker from './ReviewPhotoPicker';
import { api } from '../api';
import { baht } from '../data/products';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import ReviewerDialog from './ReviewerDialog';
import { ZoomFrame, Lightbox } from './PhotoViewer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';

// หน้าต่างรายละเอียดสินค้า + รีวิว (เปิดจากการ์ดสินค้า)
export default function ProductDialog({ productId, onClose }) {
  const { byId, reload: reloadShop } = useProducts();
  const { user } = useAuth();
  const { t, locale, pname, psize } = useI18n();
  const fmtDate = (v) => {
    try {
      return new Date(v).toLocaleDateString(locale, { dateStyle: 'medium', timeZone: 'Asia/Bangkok' });
    } catch {
      return '';
    }
  };
  const [viewReviewer, setViewReviewer] = useState(null);
  const { change } = useCart();
  const toast = useToast();
  const product = byId[productId];

  const [data, setData] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [notice, setNotice] = useState('');
  const [added, setAdded] = useState(false);
  const [shot, setShot] = useState(0); // รูปที่กำลังดูในแกลเลอรี
  const [lb, setLb] = useState(false); // เปิดดูรูปเต็มจอ
  const lbRef = useRef(false);
  lbRef.current = lb;

  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const closeCb = useRef(onClose);
  closeCb.current = onClose;

  const load = useCallback(
    () =>
      api.reviews
        .list(productId)
        .then((d) => {
          setData(d);
          setLoadErr(null);
          if (d.myReview) {
            setRating(d.myReview.rating);
            setComment(d.myReview.comment);
            setPhotos(d.myReview.photos || []);
          }
        })
        .catch((e) => setLoadErr(e.message)),
    [productId]
  );

  // โหลดรีวิวใหม่เมื่อสถานะล็อกอินเปลี่ยน (เพื่ออัปเดตสิทธิ์การรีวิว)
  useEffect(() => {
    load();
  }, [load, user]);

  // Escape ปิด, ล็อกการเลื่อนหน้าด้านหลัง, ย้ายโฟกัสเข้าหน้าต่าง และคืนโฟกัสเมื่อปิด
  useEffect(() => {
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape' && !lbRef.current) closeCb.current(); // ตอนดูรูปเต็มจอ Esc ปิดแค่รูป
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prev && prev.focus) prev.focus();
    };
  }, []);

  // ให้ปุ่ม Tab วนอยู่ในหน้าต่าง ไม่หลุดไปหน้าด้านหลัง
  const trap = (e) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const els = [...dialogRef.current.querySelectorAll('button,[href],input,textarea,select')].filter(
      (x) => !x.disabled && x.offsetParent !== null
    );
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setNotice('');
    if (!rating) {
      setErr(t('กรุณาให้คะแนน 1-5 ดาว'));
      return;
    }
    setBusy(true);
    try {
      await api.reviews.save(productId, { rating, comment, photos: photos.map((p) => p.id) });
      setNotice(t('บันทึกรีวิวแล้ว ขอบคุณที่ให้คะแนน'));
      await load();
      reloadShop();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async (r) => {
    if (!window.confirm(r.mine ? t('ลบรีวิวของคุณใช่ไหม') : t('ลบรีวิวนี้ใช่ไหม'))) return;
    setErr(null);
    setNotice('');
    try {
      await api.reviews.remove(r.id);
      if (r.mine) {
        setRating(0);
        setComment('');
        setPhotos([]);
      }
      setNotice(t('ลบรีวิวแล้ว'));
      await load();
      reloadShop();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const shots = (product && product.photos) || [];
  const out = product && product.stock <= 0;
  const sum = data && data.summary;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="modalscrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="pd-title" ref={dialogRef} onKeyDown={trap}>
        <button ref={closeRef} className="x dclose" onClick={onClose} aria-label={t('ปิดหน้าต่าง')}>&#10005;</button>

        {!product ? (
          <div className="dpad">
            <h2 id="pd-title">{t('ไม่พบสินค้านี้')}</h2>
            <p className="note">{t('สินค้านี้อาจถูกนำออกจากหน้าร้านแล้ว')}</p>
          </div>
        ) : (
          <div className="dpad">
            <div className="pd-top">
              <div className="pd-art">
                <ZoomFrame enabled={shots.length > 0} onOpen={() => setLb(true)} onSwipe={(d) => setShot((i) => (i + d + shots.length) % shots.length)}>
                  <Art product={shots.length ? { ...product, imageUrl: shots[Math.min(shot, shots.length - 1)].url } : product} />
                </ZoomFrame>
                {lb && shots.length > 0 && <Lightbox photos={shots} index={Math.min(shot, shots.length - 1)} onIndex={setShot} onClose={() => setLb(false)} alt={pname(product)} />}
                {shots.length > 1 && (
                  <>
                    <button type="button" className="gnav prev" onClick={() => setShot((i) => (i - 1 + shots.length) % shots.length)} aria-label={t('รูปก่อนหน้า')}>&#8249;</button>
                    <button type="button" className="gnav next" onClick={() => setShot((i) => (i + 1) % shots.length)} aria-label={t('รูปถัดไป')}>&#8250;</button>
                    <ul className="gthumbs" aria-label={t('รูปสินค้า')}>
                      {shots.map((ph, i) => (
                        <li key={ph.id}>
                          <button type="button" aria-pressed={i === shot} aria-label={t('ดูรูปที่ {i} จาก {n}', { i: i + 1, n: shots.length })} onClick={() => setShot(i)}>
                            <img src={ph.url} alt="" loading="lazy" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="pd-info">
                <h2 id="pd-title">{pname(product)} <WishButton product={product} className="inline" /></h2>
                <div className="meta">{psize(product)}</div>
                <div className="pd-rate">
                  {product.ratingCount > 0 ? (
                    <>
                      <Stars value={product.ratingAvg} />
                      <span className="num">{product.ratingAvg.toFixed(1)}</span>
                      <span className="meta">({t('{n} รีวิว', { n: product.ratingCount })})</span>
                    </>
                  ) : (
                    <span className="meta">{t('ยังไม่มีรีวิว')}</span>
                  )}
                </div>
                <div className="price num">
                  {product.was > 0 && <s>{baht(product.was)}</s>}
                  {baht(product.price)}
                </div>
                <button
                  className="add"
                  disabled={out}
                  onClick={() => {
                    change(product.id, 1);
                    toast.cartAdded(pname(product));
                    setAdded(true);
                    setTimeout(() => setAdded(false), 900);
                  }}
                >
                  {out ? t('สินค้าหมด') : added ? t('เพิ่มแล้ว') : t('ใส่ตะกร้า')}
                </button>
                {!out && product.stock <= 5 && <div className="meta">{t('เหลือ {n} ชิ้น', { n: product.stock })}</div>}
              </div>
            </div>

            <section className="reviews" aria-labelledby="rv-title">
              <h3 id="rv-title">{t('รีวิวจากลูกค้า')}</h3>

              {loadErr && <div className="err" role="alert">{t('โหลดรีวิวไม่สำเร็จ:')} {loadErr}</div>}
              {!data && !loadErr && <p className="note">{t('กำลังโหลดรีวิว...')}</p>}

              {data && (
                <>
                  {sum.count > 0 && (
                    <div className="rv-sum">
                      <div className="rv-big">
                        <span className="num">{sum.avg.toFixed(1)}</span>
                        <Stars value={sum.avg} size={18} />
                        <span className="meta">{t('{n} รีวิว', { n: sum.count })}</span>
                      </div>
                      <ul className="rv-dist" aria-label={t('จำนวนรีวิวแยกตามดาว')}>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <li key={n}>
                            <span className="num">{t('{n} ดาว', { n })}</span>
                            <span className="track"><i style={{ width: (sum.breakdown[n] / sum.count) * 100 + '%' }} /></span>
                            <span className="num meta">{sum.breakdown[n]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.reviews.length === 0 ? (
                    <p className="note">{t('ยังไม่มีรีวิวสำหรับสินค้านี้')}</p>
                  ) : (
                    <ul className="rv-list">
                      {data.reviews.map((r) => (
                        <li key={r.id}>
                          <div className="rv-head">
                            <button type="button" className="rv-who" onClick={() => setViewReviewer(r.id)} aria-label={t('ดูโปรไฟล์ผู้รีวิว {name}', { name: r.name })}>
                              <Avatar user={{ name: r.name, picture: r.avatar }} size={28} />
                              <span className="rv-name">{r.name}{r.mine ? ' ' + t('(คุณ)') : ''}</span>
                            </button>
                            <Stars value={r.rating} size={14} />
                            <span className="meta">{fmtDate(r.createdAt)}</span>
                          </div>
                          {r.comment && <p className="rv-text">{r.comment}</p>}
                          {r.photos && r.photos.length > 0 && (
                            <ul className="rvgallery" aria-label={t('รูปจากผู้รีวิว')}>
                              {r.photos.map((ph) => (
                                <li key={ph.id}>
                                  <a href={ph.url} target="_blank" rel="noopener noreferrer" aria-label={t('ดูรูปรีวิวขนาดใหญ่')}>
                                    <img src={ph.url} alt={t('รูปจากรีวิว')} loading="lazy" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                          {(r.mine || isAdmin) && (
                            <button className="rm" onClick={() => removeReview(r)}>{r.mine ? t('ลบรีวิวของฉัน') : t('ลบรีวิว (แอดมิน)')}</button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="rv-form">
                    {!data.loggedIn ? (
                      <p className="need-login">
                        <Link to="/login" onClick={onClose}>{t('เข้าสู่ระบบ')}</Link> {t('เพื่อรีวิวสินค้าที่คุณเคยสั่งซื้อ')}
                      </p>
                    ) : !data.canReview ? (
                      <p className="note">
                        {t('รีวิวได้หลังจากที่คุณกดยืนยันรับสินค้านี้แล้ว ไปที่')} <Link to="/account/orders" onClick={onClose}>{t('คำสั่งซื้อของฉัน')}</Link> {t('เลือกคำสั่งซื้อที่ร้านจัดส่งแล้ว แล้วกด "ยืนยันรับสินค้า"')}
                      </p>
                    ) : (
                      <form onSubmit={submit} noValidate>
                        <h4>{data.myReview ? t('แก้ไขรีวิวของคุณ') : t('เขียนรีวิว')}</h4>
                        <StarInput value={rating} onChange={setRating} disabled={busy} />
                        <label htmlFor="rv-comment" className="rv-label">
                          {t('ความคิดเห็น (ไม่บังคับ)')}
                          <textarea id="rv-comment" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
                        </label>
                        <ReviewPhotoPicker photos={photos} onChange={setPhotos} disabled={busy} />
                        {err && <div className="err" role="alert">{err}</div>}
                        <button className="submit" type="submit" disabled={busy}>{data.myReview ? t('บันทึกการแก้ไข') : t('ส่งรีวิว')}</button>
                      </form>
                    )}
                    {data.canReview === false && err && <div className="err" role="alert">{err}</div>}
                    {notice && <p className="okmsg" role="status">{notice}</p>}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
      {viewReviewer && <ReviewerDialog reviewId={viewReviewer} onClose={() => setViewReviewer(null)} />}
    </div>
  );
}
