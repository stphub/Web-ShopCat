import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import Icon from '../components/Icon';
import SiteFooter from '../components/SiteFooter';
import { api } from '../api';
import { SHOP } from '../data/shopInfo';
import { useShopInfo } from '../context/ShopInfoContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

const lineHref = (id) => 'https://line.me/R/ti/p/' + (id.startsWith('@') ? encodeURIComponent(id) : '~' + encodeURIComponent(id));

// ปุ่มติดต่อหลักในส่วนหัว แสดงเฉพาะช่องที่ร้านตั้งค่าไว้
function heroButtons(info, t) {
  const list = [];
  if (info.phone) list.push({ key: 'phone', cls: 'cb-phone', href: 'tel:' + info.phone.replace(/[^\d+]/g, ''), label: t('โทร {n}', { n: info.phone }) });
  if (info.lineId) list.push({ key: 'line', cls: 'cb-line', href: lineHref(info.lineId), label: 'LINE ' + info.lineId, external: true, icon: true });
  if (info.email) list.push({ key: 'email', cls: 'cb-glass', href: 'mailto:' + info.email, label: info.email });
  return list;
}

// การ์ดข้อมูลใต้ส่วนหัว: [ไอคอน, หัวข้อ, เนื้อหา]
function infoCards(info) {
  const list = [];
  if (info.address) list.push(['pin', 'ที่อยู่ร้าน', <span className="pre">{info.address}</span>]);
  if (info.phone) list.push(['phone', 'โทรศัพท์', <a href={'tel:' + info.phone.replace(/[^\d+]/g, '')}>{info.phone}</a>]);
  if (info.lineId) list.push(['chat', 'LINE', <a href={lineHref(info.lineId)} target="_blank" rel="noopener noreferrer">{info.lineId}</a>]);
  if (info.email) list.push(['mail', 'อีเมล', <a href={'mailto:' + info.email}>{info.email}</a>]);
  if (info.facebook) list.push(['globe', 'Facebook', <a href={info.facebook} target="_blank" rel="noopener noreferrer">{info.facebook.replace(/^https?:\/\/(www\.)?/, '')}</a>]);
  if (info.hours) list.push(['clock', 'เวลาทำการ', <span className="pre">{info.hours}</span>]);
  return list;
}

export default function Contact() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [v, setV] = useState({ name: null, email: null, message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null); // { message, field }
  const [done, setDone] = useState('');
  const { info } = useShopInfo();
  const buttons = heroButtons(info, t);
  const cards = infoCards(info);

  // ถ้าล็อกอินอยู่ ใส่ชื่อและอีเมลให้ก่อน (ยังแก้ได้)
  const name = v.name !== null ? v.name : user ? user.name : '';
  const email = v.email !== null ? v.email : user ? user.email : '';
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const invalid = (k) => (error && error.field === k ? 'true' : undefined);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const d = await api.contact({ name, email, message: v.message });
      setDone(d.message);
      setV({ name: null, email: null, message: '' });
    } catch (ex) {
      setError({ message: ex.message, field: ex.field });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin">
      <PageBar title={t('ติดต่อเรา')} />
      <div className="navstrip"><SiteNav /></div>
      <section className={'contacthero' + (cards.length ? ' withcards' : '')} aria-labelledby="ct-title">
        <span className="pill">Contact Us</span>
        <h1 id="ct-title">{t('ติดต่อเรา')}</h1>
        <p>{t('พร้อมให้คำปรึกษาและช่วยเหลือคุณทุกเรื่อง ติดต่อทีมงาน {name} ได้เลย', { name: t(SHOP.name) })}</p>
        <div className="ctabtns">
          {buttons.map((b) => (
            <a key={b.key} className={'cbtn ' + b.cls} href={b.href} {...(b.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {b.icon && (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M12 3C6.5 3 2 6.6 2 11c0 2.6 1.6 4.9 4 6.4V21l3.4-1.9c.8.2 1.7.3 2.6.3 5.5 0 10-3.6 10-8S17.5 3 12 3z" fill="currentColor" />
                </svg>
              )}
              {b.label}
            </a>
          ))}
          <a className="cbtn cb-glass" href="#ct-form">{t('ส่งข้อความถึงร้าน')}</a>
        </div>
      </section>
      <main className="wrap infopage contactmain">
        {cards.length > 0 && (
          <ul className="infocards" aria-label={t('ข้อมูลติดต่อร้าน')}>
            {cards.map(([icon, title, body]) => (
              <li key={title}>
                <span className="cicon"><Icon name={icon} /></span>
                <b>{t(title)}</b>
                <div>{body}</div>
              </li>
            ))}
          </ul>
        )}
        {cards.length === 0 && user && user.role === 'admin' && (
          <p className="note">{t('ยังไม่ได้ตั้งข้อมูลติดต่อของร้าน (ลูกค้าจะยังไม่เห็นปุ่มโทร/LINE/อีเมล) ไปที่')} <Link to="/admin/settings">{t('ตั้งค่าร้าน')}</Link> {t('เพื่อใส่ข้อมูล')}</p>
        )}

        <section className="panel" id="ct-form" aria-labelledby="msg-title">
          <h2 id="msg-title">{t('ส่งข้อความถึงร้าน')}</h2>
          {done ? (
            <p className="okmsg" role="status">{t(done)}</p>
          ) : (
            <form className="contactform" onSubmit={submit} noValidate>
              {error && <div className="err" role="alert">{error.message}</div>}
              <label htmlFor="ct-name">{t('ชื่อ')}
                <input id="ct-name" maxLength={80} autoComplete="name" required value={name} onChange={set('name')} aria-invalid={invalid('name')} />
              </label>
              <label htmlFor="ct-email">{t('อีเมลที่ให้ร้านตอบกลับ')}
                <input id="ct-email" type="email" autoComplete="email" required value={email} onChange={set('email')} aria-invalid={invalid('email')} />
              </label>
              <label htmlFor="ct-msg">{t('ข้อความ')}
                <textarea id="ct-msg" rows={5} maxLength={2000} required value={v.message} onChange={set('message')} aria-invalid={invalid('message')} />
                <span className="hint">{t('ถ้าถามเรื่องออเดอร์ ใส่เลขที่ออเดอร์มาด้วยจะตอบได้เร็วขึ้น')}</span>
              </label>
              <button className="submit" type="submit" disabled={busy}>{busy ? t('กำลังส่ง...') : t('ส่งข้อความ')}</button>
            </form>
          )}
        </section>

        <p className="note"><Link to="/about">{t('เกี่ยวกับเรา')}</Link> · <Link to="/">{t('กลับหน้าร้าน')}</Link></p>
      </main>
      <SiteFooter />
    </div>
  );
}
