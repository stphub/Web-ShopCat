import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { baht } from '../data/products';
import Header from '../components/Header';
import SiteFooter from '../components/SiteFooter';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import ProductDialog from '../components/ProductDialog';
import { AGES, CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { useI18n } from '../i18n';

export default function Shop() {
  const { t } = useI18n();
  const { products: PRODUCTS, loading, error, reload, shipping, returnDays } = useProducts();
  // หมวดสินค้าอยู่ใน URL (/?cat=food) เมนู "สินค้า" ด้านบนจึงลิงก์เข้าหมวดได้ และรีเฟรชแล้วหมวดไม่หาย
  const [sp, setSp] = useSearchParams();
  const catParam = sp.get('cat');
  const cat = CATEGORIES.some(([id]) => id === catParam) ? catParam : 'all';
  const setCat = (id) => setSp(id === 'all' ? {} : { cat: id }, { replace: true });
  const [age, setAge] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('pop');
  const [cartOpen, setCartOpen] = useState(() => sp.get('cart') === '1'); // ลิงก์จากปุ่ม "สั่งซ้ำ" เปิดตะกร้าให้เลย
  const [openId, setOpenId] = useState(null); // สินค้าที่เปิดดูรายละเอียด/รีวิวอยู่

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = PRODUCTS.filter((p) => {
      if (cat !== 'all' && p.cat !== cat) return false;
      // กรองตามวัย: ใช้กับอาหารที่ระบุวัย ส่วนของอื่นเป็น "ทุกวัย" ให้แสดงเสมอ
      if (age !== 'all' && p.age !== 'all' && p.age !== age) return false;
      if (q && !(p.name + ' ' + (p.nameEn || '') + ' ' + p.size + ' ' + (p.sizeEn || '')).toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'low') out.sort((a, b) => a.price - b.price);
    else if (sort === 'high') out.sort((a, b) => b.price - a.price);
    else out.sort((a, b) => b.pop - a.pop);
    return out;
  }, [PRODUCTS, cat, age, query, sort]);

  // เลือกหมวดจากเมนู หรือพิมพ์ค้นหา: เลื่อนลงมาที่รายการสินค้าให้ทันที (ไม่เลื่อนถ้าอยู่แถวนั้นอยู่แล้ว)
  const goToProducts = () => {
    const el = document.getElementById('products');
    if (!el) return;
    const bar = document.querySelector('header.top');
    const offset = (bar ? bar.getBoundingClientRect().height : 0) + 12;
    const top = el.getBoundingClientRect().top - offset;
    if (Math.abs(top) < 24) return;
    window.scrollTo({ top: Math.max(0, window.scrollY + top), behavior: 'smooth' });
  };
  const firstCat = useRef(true);
  useEffect(() => {
    if (firstCat.current) {
      firstCat.current = false;
      if (cat === 'all') return undefined; // เข้าหน้าแรกปกติ ไม่ต้องเลื่อน
    }
    const t = setTimeout(goToProducts, 60); // รอให้รายการสินค้าอัปเดตก่อน
    return () => clearTimeout(t);
  }, [cat]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!query.trim()) return undefined;
    const t = setTimeout(goToProducts, 350); // รอให้พิมพ์จบคำก่อนค่อยเลื่อน
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const ageHint = AGES.find((a) => a[0] === age)[2];

  return (
    <>
      <Header query={query} onQuery={setQuery} onOpenCart={() => setCartOpen(true)} />

      <section className="aurora hero2">
        <span className="blob b1" aria-hidden="true" />
        <span className="blob b2" aria-hidden="true" />
        <span className="blob b3" aria-hidden="true" />
        <div className="wrap hero2in">
          <div>
            <span className="pill">{t('ร้านของแมวออนไลน์')}</span>
            <h1>{t('ของใช้ของกินสำหรับ')}<em>{t('เจ้านาย')}</em> {t('ครบในที่เดียว')}</h1>
            <p>{t('อาหารเม็ด อาหารเปียก ขนม ทรายแมว ของเล่น และที่ลับเล็บ ซื้อครบ {price} ส่งฟรี', { price: baht(shipping.freeFrom) })}</p>
            <div className="ctabtns left">
              <a className="cbtn cb-hot" href="#products">{t('เลือกซื้อสินค้า')}</a>
              <Link className="cbtn cb-glass" to="/contact">{t('ติดต่อเรา')}</Link>
            </div>
          </div>
          <div className="finder">
            <label id="ageLabel">{t('เจ้านายอายุเท่าไหร่')}</label>
            <div className="ages" role="group" aria-labelledby="ageLabel">
              {AGES.map(([id, label]) => (
                <button key={id} aria-pressed={age === id} onClick={() => setAge(id)}>{t(label)}</button>
              ))}
            </div>
            <small>{t(ageHint)}</small>
          </div>
        </div>
      </section>

      <main className="wrap shopmain">
        <ul className="infocards" aria-label={t('จุดเด่นของร้าน')}>
          <li><span className="cicon"><Icon name="truck" /></span><b>{t('ส่งฟรี')}</b><div>{t('เมื่อซื้อครบ {price} (ปกติค่าส่ง {fee})', { price: baht(shipping.freeFrom), fee: baht(shipping.fee) })}</div></li>
          <li><span className="cicon"><Icon name="star" /></span><b>{t('รีวิวจากคนซื้อจริง')}</b><div>{t('เขียนรีวิวได้หลังกดยืนยันรับสินค้าแล้วเท่านั้น')}</div></li>
          <li><span className="cicon"><Icon name="undo" /></span><b>{t('แจ้งคืนสินค้าได้')}</b><div>{t('ภายใน {n} วันหลังรับสินค้า พร้อมแนบรูปในเว็บ', { n: returnDays })}</div></li>
          <li><span className="cicon"><Icon name="chat" /></span><b>{t('ถามร้านได้ทุกเมื่อ')}</b><div><Link to="/contact">{t('ติดต่อเรา')}</Link> {t('ทางโทร LINE หรืออีเมล')}</div></li>
        </ul>

        <div className="tools" id="products">
          <div className="chips" role="group" aria-label={t('หมวดสินค้า')}>
            {CATEGORIES.map(([id, label]) => (
              <button key={id} aria-pressed={cat === id} onClick={() => setCat(id)}>{t(label)}</button>
            ))}
          </div>
          <label className="sort">
            {t('เรียง')}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="pop">{t('แนะนำ')}</option>
              <option value="low">{t('ราคาต่ำไปสูง')}</option>
              <option value="high">{t('ราคาสูงไปต่ำ')}</option>
            </select>
          </label>
        </div>

        <p className="count">{t('แสดง {n} จาก {total} รายการ', { n: list.length, total: PRODUCTS.length })}</p>
        <div className="grid">
          {loading ? (
            <div className="empty">{t('กำลังโหลดสินค้า...')}</div>
          ) : error ? (
            <div className="empty">
              {t('โหลดสินค้าไม่สำเร็จ:')} {error}
              <div><button className="add" style={{ marginTop: 12 }} onClick={reload}>{t('ลองใหม่')}</button></div>
            </div>
          ) : list.length === 0 ? (
            <div className="empty">{t('ไม่พบสินค้าที่ตรงกับตัวกรอง ลองล้างคำค้นหรือเลือกหมวดอื่น')}</div>
          ) : (
            list.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpenId} />)
          )}
        </div>
      </main>

      <SiteFooter />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {openId && <ProductDialog productId={openId} onClose={() => setOpenId(null)} />}
    </>
  );
}
