import { useState, useRef, useEffect } from 'react';
import Art from './Art';
import { Stars } from './Stars';
import WishButton from './WishButton';
import { baht } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onOpen }) {
  const { change } = useCart();
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
        <Art product={product}>{off > 0 && <span className="badge">ลด {off}%</span>}</Art>
        <WishButton product={product} className="oncard" />
        {product.photos && product.photos.length > 1 && <span className="photocount" aria-label={product.photos.length + ' รูป'}>{product.photos.length} รูป</span>}
      </div>
      <div className="info">
        <h3>
          <button className="namebtn" onClick={() => onOpen(product.id)} aria-label={`ดูรายละเอียดและรีวิว ${product.name}`}>
            {product.name}
          </button>
        </h3>
        <div className="meta">
          {product.size}
          {!out && product.stock <= 5 ? ` · เหลือ ${product.stock} ชิ้น` : ''}
        </div>
        <div className="rate">
          {product.ratingCount > 0 ? (
            <>
              <Stars value={product.ratingAvg} size={14} />
              <span className="num meta">{product.ratingAvg.toFixed(1)} ({product.ratingCount})</span>
            </>
          ) : (
            <span className="meta">ยังไม่มีรีวิว</span>
          )}
        </div>
        <div className="buy">
          <div className="price num">
            {product.was > 0 && <s>{baht(product.was)}</s>}
            {baht(product.price)}
          </div>
          <button className="add" onClick={add} disabled={out} aria-label={`หยิบ ${product.name} ใส่ตะกร้า`}>
            {out ? 'สินค้าหมด' : added ? 'เพิ่มแล้ว' : 'ใส่ตะกร้า'}
          </button>
        </div>
      </div>
    </article>
  );
}
