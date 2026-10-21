import { Link } from 'react-router-dom';
import { useState } from 'react';
import { SHOP } from '../data/shopInfo';

// ท้ายหน้าที่ใช้ร่วมกัน: ลิงก์ไปหน้าเกี่ยวกับเรา / ติดต่อเรา
export default function SiteFooter() {
  const [minimal, setMinimal] = useState(() => document.documentElement.classList.contains('minimal'));
  const toggle = () => {
    const next = !minimal;
    document.documentElement.classList.toggle('minimal', next);
    try {
      localStorage.setItem('theme-style', next ? 'minimal' : 'aurora');
    } catch {
      /* ใช้ได้แค่ในหน้านี้ */
    }
    setMinimal(next);
  };
  return (
    <footer>
      <div className="wrap footrow">
        <span>© {new Date().getFullYear()} {SHOP.name}</span>
        <nav aria-label="เกี่ยวกับร้าน" className="footnav">
          <Link to="/about">เกี่ยวกับเรา</Link>
          <Link to="/contact">ติดต่อเรา</Link>
          <Link to="/help/privacy">นโยบายความเป็นส่วนตัว</Link>
          <button type="button" className="themebtn" onClick={toggle} aria-pressed={minimal}>ธีม: {minimal ? 'มินิมอล' : 'ออโรร่า'} (สลับ)</button>
        </nav>
      </div>
    </footer>
  );
}
