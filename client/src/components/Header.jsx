import { Link } from 'react-router-dom';
import Logo from './Logo';
import SiteNav from './SiteNav';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Header({ query, onQuery, onOpenCart }) {
  const { user, loading, logout } = useAuth();
  const { count } = useCart();
  const wish = useWishlist();

  return (
    <header className="top">
      <div className="bar">
        <Link className="logo" to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo />
          <span>ของแมวเหมียว</span>
        </Link>

        <div className="search">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="ค้นหา เช่น ปลาทูน่า ทราย ไม้ตกแมว"
            aria-label="ค้นหาสินค้า"
          />
        </div>

        <div className="acct" aria-live="polite">
          {loading ? null : user ? (
            <>
              <Avatar user={user} size={28} />
              <span className="who">สวัสดี {user.nickname || user.name}</span>
              <Link to="/wishlist">รายการโปรด{wish.count > 0 ? ` (${wish.count})` : ''}</Link>
              <Link to="/account">บัญชีของฉัน</Link>
              {user.role === 'admin' && <Link to="/admin">จัดการร้าน</Link>}
              <button onClick={logout}>ออกจากระบบ</button>
            </>
          ) : (
            <>
              <Link to="/login">เข้าสู่ระบบ</Link>
              <Link className="primary" to="/register">สมัครสมาชิก</Link>
            </>
          )}
        </div>

        <button className="cartbtn" onClick={onOpenCart} aria-label="เปิดตะกร้า">
          ตะกร้า <b className="num">{count}</b>
        </button>
      </div>
      <SiteNav />
    </header>
  );
}
