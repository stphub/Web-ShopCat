import { Link } from 'react-router-dom';
import { useState } from 'react';
import { SHOP } from '../data/shopInfo';
import { useI18n, LangSwitch } from '../i18n';

// ท้ายหน้าที่ใช้ร่วมกัน: ลิงก์ไปหน้าเกี่ยวกับเรา / ติดต่อเรา
export default function SiteFooter() {
  const { t } = useI18n();
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
        <span>© {new Date().getFullYear()} {t(SHOP.name)}</span>
        <nav aria-label={t('เกี่ยวกับร้าน')} className="footnav">
          <Link to="/articles">{t('บทความ')}</Link>
          <Link to="/about">{t('เกี่ยวกับเรา')}</Link>
          <Link to="/contact">{t('ติดต่อเรา')}</Link>
          <Link to="/help/privacy">{t('นโยบายความเป็นส่วนตัว')}</Link>
          <button type="button" className="themebtn" onClick={toggle} aria-pressed={minimal}>{t('ธีม: {name} (สลับ)', { name: t(minimal ? 'มินิมอล' : 'ออโรร่า') })}</button>
          <LangSwitch className="footlang" />
        </nav>
      </div>
    </footer>
  );
}
