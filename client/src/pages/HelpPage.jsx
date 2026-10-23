import { Link, Navigate, useParams } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import PageHero from '../components/PageHero';
import SiteFooter from '../components/SiteFooter';
import { HELP_BY_SLUG, HELP_PAGES } from '../data/helpPages';
import { useProducts } from '../context/ProductsContext';
import { useI18n } from '../i18n';

// หน้าช่วยเหลือ/นโยบาย (/help/:slug) เนื้อหามาจาก data/helpPages.js
export default function HelpPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const { shipping, returnDays, payMinutes } = useProducts();
  const page = HELP_BY_SLUG[slug];
  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="admin">
      <PageBar title={t(page.title)} />
      <div className="navstrip"><SiteNav /></div>
      <PageHero label="Help Center" title={t(page.title)} desc={t(page.desc)} />
      <main className="wrap adminmain infopage">
        {page.sections({ ...shipping, returnDays, payMinutes }).map((s) => (
          <section key={s.h} className="panel helpsec">
            <h2>{t(s.h)}</h2>
            {s.p && s.p.map((x, i) => <p key={i}>{t(x)}</p>)}
            {s.ol && <ol>{s.ol.map((x, i) => <li key={i}>{t(x)}</li>)}</ol>}
            {s.ul && <ul>{s.ul.map((x, i) => <li key={i}>{t(x)}</li>)}</ul>}
          </section>
        ))}

        <section className="panel">
          <h2>{t('หัวข้อช่วยเหลืออื่น')}</h2>
          <ul className="helplinks">
            {HELP_PAGES.filter((p) => p.slug !== slug).map((p) => (
              <li key={p.slug}><Link to={'/help/' + p.slug}>{t(p.title)}</Link></li>
            ))}
          </ul>
          <p className="note" style={{ marginTop: 12 }}>{t('ยังไม่พบคำตอบ?')} <Link to="/contact">{t('ติดต่อเรา')}</Link></p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
