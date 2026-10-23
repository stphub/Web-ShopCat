import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/Logo';
import GoogleButton from '../components/GoogleButton';
import SecurityQuestionFields from '../components/SecurityQuestionFields';
import { useAuth } from '../context/AuthContext';
import { LangSwitch, useI18n } from '../i18n';

// หน้าเดียวใช้ได้ทั้งเข้าสู่ระบบ (mode="login") และสมัครสมาชิก (mode="register")
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { t } = useI18n();
  const { user, loading, login, register, loginWithGoogle } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '', secQ: '', secA: '' });
  const [error, setError] = useState(null); // { message, field }
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value });
  const invalid = (k) => (error && error.field === k ? 'true' : undefined);

  const onGoogle = async (credential) => {
    setError(null);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError({ message: err.message });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (isRegister && values.password !== values.confirm) {
      setError({ message: t('รหัสผ่านสองช่องไม่ตรงกัน'), field: 'confirm' });
      return;
    }
    setBusy(true);
    try {
      if (isRegister) await register(values.name.trim(), values.email.trim(), values.password, values.secQ, values.secA);
      else await login(values.email.trim(), values.password);
      // ล็อกอินสำเร็จ user เปลี่ยน แล้วด้านบนจะพากลับหน้าร้านเอง
    } catch (err) {
      setError({ message: err.message, field: err.field });
      setBusy(false);
    }
  };

  return (
    <div className="authwrap">
      <main className="box">
        <Link className="brand" to="/"><Logo /><span>{t('ของแมวเหมียว')}</span></Link>
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "-8px 0 12px" }}><LangSwitch /></div>
        <h1>{isRegister ? t('สมัครสมาชิก') : t('เข้าสู่ระบบ')}</h1>
        <p className="sub">{isRegister ? t('สร้างบัญชีเพื่อเริ่มช้อปของให้เจ้านาย') : t('ล็อกอินเพื่อสั่งซื้อและติดตามออเดอร์')}</p>

        <GoogleButton onCredential={onGoogle} />

        <form onSubmit={submit} noValidate>
          {error && <div className="err" role="alert">{error.message}</div>}

          {isRegister && (
            <label htmlFor="name">{t('ชื่อ')}
              <input id="name" type="text" autoComplete="name" maxLength={80} required value={values.name} onChange={set('name')} aria-invalid={invalid('name')} />
            </label>
          )}
          <label htmlFor="email">{t('อีเมล')}
            <input id="email" type="email" autoComplete="email" required value={values.email} onChange={set('email')} aria-invalid={invalid('email')} />
          </label>
          <label htmlFor="password">{t('รหัสผ่าน')}
            <input id="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} required value={values.password} onChange={set('password')} aria-invalid={invalid('password')} />
            {isRegister && <span className="hint">{t('อย่างน้อย 8 ตัวอักษร')}</span>}
            {!isRegister && <Link className="hint" to="/forgot-password">{t('ลืมรหัสผ่าน?')}</Link>}
          </label>
          {isRegister && (
            <label htmlFor="confirm">{t('ยืนยันรหัสผ่าน')}
              <input id="confirm" type="password" autoComplete="new-password" required value={values.confirm} onChange={set('confirm')} aria-invalid={invalid('confirm')} />
            </label>
          )}

          {isRegister && (
            <SecurityQuestionFields q={values.secQ} a={values.secA} onQ={(v) => setValues({ ...values, secQ: v })} onA={(v) => setValues({ ...values, secA: v })} errorField={error && error.field} />
          )}

          <button className="submit" type="submit" disabled={busy}>
            {isRegister ? t('สมัครสมาชิก') : t('เข้าสู่ระบบ')}
          </button>
        </form>

        <p className="switch">
          {isRegister ? <>{t('มีบัญชีอยู่แล้ว')} <Link to="/login">{t('เข้าสู่ระบบ')}</Link></> : <>{t('ยังไม่มีบัญชี')} <Link to="/register">{t('สมัครสมาชิก')}</Link></>}
        </p>
      </main>
    </div>
  );
}
