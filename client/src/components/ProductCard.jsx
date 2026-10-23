import { useState, useRef, useEffect } from 'react';
import Art from './Art';
import { Stars } from './Stars';
import WishButton from './WishButton';
import { baht } from '../data/products';
import { useCart } from '../context/CartContext';
import { useI18n } from '../i18n';

export default function ProductCard({ product, onOpen }) {
  const { change } = useCart();
  const { t, pname, psize } = useI18n();
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const out = product.stock <= 0;
  const off = product.was ? Math.round((1 - product.price / product.was) * 100) : 0;

  const add = () => {
    change(product.id, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 900);
  };

  return (
    <article className="card">
      {/* คลิกที่ภาพเพื่อเปิดรายละเอียดได้ด้วยเมาส์/นิ้ว (ผู้ใช้คีย์บอร์ดใช้ปุ่มชื่อสินค้าด้านล่าง) */}
      <div className="cardart" onClick={() => onOpen(product.id)}>
        <Art product={product}>{off > 0 && <span className="badge">{t('ลด {n}%', { n: off })}</span>}</Art>
        <WishButton product={product} className="oncard" />
        {product.photos && product.photos.length > 1 && <span className="photocount" aria-label={t('{n} รูป', { n: product.photos.length })}>{t('{n} รูป', { n: product.photos.length })}</span>}
      </div>
      <div className="info">
        <h3>
          <button className="namebtn" onClick={() => onOpen(product.id)} aria-label={t('ดูรายละเอียดและรีวิว {name}', { name: pname(product) })}>
            {pname(product)}
          </button>
        </h3>
        <div className="meta">
          {psize(product)}
          {!out && product.stock <= 5 ? ' · ' + t('เหลือ {n} ชิ้น', { n: product.stock }) : ''}
        </div>
        <div className="rate">
          {product.ratingCount > 0 ? (
            <>
              <Stars value={product.ratingAvg} size={14} />
              <span className="num meta">{product.ratingAvg.toFixed(1)} ({product.ratingCount})</span>
            </>
          ) : (
            <span className="meta">{t('ยังไม่มีรีวิว')}</span>
          )}
        </div>
        <div className="buy">
          <div className="price num">
            {product.was > 0 && <s>{baht(product.was)}</s>}
            {baht(product.price)}
          </div>
          <button className="add" onClick={add} disabled={out} aria-label={t('หยิบ {name} ใส่ตะกร้า', { name: pname(product) })}>
            {out ? t('สินค้าหมด') : added ? t('เพิ่มแล้ว') : t('ใส่ตะกร้า')}
          </button>
        </div>
      </div>
    </article>
  );
}
