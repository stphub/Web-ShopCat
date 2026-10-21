// ดาวแสดงคะแนน (อ่านอย่างเดียว) รองรับครึ่งดาว/ทศนิยมด้วยการตัดความกว้าง
export function Stars({ value, size = 16 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="stars" role="img" aria-label={`คะแนน ${v.toFixed(1)} จาก 5`} style={{ fontSize: size }}>
      <span className="stars-bg" aria-hidden="true">★★★★★</span>
      <span className="stars-fg" aria-hidden="true" style={{ width: (v / 5) * 100 + '%' }}>★★★★★</span>
    </span>
  );
}

// ช่องให้คะแนน 1-5 ดาว
export function StarInput({ value, onChange, disabled }) {
  return (
    <div className="starinput" role="radiogroup" aria-label="ให้คะแนนสินค้า">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ดาว`}
          className={n <= value ? 'on' : ''}
          onClick={() => onChange(n)}
          disabled={disabled}
        >
          ★
        </button>
      ))}
      <span className="note">{value ? `${value} จาก 5 ดาว` : 'แตะดาวเพื่อให้คะแนน'}</span>
    </div>
  );
}
