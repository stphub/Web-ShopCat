import { useI18n } from '../i18n';

// ดาวแสดงคะแนน (อ่านอย่างเดียว) รองรับครึ่งดาว/ทศนิยมด้วยการตัดความกว้าง
export function Stars({ value, size = 16 }) {
  const { t } = useI18n();
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="stars" role="img" aria-label={t('คะแนน {v} จาก 5', { v: v.toFixed(1) })} style={{ fontSize: size }}>
      <span className="stars-bg" aria-hidden="true">★★★★★</span>
      <span className="stars-fg" aria-hidden="true" style={{ width: (v / 5) * 100 + '%' }}>★★★★★</span>
    </span>
  );
}

// ช่องให้คะแนน 1-5 ดาว
export function StarInput({ value, onChange, disabled }) {
  const { t } = useI18n();
  return (
    <div className="starinput" role="radiogroup" aria-label={t('ให้คะแนนสินค้า')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={t('{n} ดาว', { n })}
          className={n <= value ? 'on' : ''}
          onClick={() => onChange(n)}
          disabled={disabled}
        >
          ★
        </button>
      ))}
      <span className="note">{value ? t('{n} จาก 5 ดาว', { n: value }) : t('แตะดาวเพื่อให้คะแนน')}</span>
    </div>
  );
}
