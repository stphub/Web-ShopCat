import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import shop from './en/shop';
import account from './en/account';
import info from './en/info';
import admin from './en/admin';
import server from './en/server';
import calc from './en/calc';

// ระบบสองภาษา ไทย/อังกฤษ
// - ข้อความต้นฉบับในโค้ดคือภาษาไทย ใช้เป็นคีย์ t('ข้อความไทย') ถ้าเป็นภาษาไทยคืนค่าเดิม
// - ถ้าเป็นอังกฤษ จะหาในพจนานุกรม en/*.js ถ้าไม่เจอจะแสดงข้อความไทยเดิม (ไม่ทำให้หน้าพัง)
// - ใส่ค่าแทรกได้ด้วย {ชื่อ}: t('ใส่ตะกร้าแล้ว {n} รายการ', { n: 3 })
const DICT = { ...shop, ...account, ...info, ...admin, ...server, ...calc };

let current = 'th';
try {
  current = localStorage.getItem('lang') === 'en' ? 'en' : 'th';
} catch {
  /* ใช้ค่าเริ่มต้น */
}

// คีย์ที่มี {x} ใช้จับคู่ข้อความที่มาจากเซิร์ฟเวอร์ซึ่งมีตัวเลข/ชื่อแทรกอยู่ (สร้างครั้งแรกที่ใช้)
let patterns = null;
function getPatterns() {
  if (patterns) return patterns;
  patterns = Object.keys(DICT)
    .filter((k) => /\{\w+\}/.test(k))
    .map((k) => {
      const names = [];
      const src = k
        .split(/(\{\w+\})/)
        .map((part) => {
          const m = part.match(/^\{(\w+)\}$/);
          if (m) {
            names.push(m[1]);
            return '(.+?)';
          }
          return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('');
      return { re: new RegExp('^' + src + '$'), names, to: DICT[k] };
    });
  return patterns;
}

function fill(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
}

// ใช้นอก component ได้ (เช่นใน api.js แปลข้อความผิดพลาดจากเซิร์ฟเวอร์)
export function translate(key, vars) {
  if (typeof key !== 'string') return key;
  if (current !== 'en') return fill(key, vars);
  if (Object.prototype.hasOwnProperty.call(DICT, key)) return fill(DICT[key], vars);
  for (const p of getPatterns()) {
    const m = key.match(p.re);
    if (m) {
      const v = {};
      p.names.forEach((n, i) => {
        v[n] = m[i + 1];
      });
      return fill(p.to, v);
    }
  }
  return fill(key, vars);
}

export const currentLang = () => current;
export const currentLocale = () => (current === 'en' ? 'en-GB' : 'th-TH');

const LangContext = createContext({ lang: 'th', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(current);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(
    () => ({
      lang,
      setLang: (l) => {
        current = l === 'en' ? 'en' : 'th';
        try {
          localStorage.setItem('lang', current);
        } catch {
          /* ไม่เป็นไร */
        }
        setLangState(current);
      },
    }),
    [lang]
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// ใช้ใน component: const { t, lang, pname, psize } = useI18n();
// component ที่แสดงข้อความ/วันที่ต้องเรียก hook นี้ เพื่อให้แสดงใหม่เมื่อสลับภาษา
export function useI18n() {
  const { lang, setLang } = useContext(LangContext);
  return useMemo(
    () => ({
      lang,
      setLang,
      locale: lang === 'en' ? 'en-GB' : 'th-TH',
      t: (key, vars) => translate(key, vars),
      // ชื่อ/ขนาดสินค้าตามภาษา (ถ้าไม่มีภาษาอังกฤษใช้ภาษาไทยแทน)
      pname: (p) => (p ? (lang === 'en' && p.nameEn ? p.nameEn : p.name) : ''),
      psize: (p) => (p ? (lang === 'en' && p.sizeEn ? p.sizeEn : p.size) : ''),
    }),
    [lang, setLang]
  );
}

export const useT = () => useI18n().t;

// ปุ่มสลับภาษา TH | EN
export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={'langsw ' + className} role="group" aria-label="Language / ภาษา">
      <button type="button" aria-pressed={lang === 'th'} onClick={() => setLang('th')} lang="th">TH</button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">EN</button>
    </div>
  );
}
