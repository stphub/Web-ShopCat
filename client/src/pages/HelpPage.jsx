import { Link, Navigate, useParams } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import PageHero from '../components/PageHero';
import SiteFooter from '../components/SiteFooter';
import { HELP_BY_SLUG, HELP_PAGES } from '../data/helpPages';
import { useProducts } from '../context/ProductsContext';

// หน้าช่วยเหลือ/นโยบาย (/help/:slug) เนื้อหามาจาก data/helpPages.js
export default function HelpPage() {
  const { slug } = useParams();
  const { shipping, returnDays, payMinutes } = useProducts();
  const page = HELP_BY_SLUG[slug];
  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="admin">
      <PageBar title={page.title} />
      <div className="navstrip"><SiteNav /></div>
      <PageHero label="Help Center" title={page.title} desc={page.desc} />
      <main className="wrap adminmain infopage">
        {page.sections({ ...shipping, returnDays, payMinutes }).map((s) => (
          <section key={s.h} className="panel helpsec">
            <h2>{s.h}</h2>
            {s.p && s.p.map((t, i) => <p key={i}>{t}</p>)}
            {s.ol && <ol>{s.ol.map((t, i) => <li key={i}>{t}</li>)}</ol>}
            {s.ul && <ul>{s.ul.map((t, i) => <li key={i}>{t}</li>)}</ul>}
          </section>
        ))}

        <section className="panel">
          <h2>หัวข้อช่วยเหลืออื่น</h2>
          <ul className="helplinks">
            {HELP_PAGES.filter((p) => p.slug !== slug).map((p) => (
              <li key={p.slug}><Link to={'/help/' + p.slug}>{p.title}</Link></li>
            ))}
          </ul>
          <p className="note" style={{ marginTop: 12 }}>ยังไม่พบคำตอบ? <Link to="/contact">ติดต่อเรา</Link></p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
