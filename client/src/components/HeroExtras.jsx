import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';

// คำที่สลับวนในหัวข้อหน้าแรก (ข้อความไทยเป็นคีย์ แสดงผลผ่าน t())
const WORDS = ['อาหารเปียก', 'ทรายแมว', 'ขนมแมวเลีย', 'ของเล่นแมว', 'ที่ลับเล็บ', 'ที่นอนนุ่ม ๆ'];

// "เจ้านายอยากได้ [คำที่สลับ]" พิมพ์ทีละตัวอักษรแล้วลบ ถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหวจะแสดงคำแรกนิ่ง ๆ
export function TypedWord() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  const word = t(WORDS[i]);
  const still = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (still) return undefined;
    let ms = del ? 45 : 85;
    if (!del && n === word.length) ms = 1400; // พักให้อ่านก่อนลบ
    if (del && n === 0) ms = 300;
    const id = setTimeout(() => {
      if (!del && n < word.length) setN(n + 1);
      else if (!del) setDel(true);
      else if (n > 0) setN(n - 1);
      else {
        setDel(false);
        setI((i + 1) % WORDS.length);
      }
    }, ms);
    return () => clearTimeout(id);
  }, [n, del, i, word, still]);

  return (
    <span className="typed" aria-live="off">
      <span className="typedtxt">{still ? word : word.slice(0, n)}</span>
      {!still && <span className="caret" aria-hidden="true" />}
    </span>
  );
}

// ไอคอนลอยตกแต่งในส่วนหัว (ไม่มีความหมาย ซ่อนจากโปรแกรมอ่านหน้าจอ)
export function FloatDecor() {
  const items = [
    ['🐟', 'f1'],
    ['🐾', 'f2'],
    ['🧶', 'f3'],
    ['🐭', 'f4'],
    ['🐾', 'f5'],
    ['🍗', 'f6'],
  ];
  return (
    <div className="floatdecor" aria-hidden="true">
      {items.map(([e, c], k) => <span key={k} className={'fd ' + c}>{e}</span>)}
    </div>
  );
}

// ไทล์หมวดสินค้ากดได้ (ไอคอนอีโมจิ) ใช้เลือกหมวดแทนการเลื่อนหาในแถบชิป
export const CAT_ICON = { food: '🐟', treat: '🍬', toy: '🐭', litter: '🧺', home: '🛏️', wear: '🎀' };

export function CategoryTiles({ categories, current, onPick }) {
  const { t } = useI18n();
  return (
    <ul className="cattiles" aria-label={t('หมวดสินค้า')}>
      {categories.filter(([id]) => id !== 'all').map(([id, label]) => (
        <li key={id}>
          <button type="button" className={'cattile' + (current === id ? ' on' : '')} aria-pressed={current === id} onClick={() => onPick(current === id ? 'all' : id)}>
            <span className="cticon" aria-hidden="true">{CAT_ICON[id] || '🐱'}</span>
            <span className="ctlabel">{t(label)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
