import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// เปลี่ยนหน้า (path เปลี่ยน) แล้วเลื่อนขึ้นบนสุดทันที ไม่ทำเมื่อเปลี่ยนแค่ ?query หรือ #hash (เช่น เลือกหมวดสินค้า)
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
