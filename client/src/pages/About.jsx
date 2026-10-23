import { Link } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import PageHero from '../components/PageHero';
import SiteFooter from '../components/SiteFooter';
import { SHOP } from '../data/shopInfo';
import { useI18n } from '../i18n';

export default function About() {
  const { t } = useI18n();
  return (
    <div className="admin">
      <PageBar title={t('เกี่ยวกับเรา')} />
      <div className="navstrip"><SiteNav /></div>
      <PageHero label="About Us" title={t('เกี่ยวกับเรา')} desc={t(SHOP.tagline)} />
      <main className="wrap adminmain infopage">
        <section className="panel">
          <h2>{t(SHOP.name)}</h2>
          {SHOP.about.map((para, i) => <p key={i}>{t(para)}</p>)}
        </section>

        <section className="panel" aria-labelledby="values-title">
          <h2 id="values-title">{t('สิ่งที่เราใส่ใจ')}</h2>
          <ul className="values">
            {SHOP.values.map(([title, text]) => (
              <li key={title}>
                <b>{t(title)}</b>
                <span>{t(text)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <p style={{ margin: 0 }}>{t('มีคำถามเกี่ยวกับสินค้าหรือการสั่งซื้อ?')} <Link to="/contact">{t('ติดต่อเรา')}</Link> {t('ได้เลย หรือ')} <Link to="/">{t('ไปเลือกสินค้า')}</Link></p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
