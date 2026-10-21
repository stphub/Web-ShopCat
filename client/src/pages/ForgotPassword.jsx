import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

// ลืมรหัสผ่าน: ตอบคำถามความปลอดภัยแล้วตั้งรหัสใหม่บนเว็บได้เลย (หรือเลือกขอลิงก์ทางอีเมลแทน)
export default function ForgotPassword() {
  const { user, loading, resetByAnswer } = useAuth();
  const [mode, setMode] = useState('answer'); // 'answer' | 'email'
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [v, setV] = useState({ answer: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState('');

  if (!loading && user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const getQuestion = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const d = await api.securityQuestion(email.trim());
      setQuestion(d.question);
      setStep(2);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setError(null);
    if (v.password !== v.confirm) {
      setError('รหัสผ่านสองช่องไม่ตรงกัน');
      return;
    }
    setBusy(true);
    try {
      await resetByAnswer(email.trim(), v.answer, v.password); // สำเร็จแล้วล็อกอินให้ และพากลับหน้าร้าน
    } catch (ex) {
      setError(ex.message);
      setBusy(false);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const d = await api.forgot(email.trim());
      setDone(d.message);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authwrap">
      <main className="box">
        <Link className="brand" to="/"><Logo /><span>ของแมวเหมียว</span></Link>
        <h1>ลืมรหัสผ่าน</h1>

        {mode === 'email' ? (
          <>
            <p className="sub">กรอกอีเมลที่สมัครไว้ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้</p>
            {done ? (
              <p className="okmsg" role="status">{done}</p>
            ) : (
              <form onSubmit={sendEmail} noValidate>
                {error && <div className="err" role="alert">{error}</div>}
                <label htmlFor="fp-email">อีเมล
                  <input id="fp-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <button className="submit" type="submit" disabled={busy}>{busy ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}</button>
              </form>
            )}
            <p className="switch"><button type="button" className="linkbtn" onClick={() => { setMode('answer'); setError(null); setDone(''); }}>กลับไปตอบคำถามความปลอดภัย</button></p>
          </>
        ) : step === 1 ? (
          <>
            <p className="sub">กรอกอีเมลที่สมัครไว้ แล้วตอบคำถามความปลอดภัยเพื่อตั้งรหัสผ่านใหม่ได้ทันที</p>
            <form onSubmit={getQuestion} noValidate>
              {error && <div className="err" role="alert">{error}</div>}
              <label htmlFor="fp-email">อีเมล
                <input id="fp-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <button className="submit" type="submit" disabled={busy}>{busy ? 'กำลังตรวจสอบ...' : 'ถัดไป'}</button>
            </form>
            <p className="switch"><button type="button" className="linkbtn" onClick={() => { setMode('email'); setError(null); }}>ยังไม่เคยตั้งคำถาม? ขอลิงก์ทางอีเมลแทน</button></p>
          </>
        ) : (
          <form onSubmit={reset} noValidate>
            <p className="sub">{email}</p>
            {error && <div className="err" role="alert">{error}</div>}
            <label htmlFor="fp-answer">{question}
              <input id="fp-answer" type="text" autoComplete="off" maxLength={100} required value={v.answer} onChange={set('answer')} />
            </label>
            <label htmlFor="fp-pass">รหัสผ่านใหม่
              <input id="fp-pass" type="password" autoComplete="new-password" minLength={8} required value={v.password} onChange={set('password')} />
              <span className="hint">อย่างน้อย 8 ตัวอักษร</span>
            </label>
            <label htmlFor="fp-confirm">ยืนยันรหัสผ่านใหม่
              <input id="fp-confirm" type="password" autoComplete="new-password" required value={v.confirm} onChange={set('confirm')} />
            </label>
            <button className="submit" type="submit" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}</button>
            <p className="switch"><button type="button" className="linkbtn" onClick={() => { setStep(1); setError(null); }}>เปลี่ยนอีเมล</button></p>
          </form>
        )}

        <p className="switch"><Link to="/login">กลับไปเข้าสู่ระบบ</Link></p>
      </main>
    </div>
  );
}
