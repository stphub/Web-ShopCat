import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

const SCRIPT = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) return resolve();
    let s = document.querySelector(`script[src="${SCRIPT}"]`);
    if (!s) {
      s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('โหลดสคริปต์ Google ไม่สำเร็จ')));
  });
}

// ปุ่ม "ดำเนินการต่อด้วย Google" ถ้าเซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID จะไม่แสดงอะไรเลย
export default function GoogleButton({ onCredential }) {
  const slot = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const [enabled, setEnabled] = useState(false);
  const { t, lang } = useI18n();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { googleClientId } = await api.config();
        if (!googleClientId || cancelled) return;
        await loadGoogleScript();
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (resp) => cb.current(resp.credential),
        });
        setEnabled(true);
      } catch {
        /* ไม่แสดงปุ่ม ผู้ใช้ยังสมัครด้วยอีเมลได้ */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !slot.current) return;
    const width = Math.min(360, Math.max(200, slot.current.clientWidth));
    window.google.accounts.id.renderButton(slot.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      locale: lang,
      width,
    });
  }, [enabled, lang]);

  if (!enabled) return null;
  return (
    <div className="gwrap">
      <div className="gslot" ref={slot} />
      <div className="or">{t('หรือใช้อีเมล')}</div>
    </div>
  );
}
