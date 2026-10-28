import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

// ข้อความเล็ก ๆ ลอยขึ้นมุมล่างของจอ (เช่น "เพิ่ม xxx ลงตะกร้าแล้ว" พร้อมปุ่มดูตะกร้า) หายเองใน 3.5 วินาที เอาเมาส์ชี้ค้างไว้เพื่อหยุดนับ
const ToastContext = createContext({ cartAdded: () => {} });
export const useToast = () => useContext(ToastContext);

const LIFE_MS = 3500;

export function ToastProvider({ children }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null); // { id, name, n }
  const timer = useRef(null);
  const last = useRef({ name: '', at: 0, n: 0 });

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);
  const arm = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), LIFE_MS);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  // เรียกเมื่อเพิ่มสินค้าลงตะกร้า: ถ้ากดซ้ำชิ้นเดิมต่อเนื่อง จะนับเป็น "+N" แทนที่จะขึ้นข้อความใหม่ซ้อนกัน
  const cartAdded = useCallback(
    (name) => {
      const now = Date.now();
      const same = last.current.name === name && now - last.current.at < LIFE_MS;
      const n = same ? last.current.n + 1 : 1;
      last.current = { name, at: now, n };
      setToast({ id: now, name, n });
      arm();
    },
    [arm]
  );

  const openCart = () => {
    hide();
    // หน้าที่มีตะกร้า (หน้าร้าน) ฟังเหตุการณ์นี้แล้วเปิดตะกร้าให้ ถ้าไม่มีใครรับ ให้ไปหน้าร้านพร้อมเปิดตะกร้า
    const handled = !window.dispatchEvent(new CustomEvent('open-cart', { cancelable: true }));
    if (!handled) navigate('/?cart=1');
  };

  return (
    <ToastContext.Provider value={{ cartAdded }}>
      {children}
      <div className="toastwrap" aria-live="polite" role="status">
        {toast && (
          <div key={toast.id} className="toast" onMouseEnter={() => clearTimeout(timer.current)} onMouseLeave={arm}>
            <span className="toastok" aria-hidden="true">&#10003;</span>
            <span className="toasttxt">
              <b>{toast.name}</b>
              <span>{toast.n > 1 ? t('เพิ่มลงตะกร้าแล้ว (กดเพิ่ม {n} ครั้ง)', { n: toast.n }) : t('เพิ่มลงตะกร้าแล้ว')}</span>
            </span>
            <button type="button" className="toastact" onClick={openCart}>{t('ดูตะกร้า')}</button>
            <button type="button" className="toastx" onClick={hide} aria-label={t('ปิด')}>&#10005;</button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

// หน้าที่มีตะกร้าของตัวเองเรียกใช้ เพื่อให้ปุ่ม "ดูตะกร้า" ในข้อความแจ้งเตือนเปิดตะกร้าของหน้านั้น (preventDefault = รับเรื่องแล้ว)
export function useOpenCartEvent(open) {
  useEffect(() => {
    const onOpen = (e) => {
      e.preventDefault();
      open();
    };
    window.addEventListener('open-cart', onOpen);
    return () => window.removeEventListener('open-cart', onOpen);
  }, [open]);
}
