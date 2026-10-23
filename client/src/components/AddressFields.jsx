// ช่องกรอกที่อยู่จัดส่ง ใช้ร่วมกันทั้งหน้าชำระเงินในตะกร้าและหน้าจัดการที่อยู่ในบัญชี
import { useI18n } from '../i18n';

export default function AddressFields({ values, onChange, idPrefix, showLabel = false, errorField }) {
  const { t } = useI18n();
  const set = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  const inv = (k) => (errorField === k ? 'true' : undefined);
  return (
    <div className="co">
      {showLabel && (
        <label htmlFor={idPrefix + '-label'}>
          {t('ชื่อที่อยู่ (ไม่บังคับ)')}
          <input id={idPrefix + '-label'} value={values.label || ''} onChange={set('label')} maxLength={30} placeholder={t('เช่น บ้าน ที่ทำงาน')} aria-invalid={inv('label')} />
        </label>
      )}
      <label htmlFor={idPrefix + '-name'}>
        {t('ชื่อผู้รับ')}
        <input id={idPrefix + '-name'} required value={values.name} onChange={set('name')} maxLength={80} autoComplete="name" aria-invalid={inv('name')} />
      </label>
      <label htmlFor={idPrefix + '-tel'}>
        {t('เบอร์โทร')}
        <input id={idPrefix + '-tel'} required inputMode="tel" value={values.tel} onChange={set('tel')} maxLength={30} autoComplete="tel" aria-invalid={inv('tel')} />
      </label>
      <label htmlFor={idPrefix + '-line'}>
        {t('ที่อยู่จัดส่ง')}
        <textarea id={idPrefix + '-line'} required rows={3} value={values.line} onChange={set('line')} maxLength={300} autoComplete="street-address" aria-invalid={inv('line')} />
      </label>
    </div>
  );
}
