import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { HELP_PAGES } from '../data/helpPages';
import { ARTICLES } from '../data/articles';
import { useI18n } from '../i18n';

// เมนูนำทางด้านบน: รายการที่มีลูกศร ⌄ กดแล้วมีเมนูย่อยลงมา และเมนูของหน้าที่เปิดอยู่จะมีเส้นใต้สี
const MENU = [
  {
    label: 'สินค้า',
    items: CATEGORIES.map(([id, label]) => ({
      label: id === 'all' ? 'สินค้าทั้งหมด' : label,
      desc: id === 'all' ? 'ดูสินค้าทุกหมวด' : '',
      to: id === 'all' ? '/' : '/?cat=' + id,
    })),
  },
  {
    label: 'ช่วยเหลือ',
    items: HELP_PAGES.map((p) => ({ label: p.title, desc: p.desc, to: '/help/' + p.slug })),
  },
  {
    label: 'เกี่ยวกับเรา',
    items: [
      { label: 'เรื่องราวของร้าน', desc: 'เราคือใคร และสิ่งที่เราใส่ใจ', to: '/about' },
      { label: 'ติดต่อเรา', desc: 'ส่งข้อความหรือดูช่องทางติดต่อ', to: '/contact' },
    ],
  },
];

function Chevron({ open }) {
  return (
    <svg className={'chev' + (open ? ' open' : '')} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const pathOf = (to) => to.split('?')[0];

function Dropdown({ item, pathname, here }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = item.items.some((i) => pathOf(i.to) === pathname);

  // ปิดเมื่อเปลี่ยนหน้า คลิกที่อื่น หรือกด Escape
  useEffect(() => setOpen(false), [here]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="navdrop" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={'navitem' + (active ? ' on' : '')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {t(item.label)}
        <Chevron open={open} />
      </button>
      {open && (
        <ul className="navmenu">
          {item.items.map((i) => (
            <li key={i.to}>
              <Link to={i.to} aria-current={i.to === here ? 'page' : undefined}>
                <b>{t(i.label)}</b>
                {i.desc && <span>{t(i.desc)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SiteNav() {
  const { t, lang } = useI18n();
  const L = lang === 'en' ? 'en' : 'th';
  // เมนู "บทความ" สร้างตามภาษาที่เลือก (ชื่อบทความมีทั้งไทยและอังกฤษใน data/articles.js)
  const articles = {
    label: 'บทความ',
    items: [
      { label: 'บทความทั้งหมด', desc: 'คู่มือดูแลแมวและเลือกอาหาร', to: '/articles' },
      ...ARTICLES.map((a) => ({ label: a[L].title, desc: '', to: '/articles/' + a.slug })),
    ],
  };
  const menu = [MENU[0], articles, ...MENU.slice(1)];
  const { pathname, search } = useLocation();
  const here = pathname + search;
  return (
    <nav className="sitenav" aria-label={t('เมนูหลัก')}>
      {menu.map((m) => (
        <Dropdown key={m.label} item={m} pathname={pathname} here={here} />
      ))}
    </nav>
  );
}
