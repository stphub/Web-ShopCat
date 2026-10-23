import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';
import SiteNav from './SiteNav';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useI18n, LangSwitch } from '../i18n';

// เมนูบัญชีสำหรับจอเล็ก: รวมลิงก์บัญชีไว้ในปุ่มเดียว (จอใหญ่ใช้แถบปุ่มปกติ)
function AccountMenu({ user, loading, logout, wishCount }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  if (loading) return null;
  const close = () => setOpen(false);
  return (
    <div className={'acctm ' + (user ? 'member' : 'guest')} ref={box}>
      <button type="button" className="acctbtn" aria-haspopup="menu" aria-expanded={open} aria-label={user ? t('เมนูบัญชีของ {name}', { name: user.nickname || user.name }) : t('เข้าสู่ระบบ / สมัครสมาชิก')} onClick={() => setOpen((v) => !v)}>
        {user ? <Avatar user={user} size={28} /> : <Icon name="user" />}
      </button>
      {open && (
        <div className="acctpanel" role="menu">
          {user ? (
            <>
              <div className="acctwho">{t('สวัสดี {name}', { name: user.nickname || user.name })}</div>
              <Link role="menuitem" to="/account" onClick={close}>{t('บัญชีของฉัน')}</Link>
              <Link role="menuitem" to="/account/orders" onClick={close}>{t('คำสั่งซื้อของฉัน')}</Link>
              <Link role="menuitem" to="/wishlist" onClick={close}>{t('รายการโปรด')}{wishCount > 0 ? ` (${wishCount})` : ''}</Link>
              {user.role === 'admin' && <Link role="menuitem" to="/admin" onClick={close}>{t('จัดการร้าน')}</Link>}
              <button type="button" role="menuitem" onClick={() => { close(); logout(); }}>{t('ออกจากระบบ')}</button>
            </>
          ) : (
            <>
              <Link role="menuitem" to="/login" onClick={close}>{t('เข้าสู่ระบบ')}</Link>
              <Link role="menuitem" to="/register" onClick={close}>{t('สมัครสมาชิก')}</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header({ query, onQuery, onOpenCart }) {
  const { t } = useI18n();
  const { user, loading, logout } = useAuth();
  const { count } = useCart();
  const wish = useWishlist();

  return (
    <header className="top">
      <div className="bar">
        <Link className="logo" to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo />
          <span>{t('ของแมวเหมียว')}</span>
        </Link>

        <SiteNav />

        <div className="search">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t('ค้นหาสินค้า')}
            aria-label={t('ค้นหาสินค้า')}
          />
        </div>

        <div className="acct" aria-live="polite">
          {loading || user ? null : (
            <>
              <Link to="/login">{t('เข้าสู่ระบบ')}</Link>
              <Link className="primary" to="/register">{t('สมัครสมาชิก')}</Link>
            </>
          )}
        </div>

        <AccountMenu user={user} loading={loading} logout={logout} wishCount={wish.count} />

        <LangSwitch className="hdrlang" />

        <button className="cartbtn" onClick={onOpenCart} aria-label={t('เปิดตะกร้า')}>
          {t('ตะกร้า')} <b className="num">{count}</b>
        </button>
      </div>
    </header>
  );
}
