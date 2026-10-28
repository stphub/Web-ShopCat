import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import ProductCard from '../components/ProductCard';
import ProductDialog from '../components/ProductDialog';
import CartDrawer from '../components/CartDrawer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useWishlist } from '../context/WishlistContext';
import { useI18n } from '../i18n';
import { useOpenCartEvent } from '../context/ToastContext';

// หน้ารายการโปรดของฉัน: สินค้าที่กดหัวใจไว้ (ใหม่สุดก่อน)
export default function Wishlist() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { byId, loading: loadingProducts } = useProducts();
  const { ids, error } = useWishlist();
  const { count } = useCart();
  const [openId, setOpenId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  useOpenCartEvent(() => setCartOpen(true));

  if (loading) return <div className="authwrap"><p className="sub">{t('กำลังโหลด...')}</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  // สินค้าที่ถูกลบหรือซ่อนจากหน้าร้านแล้วจะไม่ขึ้น
  const items = ids.map((id) => byId[id]).filter(Boolean);

  return (
    <div className="admin">
      <PageBar title={t('รายการโปรดของฉัน')} />
      <div className="navstrip"><SiteNav /></div>
      <main className="wrap adminmain">
        <div className="wishhead">
          <p className="note" style={{ margin: 0 }}>{t('{n} รายการ กดหัวใจที่สินค้าอีกครั้งเพื่อเอาออก', { n: items.length })}</p>
          <button className="cartbtn" onClick={() => setCartOpen(true)} aria-label={t('เปิดตะกร้า')}>{t('ตะกร้า')} <b className="num">{count}</b></button>
        </div>
        {error && <div className="err" role="alert">{error}</div>}

        {loadingProducts ? (
          <p className="note">{t('กำลังโหลด...')}</p>
        ) : items.length === 0 ? (
          <section className="panel">
            <p style={{ margin: 0 }}>{t('ยังไม่มีรายการโปรด กดรูปหัวใจที่มุมของสินค้าเพื่อเก็บไว้ที่นี่')} <Link to="/">{t('ไปเลือกสินค้า')}</Link></p>
          </section>
        ) : (
          <div className="grid">
            {items.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpenId} />)}
          </div>
        )}
      </main>
      <SiteFooter />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {openId && <ProductDialog productId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
