import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n';

const canHover = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// กรอบรูปสินค้า: เมาส์ชี้แล้วซูมตามตำแหน่งเมาส์ (เฉพาะอุปกรณ์ที่มีเมาส์) กดเพื่อเปิดดูเต็มจอ ปัดซ้าย/ขวาบนมือถือเพื่อเปลี่ยนรูป
export function ZoomFrame({ enabled, onOpen, onSwipe, children }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  if (!enabled) return children;

  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%');
    el.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%');
  };

  return (
    <div
      ref={ref}
      className={'zoomframe' + (zoom ? ' zooming' : '')}
      role="button"
      tabIndex={0}
      aria-label={t('กดเพื่อขยายรูป')}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      onMouseEnter={() => canHover() && setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={(e) => zoom && move(e)}
      onTouchStart={(e) => {
        const p = e.touches[0];
        touch.current = { x: p.clientX, y: p.clientY };
      }}
      onTouchEnd={(e) => {
        const s = touch.current;
        touch.current = null;
        if (!s || !onSwipe) return;
        const p = e.changedTouches[0];
        const dx = p.clientX - s.x;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(p.clientY - s.y) * 1.5) onSwipe(dx < 0 ? 1 : -1);
      }}
    >
      {children}
      <span className="zoomhint" aria-hidden="true">&#128269;</span>
    </div>
  );
}

// ดูรูปเต็มจอ: ลูกศร/ปุ่มเปลี่ยนรูป, Esc ปิด, กดที่รูปเพื่อซูม 2 เท่า (เลื่อนเมาส์เพื่อดูมุมอื่น), ปัดซ้ายขวาบนมือถือ
export function Lightbox({ photos, index, onIndex, onClose, alt }) {
  const { t } = useI18n();
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const closeRef = useRef(null);
  const touch = useRef(null);
  const n = photos.length;
  const go = (d) => {
    setZoomed(false);
    onIndex((index + d + n) % n);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && n > 1) go(-1);
      else if (e.key === 'ArrowRight' && n > 1) go(1);
    };
    document.addEventListener('keydown', onKey);
    if (closeRef.current) closeRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const ph = photos[Math.min(index, n - 1)];
  const track = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(((e.clientX - r.left) / r.width) * 100 + '% ' + ((e.clientY - r.top) / r.height) * 100 + '%');
  };

  return createPortal(
    <div className="lbscrim" role="dialog" aria-modal="true" aria-label={alt} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button ref={closeRef} type="button" className="lbx" onClick={onClose} aria-label={t('ปิดรูป')}>&#10005;</button>
      {n > 1 && <button type="button" className="lbnav prev" onClick={() => go(-1)} aria-label={t('รูปก่อนหน้า')}>&#8249;</button>}
      <div
        className={'lbstage' + (zoomed ? ' zoomed' : '')}
        onMouseMove={zoomed ? track : undefined}
        onTouchStart={(e) => {
          const p = e.touches[0];
          touch.current = { x: p.clientX, y: p.clientY };
        }}
        onTouchEnd={(e) => {
          const s = touch.current;
          touch.current = null;
          if (!s || zoomed || n < 2) return;
          const p = e.changedTouches[0];
          const dx = p.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(p.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1);
        }}
      >
        <img
          src={ph.url}
          alt={alt}
          draggable="false"
          style={zoomed ? { transform: 'scale(2.2)', transformOrigin: origin } : undefined}
          onClick={(e) => {
            track(e);
            setZoomed((z) => !z);
          }}
        />
      </div>
      {n > 1 && <button type="button" className="lbnav next" onClick={() => go(1)} aria-label={t('รูปถัดไป')}>&#8250;</button>}
      {n > 1 && <div className="lbcount num" aria-live="polite">{Math.min(index, n - 1) + 1} / {n}</div>}
    </div>,
    document.body
  );
}

// แถบตะกร้าลอยด้านล่างบนมือถือ: แสดงจำนวนชิ้นและยอดรวม กดแล้วเปิดตะกร้า (ซ่อนเมื่อตะกร้าว่าง)
export function MobileCartBar({ count, total, onOpen, hidden }) {
  const { t } = useI18n();
  if (!count || hidden) return null;
  return (
    <button type="button" className="cartbar" onClick={onOpen} aria-label={t('เปิดตะกร้า')}>
      <span className="cb-left">
        <span className="cb-icon" aria-hidden="true">&#128722;<b className="num">{count}</b></span>
        <span>{t('ตะกร้าของคุณ')}</span>
      </span>
      <span className="cb-right num">฿{total.toLocaleString('th-TH')} <i aria-hidden="true">&#8250;</i></span>
    </button>
  );
}
