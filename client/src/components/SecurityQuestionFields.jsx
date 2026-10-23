import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

// เลือกคำถามความปลอดภัย + ใส่คำตอบ (ใช้ตอนสมัครและในหน้าบัญชี)
export default function SecurityQuestionFields({ q, a, onQ, onA, errorField, idPrefix = 'sq' }) {
  const { t } = useI18n();
  const [list, setList] = useState([]);
  useEffect(() => {
    api.questions().then((d) => setList(d.questions)).catch(() => setList([]));
  }, []);
  return (
    <>
      <label htmlFor={idPrefix + '-q'}>{t('คำถามความปลอดภัย')}
        <select id={idPrefix + '-q'} value={q} onChange={(e) => onQ(e.target.value)} required aria-invalid={errorField === 'secQ' ? 'true' : undefined}>
          <option value="">{t('-- เลือกคำถาม --')}</option>
          {list.map((x) => <option key={x.id} value={x.id}>{t(x.text)}</option>)}
        </select>
      </label>
      <label htmlFor={idPrefix + '-a'}>{t('คำตอบ')}
        <input id={idPrefix + '-a'} type="text" autoComplete="off" maxLength={100} required value={a} onChange={(e) => onA(e.target.value)} aria-invalid={errorField === 'secA' ? 'true' : undefined} />
        <span className="hint">{t('ใช้กู้รหัสผ่านตอนลืม จำให้ได้และอย่าบอกใคร (ไม่สนตัวพิมพ์เล็ก/ใหญ่ และช่องว่าง)')}</span>
      </label>
    </>
  );
}
