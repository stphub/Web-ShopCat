import { Link, Navigate, useParams } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import { ArticleImage } from '../components/CatArt';
import { ARTICLES, ARTICLE_BY_SLUG } from '../data/articles';
import { useI18n } from '../i18n';

function Table({ table }) {
  return (
    <div className="arttable" role="region" tabIndex={0}>
      <table>
        <thead>
          <tr>{table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// หน้าบทความ (/articles/:slug) เนื้อหามาจาก data/articles.js
export default function Article() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const a = ARTICLE_BY_SLUG[slug];
  if (!a) return <Navigate to="/articles" replace />;
  const c = a[lang === 'en' ? 'en' : 'th'];
  const others = ARTICLES.filter((x) => x.slug !== slug);

  return (
    <div className="admin">
      <PageBar title={t('บทความ')} />
      <div className="navstrip"><SiteNav /></div>

      <header className="arthero">
        <div className="wrap arthero-in">
          <ArticleImage slug={a.slug} variant={a.art} className="arthero-art" title={c.title} />
          <div className="arthero-text">
            <span className="pill">{t('คู่มือดูแลแมว')}</span>
            <h1>{c.title}</h1>
            <p>{c.desc}</p>
            <span className="meta">{t('อ่านใช้เวลา {n} นาที', { n: a.minutes })}</span>
          </div>
        </div>
      </header>

      <main className="wrap adminmain artbody">
        {c.sections.map((s) => (
          <section key={s.h} className="artsec">
            <h2>{s.h}</h2>
            {s.p && s.p.map((x, i) => <p key={i}>{x}</p>)}
            {s.ol && <ol>{s.ol.map((x, i) => <li key={i}>{x}</li>)}</ol>}
            {s.ul && <ul>{s.ul.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            {s.table && <Table table={s.table} />}
            {s.tip && <p className="arttip"><b>{t('เคล็ดลับ')}</b> {s.tip}</p>}
          </section>
        ))}

        <p className="note artdisc">{t('ข้อมูลทั่วไปเพื่อประกอบการดูแลแมว ไม่ใช่คำแนะนำทางสัตวแพทย์ ถ้าแมวป่วย ตั้งท้อง หรือมีโรคประจำตัว ให้ปรึกษาสัตวแพทย์เสมอ')}</p>

        <section className="artcta">
          <ArticleImage slug={a.slug} variant={a.art} className="artcta-art" />
          <div className="artcta-text">
            <h2>{t('เลือกอาหารเปียกให้เจ้านาย')}</h2>
            <p>{t('ดูอาหารแมวทั้งหมดในร้าน กรองตามอายุแมวได้ทันที')}</p>
            <Link className="submit artcta-btn" to="/?cat=food">{t('ดูอาหารแมวในร้าน')}</Link>
          </div>
        </section>

        <section className="artmore">
          <h2>{t('บทความอื่น ๆ')}</h2>
          <ul className="helplinks">
            {others.map((o) => <li key={o.slug}><Link to={'/articles/' + o.slug}>{o[lang === 'en' ? 'en' : 'th'].title}</Link></li>)}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
