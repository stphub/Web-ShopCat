import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

// หน้า "บัญชีของฉัน": ข้อความที่เคยส่งถึงร้านและคำตอบ (แสดงเฉพาะเมื่อเคยส่งตอนล็อกอิน)
export default function MyMessages() {
  const { t, locale } = useI18n();
  const fmt = (d) => new Date(d).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const [list, setList] = useState(null);
  useEffect(() => {
    api.contactMine().then((d) => setList(d.messages)).catch(() => setList([]));
  }, []);
  if (!list || list.length === 0) return null;
  return (
    <section className="panel" aria-labelledby="mm-title">
      <h2 id="mm-title">{t('ข้อความถึงร้านของฉัน')}</h2>
      <ul className="ordlist">
        {list.map((m) => (
          <li key={m.id} className="ord">
            <p className="meta">{fmt(m.createdAt)}</p>
            <p className="pre" style={{ margin: '6px 0' }}>{m.message}</p>
            {m.reply ? (
              <div className="msgreply">
                <b>{t('ร้านตอบว่า')}</b> <span className="meta">{fmt(m.repliedAt)}</span>
                <p className="pre">{m.reply}</p>
              </div>
            ) : (
              <p className="note">{t('ร้านยังไม่ได้ตอบ')}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
