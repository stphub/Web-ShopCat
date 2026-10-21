import { Link } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import PageHero from '../components/PageHero';
import SiteFooter from '../components/SiteFooter';
import { SHOP } from '../data/shopInfo';

export default function About() {
  return (
    <div className="admin">
      <PageBar title="เกี่ยวกับเรา" />
      <div className="navstrip"><SiteNav /></div>
      <PageHero label="About Us" title="เกี่ยวกับเรา" desc={SHOP.tagline} />
      <main className="wrap adminmain infopage">
        <section className="panel">
          <h2>{SHOP.name}</h2>
          {SHOP.about.map((t, i) => <p key={i}>{t}</p>)}
        </section>

        <section className="panel" aria-labelledby="values-title">
          <h2 id="values-title">สิ่งที่เราใส่ใจ</h2>
          <ul className="values">
            {SHOP.values.map(([title, text]) => (
              <li key={title}>
                <b>{title}</b>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <p style={{ margin: 0 }}>มีคำถามเกี่ยวกับสินค้าหรือการสั่งซื้อ? <Link to="/contact">ติดต่อเรา</Link> ได้เลย หรือ <Link to="/">ไปเลือกสินค้า</Link></p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
