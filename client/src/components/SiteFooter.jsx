import { Link } from 'react-router-dom';
import { useState } from 'react';
import { SHOP } from '../data/shopInfo';
import { ARTICLES } from '../data/articles';
import { HELP_PAGES } from '../data/helpPages';
import { useShopInfo } from '../context/ShopInfoContext';
import { useI18n, LangSwitch } from '../i18n';

const lineHref = (id) => 'https://line.me/R/ti/p/' + (id.startsWith('@') ? encodeURIComponent(id) : '~' + encodeURIComponent(id));

// ท้ายหน้าที่ใช้ร่วมกัน: ลิงก์ด่วน บทความ ช่วยเหลือ และช่องทางติดต่อ (เมนูเหล่านี้ย้ายมาจากแถบด้านบน)
export default function SiteFooter() {
  const { t, lang } = useI18n();
  const L = lang === 'en' ? 'en' : 'th';
  const { info } = useShopInfo();
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
  const hasContact = info.lineId || info.facebook || info.phone || info.email || info.hours;
  return (
    <footer>
      <div className="wrap footcols">
        <nav aria-label={t('ลิงก์ด่วน')}>
          <h2>{t('ลิงก์ด่วน')}</h2>
          <ul>
            <li><Link to="/">{t('สินค้าทั้งหมด')}</Link></li>
            <li><Link to="/about">{t('เกี่ยวกับเรา')}</Link></li>
            <li><Link to="/contact">{t('ติดต่อเรา')}</Link></li>
          </ul>
        </nav>
        <nav aria-label={t('บทความ')}>
          <h2>{t('บทความ')}</h2>
          <ul>
            <li><Link to="/articles">{t('บทความทั้งหมด')}</Link></li>
            {ARTICLES.map((a) => <li key={a.slug}><Link to={'/articles/' + a.slug}>{a[L].title}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label={t('ช่วยเหลือ')}>
          <h2>{t('ช่วยเหลือ')}</h2>
          <ul>
            {HELP_PAGES.map((p) => <li key={p.slug}><Link to={'/help/' + p.slug}>{t(p.title)}</Link></li>)}
          </ul>
        </nav>
        {hasContact && (
          <div>
            <h2>{t('ติดตามและติดต่อเรา')}</h2>
            <ul>
              {info.lineId && <li><a href={lineHref(info.lineId)} target="_blank" rel="noopener noreferrer">LINE {info.lineId}</a></li>}
              {info.facebook && <li><a href={info.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>}
              {info.phone && <li><a href={'tel:' + info.phone.replace(/[^\d+]/g, '')}>{info.phone}</a></li>}
              {info.email && <li><a href={'mailto:' + info.email}>{info.email}</a></li>}
              {info.hours && <li className="pre footmeta">{info.hours}</li>}
            </ul>
          </div>
        )}
      </div>
      <div className="wrap footrow">
        <span>© {new Date().getFullYear()} {t(SHOP.name)}</span>
        <div className="footnav">
          <button type="button" className="themebtn" onClick={toggle} aria-pressed={minimal}>{t('ธีม: {name} (สลับ)', { name: t(minimal ? 'มินิมอล' : 'ออโรร่า') })}</button>
          <LangSwitch className="footlang" />
        </div>
      </div>
    </footer>
  );
}
