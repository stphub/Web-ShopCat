import { Link } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import PageHero from '../components/PageHero';
import SiteFooter from '../components/SiteFooter';
import { ArticleImage } from '../components/CatArt';
import { ARTICLES } from '../data/articles';
import { useI18n } from '../i18n';

// หน้ารวมบทความดูแลแมว (/articles)
export default function Articles() {
  const { t, lang } = useI18n();
  const L = lang === 'en' ? 'en' : 'th';
  return (
    <div className="admin">
      <PageBar title={t('บทความ')} />
      <div className="navstrip"><SiteNav /></div>
      <PageHero label="Cat Care Guide" title={t('บทความดูแลแมว')} desc={t('ความรู้เรื่องอาหารและการดูแลเจ้านาย เขียนให้อ่านง่าย')} />
      <main className="wrap adminmain artlist">
        <ul className="artgrid">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link className="artcard" to={'/articles/' + a.slug}>
                <ArticleImage slug={a.slug} variant={a.art} />
                <div className="artcardbody">
                  <h2>{a[L].title}</h2>
                  <p>{a[L].desc}</p>
                  <span className="meta">{t('อ่านใช้เวลา {n} นาที', { n: a.minutes })} · {t('อ่านต่อ')} →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
