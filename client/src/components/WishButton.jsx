import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

// ปุ่มหัวใจเก็บเป็นรายการโปรด ถ้ายังไม่ล็อกอินจะพาไปหน้าเข้าสู่ระบบ
export default function WishButton({ product, className = '' }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const nav = useNavigate();
  const on = !!user && has(product.id);

  const click = (e) => {
    e.stopPropagation(); // ไม่ให้ไปเปิดหน้ารายละเอียดสินค้าตามการ์ด
    if (!user) nav('/login');
    else toggle(product.id);
  };

  return (
    <button
      type="button"
      className={'wish ' + className + (on ? ' on' : '')}
      aria-pressed={on}
      aria-label={(on ? 'เอาออกจากรายการโปรด ' : 'เก็บเป็นรายการโปรด ') + product.name}
      title={user ? (on ? 'เอาออกจากรายการโปรด' : 'เก็บเป็นรายการโปรด') : 'เข้าสู่ระบบเพื่อเก็บรายการโปรด'}
      onClick={click}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 8 3.5 5 6.6 5c2 0 3.5 1.1 5.4 3 1.9-1.9 3.4-3 5.4-3 3.1 0 5 3 3.8 6.2-1.7 4.7-9.2 9.3-9.2 9.3z"
          fill={on ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
