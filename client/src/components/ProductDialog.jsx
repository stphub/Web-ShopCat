import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Art from './Art';
import { Stars, StarInput } from './Stars';
import WishButton from './WishButton';
import ReviewPhotoPicker from './ReviewPhotoPicker';
import { api } from '../api';
import { baht } from '../data/products';
import { fmtDate } from '../data/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';

// หน้าต่างรายละเอียดสินค้า + รีวิว (เปิดจากการ์ดสินค้า)
export default function ProductDialog({ productId, onClose }) {
  const { byId, reload: reloadShop } = useProducts();
  const { user } = useAuth();
  const { change } = useCart();
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
      if (e.key === 'Escape') closeCb.current();
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
      setErr('กรุณาให้คะแนน 1-5 ดาว');
      return;
    }
    setBusy(true);
    try {
      await api.reviews.save(productId, { rating, comment, photos: photos.map((p) => p.id) });
      setNotice('บันทึกรีวิวแล้ว ขอบคุณที่ให้คะแนน');
      await load();
      reloadShop();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async (r) => {
    if (!window.confirm(r.mine ? 'ลบรีวิวของคุณใช่ไหม' : 'ลบรีวิวนี้ใช่ไหม')) return;
    setErr(null);
    setNotice('');
    try {
      await api.reviews.remove(r.id);
      if (r.mine) {
        setRating(0);
        setComment('');
        setPhotos([]);
      }
      setNotice('ลบรีวิวแล้ว');
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
        <button ref={closeRef} className="x dclose" onClick={onClose} aria-label="ปิดหน้าต่าง">&#10005;</button>

        {!product ? (
          <div className="dpad">
            <h2 id="pd-title">ไม่พบสินค้านี้</h2>
            <p className="note">สินค้านี้อาจถูกนำออกจากหน้าร้านแล้ว</p>
          </div>
        ) : (
          <div className="dpad">
            <div className="pd-top">
              <div className="pd-art">
                <Art product={shots.length ? { ...product, imageUrl: shots[Math.min(shot, shots.length - 1)].url } : product} />
                {shots.length > 1 && (
                  <>
                    <button type="button" className="gnav prev" onClick={() => setShot((i) => (i - 1 + shots.length) % shots.length)} aria-label="รูปก่อนหน้า">&#8249;</button>
                    <button type="button" className="gnav next" onClick={() => setShot((i) => (i + 1) % shots.length)} aria-label="รูปถัดไป">&#8250;</button>
                    <ul className="gthumbs" aria-label="รูปสินค้า">
                      {shots.map((ph, i) => (
                        <li key={ph.id}>
                          <button type="button" aria-pressed={i === shot} aria-label={'ดูรูปที่ ' + (i + 1) + ' จาก ' + shots.length} onClick={() => setShot(i)}>
                            <img src={ph.url} alt="" loading="lazy" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="pd-info">
                <h2 id="pd-title">{product.name} <WishButton product={product} className="inline" /></h2>
                <div className="meta">{product.size}</div>
                <div className="pd-rate">
                  {product.ratingCount > 0 ? (
                    <>
                      <Stars value={product.ratingAvg} />
                      <span className="num">{product.ratingAvg.toFixed(1)}</span>
                      <span className="meta">({product.ratingCount} รีวิว)</span>
                    </>
                  ) : (
                    <span className="meta">ยังไม่มีรีวิว</span>
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
                    setAdded(true);
                    setTimeout(() => setAdded(false), 900);
                  }}
                >
                  {out ? 'สินค้าหมด' : added ? 'เพิ่มแล้ว' : 'ใส่ตะกร้า'}
                </button>
                {!out && product.stock <= 5 && <div className="meta">เหลือ {product.stock} ชิ้น</div>}
              </div>
            </div>

            <section className="reviews" aria-labelledby="rv-title">
              <h3 id="rv-title">รีวิวจากลูกค้า</h3>

              {loadErr && <div className="err" role="alert">โหลดรีวิวไม่สำเร็จ: {loadErr}</div>}
              {!data && !loadErr && <p className="note">กำลังโหลดรีวิว...</p>}

              {data && (
                <>
                  {sum.count > 0 && (
                    <div className="rv-sum">
                      <div className="rv-big">
                        <span className="num">{sum.avg.toFixed(1)}</span>
                        <Stars value={sum.avg} size={18} />
                        <span className="meta">{sum.count} รีวิว</span>
                      </div>
                      <ul className="rv-dist" aria-label="จำนวนรีวิวแยกตามดาว">
                        {[5, 4, 3, 2, 1].map((n) => (
                          <li key={n}>
                            <span className="num">{n} ดาว</span>
                            <span className="track"><i style={{ width: (sum.breakdown[n] / sum.count) * 100 + '%' }} /></span>
                            <span className="num meta">{sum.breakdown[n]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.reviews.length === 0 ? (
                    <p className="note">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
                  ) : (
                    <ul className="rv-list">
                      {data.reviews.map((r) => (
                        <li key={r.id}>
                          <div className="rv-head">
                            <Stars value={r.rating} size={14} />
                            <span className="rv-name">{r.name}{r.mine ? ' (คุณ)' : ''}</span>
                            <span className="meta">{fmtDate(r.createdAt)}</span>
                          </div>
                          {r.comment && <p className="rv-text">{r.comment}</p>}
                          {r.photos && r.photos.length > 0 && (
                            <ul className="rvgallery" aria-label="รูปจากผู้รีวิว">
                              {r.photos.map((ph) => (
                                <li key={ph.id}>
                                  <a href={ph.url} target="_blank" rel="noopener noreferrer" aria-label="ดูรูปรีวิวขนาดใหญ่">
                                    <img src={ph.url} alt="รูปจากรีวิว" loading="lazy" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                          {(r.mine || isAdmin) && (
                            <button className="rm" onClick={() => removeReview(r)}>{r.mine ? 'ลบรีวิวของฉัน' : 'ลบรีวิว (แอดมิน)'}</button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="rv-form">
                    {!data.loggedIn ? (
                      <p className="need-login">
                        <Link to="/login" onClick={onClose}>เข้าสู่ระบบ</Link> เพื่อรีวิวสินค้าที่คุณเคยสั่งซื้อ
                      </p>
                    ) : !data.canReview ? (
                      <p className="note">
                        รีวิวได้หลังจากที่คุณกดยืนยันรับสินค้านี้แล้ว ไปที่ <Link to="/account" onClick={onClose}>บัญชีของฉัน</Link> เลือกคำสั่งซื้อที่ร้านจัดส่งแล้ว แล้วกด "ยืนยันรับสินค้า"
                      </p>
                    ) : (
                      <form onSubmit={submit} noValidate>
                        <h4>{data.myReview ? 'แก้ไขรีวิวของคุณ' : 'เขียนรีวิว'}</h4>
                        <StarInput value={rating} onChange={setRating} disabled={busy} />
                        <label htmlFor="rv-comment" className="rv-label">
                          ความคิดเห็น (ไม่บังคับ)
                          <textarea id="rv-comment" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
                        </label>
                        <ReviewPhotoPicker photos={photos} onChange={setPhotos} disabled={busy} />
                        {err && <div className="err" role="alert">{err}</div>}
                        <button className="submit" type="submit" disabled={busy}>{data.myReview ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}</button>
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
    </div>
  );
}
