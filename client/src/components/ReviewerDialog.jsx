import { useEffect, useState } from 'react';
import { Stars } from './Stars';
import Avatar from './Avatar';
import { api } from '../api';
import { baht } from '../data/products';
import { ORDER_STATUS } from '../data/orders';
import { useI18n } from '../i18n';
import { useProducts } from '../context/ProductsContext';

// โปรไฟล์ผู้รีวิว: รูป ชื่อ และสินค้าที่เคยรีวิว (แอดมินเห็นประวัติการสั่งซื้อเพิ่ม)
export default function ReviewerDialog({ reviewId, onClose }) {
  const { t, locale, pname } = useI18n();
  const { byId } = useProducts();
  const fmtDate = (v) => {
    try {
      return new Date(v).toLocaleDateString(locale, { dateStyle: 'medium', timeZone: 'Asia/Bangkok' });
    } catch {
      return '';
    }
  };
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    api.reviews.reviewer(reviewId).then((x) => alive && setD(x)).catch((e) => alive && setErr(e.message));
    return () => {
      alive = false;
    };
  }, [reviewId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="rvmodal" role="dialog" aria-modal="true" aria-labelledby="rvm-title" onClick={onClose}>
      <div className="rvmbox" onClick={(e) => e.stopPropagation()}>
        <button className="rvmclose" onClick={onClose} aria-label={t('ปิด')}>×</button>
        {err && <div className="err" role="alert">{err}</div>}
        {!d && !err && <p className="note">{t('กำลังโหลด...')}</p>}
        {d && (
          <>
            <div className="rvmhead">
              <Avatar user={{ name: d.admin ? d.admin.fullName : d.name, picture: d.avatar }} size={64} />
              <div>
                <h3 id="rvm-title">{d.admin ? d.admin.fullName : d.name}</h3>
                {d.admin && d.admin.nickname && <p className="meta">{t('ชื่อเล่น {name}', { name: d.admin.nickname })}</p>}
                {d.admin && <p className="meta">{d.admin.email}</p>}
                {d.since && <p className="meta">{t('เป็นสมาชิกตั้งแต่ {date}', { date: fmtDate(d.since) })}</p>}
              </div>
            </div>

            {d.admin && (
              <section>
                <h4>{t('ประวัติการสั่งซื้อ (เห็นเฉพาะแอดมิน)')}</h4>
                {d.admin.orders.length === 0 && <p className="note">{t('ยังไม่มีคำสั่งซื้อ')}</p>}
                <ul className="rvmlist">
                  {d.admin.orders.map((o) => (
                    <li key={o.id}>
                      <div><b>#{o.orderNo}</b> <span className="meta">{fmtDate(o.createdAt)} · {t(ORDER_STATUS[o.status] || o.status)} · {baht(o.total)}</span></div>
                      <div className="meta">{o.items.map((i) => i.name + ' ×' + i.qty).join(', ')}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h4>{t('รีวิวที่เคยเขียน ({n})', { n: d.reviews.length })}</h4>
              <ul className="rvmlist">
                {d.reviews.map((x) => (
                  <li key={x.id}>
                    <div><b>{byId[x.productId] ? pname(byId[x.productId]) : x.productName}</b></div>
                    <div className="rv-head"><Stars value={x.rating} size={13} /><span className="meta">{fmtDate(x.createdAt)}</span></div>
                    {x.comment && <p className="rv-text">{x.comment}</p>}
                    {x.photos.length > 0 && (
                      <ul className="rvgallery">
                        {x.photos.map((ph) => (
                          <li key={ph.id}><a href={ph.url} target="_blank" rel="noopener noreferrer"><img src={ph.url} alt={t('รูปจากรีวิว')} loading="lazy" /></a></li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
