import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

// ตั้งรหัสผ่านใหม่จากลิงก์ในอีเมล (/reset-password?token=...)
export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const { user, loading, resetPassword } = useAuth();
  const [values, setValues] = useState({ password: '', confirm: '' });
  const [error, setError] = useState(null); // { message, field, code }
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value });
  const invalid = (k) => (error && error.field === k ? 'true' : undefined);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (values.password !== values.confirm) {
      setError({ message: 'รหัสผ่านสองช่องไม่ตรงกัน', field: 'confirm' });
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, values.password);
      // สำเร็จแล้วระบบล็อกอินให้ ด้านบนจะพากลับหน้าร้านเอง
    } catch (ex) {
      setError({ message: ex.message, field: ex.field, code: ex.code });
      setBusy(false);
    }
  };

  const dead = !token || (error && error.code === 'BAD_TOKEN');

  return (
    <div className="authwrap">
      <main className="box">
        <Link className="brand" to="/"><Logo /><span>ของแมวเหมียว</span></Link>
        <h1>ตั้งรหัสผ่านใหม่</h1>

        {dead ? (
          <>
            <div className="err" role="alert">{error ? error.message : 'ลิงก์นี้ไม่ถูกต้อง กรุณาขอลิงก์ใหม่'}</div>
            <p className="switch"><Link to="/forgot-password">ขอลิงก์ตั้งรหัสผ่านใหม่</Link></p>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            {error && <div className="err" role="alert">{error.message}</div>}
            <label htmlFor="rp-password">รหัสผ่านใหม่
              <input id="rp-password" type="password" autoComplete="new-password" minLength={8} required value={values.password} onChange={set('password')} aria-invalid={invalid('password')} />
              <span className="hint">อย่างน้อย 8 ตัวอักษร</span>
            </label>
            <label htmlFor="rp-confirm">ยืนยันรหัสผ่านใหม่
              <input id="rp-confirm" type="password" autoComplete="new-password" required value={values.confirm} onChange={set('confirm')} aria-invalid={invalid('confirm')} />
            </label>
            <button className="submit" type="submit" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}</button>
          </form>
        )}
      </main>
    </div>
  );
}
