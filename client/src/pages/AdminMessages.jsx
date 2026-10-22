import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

const FILTERS = [['', 'ทั้งหมด'], ['new', 'ใหม่'], ['read', 'อ่านแล้ว'], ['replied', 'ตอบแล้ว']];
const LABEL = { new: 'ใหม่', read: 'อ่านแล้ว', replied: 'ตอบแล้ว' };

const fmt = (d) => new Date(d).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

// หน้าแอดมิน: อ่านข้อความที่ลูกค้าส่งจากหน้า "ติดต่อเรา"
export default function AdminMessages() {
  const [status, setStatus] = useState('new');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    return api.admin
      .messages(status)
      .then((d) => {
        setList(d.messages);
        setErr(null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const setStat = async (m, next) => {
    setBusyId(m.id);
    setErr(null);
    try {
      const d = await api.admin.setMessageStatus(m.id, next);
      setList((l) => l.flatMap((x) => (x.id !== m.id ? [x] : status && d.message.status !== status ? [] : [d.message])));
      window.dispatchEvent(new Event('messages-changed'));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (m) => {
    if (!window.confirm('ลบข้อความจาก ' + m.name + ' ?')) return;
    setBusyId(m.id);
    try {
      await api.admin.deleteMessage(m.id);
      setList((l) => l.filter((x) => x.id !== m.id));
      window.dispatchEvent(new Event('messages-changed'));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="dfilters">
        <div className="chips" role="group" aria-label="กรองตามสถานะ">
          {FILTERS.map(([id, label]) => (
            <button key={id} aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>
          ))}
        </div>
      </div>
      {err && <div className="err" role="alert">{err}</div>}
      {loading && <p className="note">กำลังโหลด...</p>}
      {!loading && list.length === 0 && <p className="note">ยังไม่มีข้อความ{status ? 'ในหมวดนี้' : ''}</p>}
      <ul className="ordlist">
        {list.map((m) => (
          <li key={m.id} className="ord">
            <div className="ord-head">
              <b>{m.name}</b>
              <span className="meta">{fmt(m.createdAt)}</span>
              <span className={'tag msg-' + m.status}>{LABEL[m.status]}</span>
            </div>
            <p className="meta"><a href={'mailto:' + m.email + '?subject=' + encodeURIComponent('ตอบกลับจากร้านของแมวเหมียว')}>{m.email}</a></p>
            <p className="pre" style={{ margin: '8px 0' }}>{m.message}</p>
            <div className="actions">
              {m.status === 'new' && <button disabled={busyId === m.id} onClick={() => setStat(m, 'read')}>ทำเครื่องหมายว่าอ่านแล้ว</button>}
              {m.status !== 'replied' && <button disabled={busyId === m.id} onClick={() => setStat(m, 'replied')}>ตอบแล้ว</button>}
              {m.status !== 'new' && <button disabled={busyId === m.id} onClick={() => setStat(m, 'new')}>ทำเป็นข้อความใหม่</button>}
              <button disabled={busyId === m.id} onClick={() => remove(m)}>ลบ</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
