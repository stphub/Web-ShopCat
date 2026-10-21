import { useState } from 'react';
import SecurityQuestionFields from './SecurityQuestionFields';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

// ตั้ง/เปลี่ยนคำถามความปลอดภัยในหน้าบัญชี (ไว้กู้รหัสผ่านบนเว็บโดยไม่ต้องใช้อีเมล)
export default function SecurityQuestionPanel() {
  const { user, refreshMe } = useAuth();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ q: '', a: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState('');
  const isAdmin = user && user.role === 'admin';

  const save = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk('');
    setBusy(true);
    try {
      await api.saveSecurityQuestion({ secQ: v.q, secA: v.a, password: v.password });
      await refreshMe();
      setOk('บันทึกคำถามความปลอดภัยแล้ว');
      setOpen(false);
      setV({ q: '', a: '', password: '' });
    } catch (ex) {
      setErr({ message: ex.message, field: ex.field });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="sq-title">
      <h2 id="sq-title">คำถามความปลอดภัย</h2>
      <p className="note">
        {user.hasSecQ ? 'ตั้งไว้แล้ว ใช้กู้รหัสผ่านบนเว็บตอนลืมได้' : 'ยังไม่ได้ตั้ง ตั้งไว้เพื่อกู้รหัสผ่านบนเว็บได้โดยไม่ต้องรออีเมล'}
        {isAdmin ? ' (บัญชีแอดมินกู้ด้วยคำถามไม่ได้ เพื่อความปลอดภัย)' : ''}
      </p>
      {ok && <p className="okmsg" role="status">{ok}</p>}
      {!open ? (
        <button className="ghost" onClick={() => { setOpen(true); setOk(''); }}>{user.hasSecQ ? 'เปลี่ยนคำถาม' : 'ตั้งคำถามความปลอดภัย'}</button>
      ) : (
        <form className="sqform" onSubmit={save} noValidate>
          {err && <div className="err" role="alert">{err.message}</div>}
          <SecurityQuestionFields q={v.q} a={v.a} onQ={(x) => setV({ ...v, q: x })} onA={(x) => setV({ ...v, a: x })} errorField={err && err.field} idPrefix="acc-sq" />
          <label htmlFor="acc-sq-pw">รหัสผ่านปัจจุบัน (ถ้ามี)
            <input id="acc-sq-pw" type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} aria-invalid={err && err.field === 'password' ? 'true' : undefined} />
          </label>
          <div className="actions">
            <button className="submit" type="submit" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            <button className="ghost" type="button" onClick={() => { setOpen(false); setErr(null); }}>ยกเลิก</button>
          </div>
        </form>
      )}
    </section>
  );
}
