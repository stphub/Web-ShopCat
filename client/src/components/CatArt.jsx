import { useState } from 'react';

// ภาพประกอบแมว (SVG วาดเอง ไม่ต้องใช้ไฟล์รูป) สำหรับหน้าบทความ แต่งแสงเงา ขน และดวงตาให้ดูสมจริงขึ้น
// variant: 'can' แมวกับกระป๋องอาหาร | 'bowl' แมวกับชามอาหาร | 'family' ลูกแมว แมวโต แมวสูงวัย
const INK = '#241d19';

// ปรับความสว่างของสี hex (amt > 0 สว่างขึ้น, < 0 เข้มขึ้น)
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function Cat({ uid, x = 0, y = 0, s = 1, fur = '#d98a3d', stripe = '#a85f22', belly = '#f7e4c6', eye = '#c9a227', senior = false, kitten = false, look = 0, tail = 1 }) {
  const hs = kitten ? 1.2 : 1; // ลูกแมวหัวโตเมื่อเทียบกับตัว
  const bodyH = kitten ? 0.78 : 1;
  const dark = shade(fur, -0.32);
  const light = shade(fur, 0.28);
  const g = (n) => `${uid}-${n}`;
  const half = senior ? 0.55 : 0; // แมวสูงวัยตาหรี่ลงนิดหน่อย
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <radialGradient id={g('fur')} cx="0.45" cy="0.3" r="0.85">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={fur} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
        <radialGradient id={g('belly')} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor={belly} />
        </radialGradient>
        <radialGradient id={g('iris')} cx="0.5" cy="0.4" r="0.65">
          <stop offset="0" stopColor={shade(eye, 0.45)} />
          <stop offset="0.6" stopColor={eye} />
          <stop offset="1" stopColor={shade(eye, -0.45)} />
        </radialGradient>
        <linearGradient id={g('tail')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={fur} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <clipPath id={g('body')}>
          <path d="M-44 44 C-58 -2 -40 -58 0 -60 C40 -58 58 -2 44 44 C30 54 -30 54 -44 44Z" />
        </clipPath>
        <clipPath id={g('head')}>
          <path d="M-46 4 C-50 -30 -34 -50 0 -50 C34 -50 50 -30 46 4 C44 30 20 44 0 44 C-20 44 -44 30 -46 4Z" />
        </clipPath>
      </defs>

      {/* เงาใต้ตัว */}
      <ellipse cx="0" cy="52" rx="62" ry="9" fill="#2b1d12" opacity=".22" />

      {/* หาง */}
      {tail !== 2 && (<g>
        <path d={tail === 1 ? 'M36 40 C86 44 98 -6 76 -42 C70 -52 62 -50 66 -40 C80 -14 72 22 34 26Z' : 'M-36 40 C-86 44 -98 -6 -76 -42 C-70 -52 -62 -50 -66 -40 C-80 -14 -72 22 -34 26Z'} fill={`url(#${g('tail')})`} />
        <path d={tail === 1 ? 'M82 4 q8 -2 12 -8 M80 -14 q8 -3 11 -9 M74 -30 q7 -3 9 -8' : 'M-82 4 q-8 -2 -12 -8 M-80 -14 q-8 -3 -11 -9 M-74 -30 q-7 -3 -9 -8'} stroke={stripe} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7" />
      </g>)}

      {/* ตัว */}
      <g transform={`scale(1 ${bodyH}) translate(0 ${kitten ? 14 : 0})`}>
        <path d="M-44 44 C-58 -2 -40 -58 0 -60 C40 -58 58 -2 44 44 C30 54 -30 54 -44 44Z" fill={`url(#${g('fur')})`} />
        <g clipPath={`url(#${g('body')})`}>
          {/* ลายพาดข้างลำตัว */}
          <g stroke={stripe} strokeWidth="4.4" strokeLinecap="round" fill="none" opacity=".55">
            <path d="M-56 -26 q16 6 20 20" />
            <path d="M-58 -8 q18 6 22 22" />
            <path d="M-56 12 q16 6 20 20" />
            <path d="M56 -26 q-16 6 -20 20" />
            <path d="M58 -8 q-18 6 -22 22" />
            <path d="M56 12 q-16 6 -20 20" />
          </g>
          {/* อกและท้องสีอ่อน */}
          <path d="M-20 -30 C-30 4 -26 40 0 48 C26 40 30 4 20 -30 C10 -22 -10 -22 -20 -30Z" fill={`url(#${g('belly')})`} />
          {/* เงาที่ขาหลัง */}
          <ellipse cx="-34" cy="30" rx="18" ry="22" fill={dark} opacity=".28" />
          <ellipse cx="34" cy="30" rx="18" ry="22" fill={dark} opacity=".28" />
        </g>
        {/* ขาหน้า */}
        <g>
          <path d="M-24 4 C-30 24 -28 44 -22 50 C-14 54 -6 52 -6 46 C-6 30 -8 14 -10 4Z" fill={`url(#${g('belly')})`} />
          <path d="M24 4 C30 24 28 44 22 50 C14 54 6 52 6 46 C6 30 8 14 10 4Z" fill={`url(#${g('belly')})`} />
          <path d="M-20 52 v-6 M-14 53 v-6 M20 52 v-6 M14 53 v-6" stroke={shade(belly, -0.25)} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>

      {/* หัว */}
      <g transform={`translate(0 ${kitten ? -34 : -62}) scale(${hs})`}>
        {/* หูหลังหัว */}
        <path d="M-42 -12 C-46 -34 -40 -52 -34 -62 C-24 -54 -12 -46 -6 -40Z" fill={`url(#${g('fur')})`} />
        <path d="M42 -12 C46 -34 40 -52 34 -62 C24 -54 12 -46 6 -40Z" fill={`url(#${g('fur')})`} />
        <path d="M-37 -20 C-39 -34 -36 -46 -33 -52 C-27 -47 -20 -42 -16 -38Z" fill="#e9a79d" />
        <path d="M37 -20 C39 -34 36 -46 33 -52 C27 -47 20 -42 16 -38Z" fill="#e9a79d" />
        <path d="M-35 -26 q2 -10 4 -16 M35 -26 q-2 -10 -4 -16" stroke="#fff3ea" strokeWidth="1.4" strokeLinecap="round" opacity=".7" fill="none" />

        {/* ใบหน้า */}
        <path d="M-46 4 C-50 -30 -34 -50 0 -50 C34 -50 50 -30 46 4 C44 30 20 44 0 44 C-20 44 -44 30 -46 4Z" fill={`url(#${g('fur')})`} />
        <g clipPath={`url(#${g('head')})`}>
          {/* ลายตัว M บนหน้าผากและลายข้างแก้ม */}
          <g stroke={stripe} strokeWidth="3.4" strokeLinecap="round" fill="none" opacity=".75">
            <path d="M-12 -46 q3 12 0 20" />
            <path d="M0 -50 v26" />
            <path d="M12 -46 q-3 12 0 20" />
            <path d="M-40 -6 q10 0 16 6" />
            <path d="M-42 6 q10 -1 16 5" />
            <path d="M40 -6 q-10 0 -16 6" />
            <path d="M42 6 q-10 -1 -16 5" />
          </g>
          {/* ปากและคางสีอ่อน */}
          <ellipse cx="0" cy="22" rx="24" ry="19" fill={senior ? '#e6e1da' : `url(#${g('belly')})`} />
          <ellipse cx="-11" cy="18" rx="12" ry="10" fill={senior ? '#e6e1da' : `url(#${g('belly')})`} />
          <ellipse cx="11" cy="18" rx="12" ry="10" fill={senior ? '#e6e1da' : `url(#${g('belly')})`} />
        </g>
        {/* เส้นขนรอบแก้ม */}
        <path d="M-46 8 l-7 2 M-45 14 l-7 4 M-42 20 l-6 5 M46 8 l7 2 M45 14 l7 4 M42 20 l6 5" stroke={fur} strokeWidth="2.4" strokeLinecap="round" />

        {/* ตา */}
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${d * 18} -10)`}>
            <path d={`M-11 0 C-8 ${-9 + half * 4} 8 ${-9 + half * 4} 11 0 C8 ${8 - half * 2} -8 ${8 - half * 2} -11 0Z`} fill="#fbf7ee" />
            <ellipse cx={look * 0.5} cy="0" rx={kitten ? 8.4 : 7.6} ry={kitten ? 8.4 : 7.6 - half * 1.6} fill={`url(#${g('iris')})`} />
            <ellipse cx={look * 0.5} cy="0" rx={kitten ? 3.8 : 2.4} ry={kitten ? 6.4 : 6.2 - half} fill={INK} />
            <circle cx={look * 0.5 - 2.6} cy="-3" r="2.2" fill="#fff" />
            <circle cx={look * 0.5 + 2.6} cy="2.4" r="1" fill="#fff" opacity=".7" />
            <path d={`M-12 0 C-8 ${-10 + half * 4} 8 ${-10 + half * 4} 12 0`} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M-12 0 l-3 1.5 M12 0 l3 1.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ))}

        {/* จมูกและปาก */}
        <path d="M-6 8 C-6 5 6 5 6 8 C6 12 2 15 0 15 C-2 15 -6 12 -6 8Z" fill="#d98189" />
        <path d="M-4 7.4 C-3 6 3 6 4 7.4" stroke="#f3b3b6" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M0 15 v5 M0 20 q-5 6 -11 2 M0 20 q5 6 11 2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".85" />
        {/* จุดโคนหนวด */}
        <g fill={shade(fur, -0.4)} opacity=".6">
          <circle cx="-14" cy="19" r="1" /><circle cx="-18" cy="17" r="1" /><circle cx="-16" cy="22" r="1" />
          <circle cx="14" cy="19" r="1" /><circle cx="18" cy="17" r="1" /><circle cx="16" cy="22" r="1" />
        </g>
        {/* หนวด */}
        <g stroke="#fffaf0" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity=".9">
          <path d="M-18 18 q-20 -6 -36 -2" />
          <path d="M-18 21 q-20 0 -36 7" />
          <path d="M-17 24 q-16 6 -28 14" />
          <path d="M18 18 q20 -6 36 -2" />
          <path d="M18 21 q20 0 36 7" />
          <path d="M17 24 q16 6 28 14" />
        </g>
      </g>
    </g>
  );
}

function Can({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="44" rx="42" ry="8" fill="#2b1d12" opacity=".25" />
      <defs>
        <linearGradient id="can-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#aab4be" />
          <stop offset="0.25" stopColor="#f4f7fa" />
          <stop offset="0.6" stopColor="#c9d2db" />
          <stop offset="1" stopColor="#8e99a5" />
        </linearGradient>
        <linearGradient id="can-label" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b84436" />
          <stop offset="0.3" stopColor="#ee7b68" />
          <stop offset="0.7" stopColor="#d65a49" />
          <stop offset="1" stopColor="#9a3328" />
        </linearGradient>
      </defs>
      <path d="M-34 -34 V42 a34 7 0 0 0 68 0 V-34Z" fill="url(#can-metal)" />
      <rect x="-34" y="-8" width="68" height="36" fill="url(#can-label)" />
      <path d="M-16 8 q16 -16 32 0 q-16 16 -32 0z" fill="#fff" opacity=".92" />
      <path d="M-5 5 l5 -3 l5 3 l-5 7z" fill="#d65a49" opacity=".8" />
      <path d="M-34 -8 h68 M-34 28 h68" stroke="#7d261d" strokeWidth="1" opacity=".5" />
      <path d="M-26 -30 V40" stroke="#fff" strokeWidth="3" opacity=".35" strokeLinecap="round" />
      <ellipse cx="0" cy="-34" rx="34" ry="8" fill="#dfe6ed" stroke="#9aa6b2" strokeWidth="1.6" />
      <ellipse cx="0" cy="-34.5" rx="26" ry="5" fill="#bcc7d2" />
      <path d="M6 -38 a7 6 0 1 1 8 0" fill="none" stroke="#7f8b98" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Bowl({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="28" rx="56" ry="9" fill="#2b1d12" opacity=".25" />
      <defs>
        <linearGradient id="bowl-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b95ad" />
          <stop offset="0.3" stopColor="#a9d3e4" />
          <stop offset="0.7" stopColor="#6fa6bd" />
          <stop offset="1" stopColor="#3f748c" />
        </linearGradient>
        <radialGradient id="kibble" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#e2a763" />
          <stop offset="1" stopColor="#8f5a27" />
        </radialGradient>
      </defs>
      <path d="M-52 0 h104 a52 40 0 0 1 -104 0z" fill="url(#bowl-body)" />
      <path d="M-24 40 h48 v-4 h-48z" fill="#3f748c" opacity=".6" />
      <ellipse cx="0" cy="0" rx="52" ry="11" fill="#cfe6ef" />
      <ellipse cx="0" cy="1" rx="46" ry="8.5" fill="#6c4a2b" />
      {/* เม็ดอาหาร */}
      <g fill="url(#kibble)" stroke="#6e4418" strokeWidth=".8">
        {[[-30, -2], [-18, -5], [-6, -7], [8, -6], [20, -4], [32, -1], [-24, 3], [-10, 1], [4, 0], [16, 2], [-2, -3], [26, 3]].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="6" ry="4.2" transform={`rotate(${(i * 37) % 60 - 30} ${cx} ${cy})`} />
        ))}
      </g>
      <path d="M-44 -2 C-30 -12 30 -12 44 -2" stroke="#fff" strokeWidth="2" fill="none" opacity=".5" strokeLinecap="round" />
      <path d="M-40 14 q10 14 26 18" stroke="#fff" strokeWidth="3" fill="none" opacity=".35" strokeLinecap="round" />
    </g>
  );
}

function LitterBox({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="30" rx="64" ry="9" fill="#2b1d12" opacity=".25" />
      <defs>
        <linearGradient id="lb-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fa7b8" />
          <stop offset="0.35" stopColor="#bcd8e4" />
          <stop offset="1" stopColor="#6c95a8" />
        </linearGradient>
        <linearGradient id="lb-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe0c2" />
          <stop offset="1" stopColor="#cdb98f" />
        </linearGradient>
      </defs>
      <path d="M-62 -8 h124 l-8 36 a8 8 0 0 1 -8 6 h-92 a8 8 0 0 1 -8 -6z" fill="url(#lb-body)" />
      <path d="M-62 -8 h124" stroke="#e9f3f7" strokeWidth="6" strokeLinecap="round" />
      <path d="M-54 -4 h108 l-4 14 h-100z" fill="url(#lb-sand)" />
      <g fill="#b8a273" opacity=".7">{[[-34, 2], [-12, 5], [10, 1], [30, 6], [-2, 9], [22, 10]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.2" />)}</g>
      <path d="M44 -2 l16 -3 l-4 8z" fill="#9aa6a0" opacity=".9" />
      <path d="M-52 18 q6 12 20 14" stroke="#fff" strokeWidth="3" fill="none" opacity=".4" strokeLinecap="round" />
    </g>
  );
}

function Yarn({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="22" rx="24" ry="5" fill="#2b1d12" opacity=".22" />
      <circle cx="0" cy="0" r="22" fill="#d9577a" />
      <path d="M-18 -8 q18 -14 36 0 M-21 2 q21 -12 42 2 M-18 12 q18 -8 36 -2 M-8 -20 q-8 20 4 40 M8 -20 q10 20 -2 40" stroke="#f3a2b8" strokeWidth="2.2" fill="none" opacity=".85" />
      <path d="M20 14 q16 8 34 4" stroke="#d9577a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

const SCENES = {
  litter: { wall: ['#e8e1f0', '#cfc4e0'], floor: ['#b99a6e', '#8c6d46'] },
  duo: { wall: ['#f6e3c4', '#ecc995'], floor: ['#b7875a', '#8a5f39'] },
  kitten: { wall: ['#f8dde6', '#efc2d1'], floor: ['#c39a6b', '#946d45'] },
  can: { wall: ['#f3d9c2', '#e7bfa0'], floor: ['#b98253', '#8d5c37'] },
  bowl: { wall: ['#d7e6ea', '#b4cdd6'], floor: ['#c39a6b', '#946d45'] },
  family: { wall: ['#e1ead3', '#c6d9ae'], floor: ['#b89463', '#8a6a42'] },
};

function CatSvg({ variant = 'can', title = '', className = '' }) {
  const sc = SCENES[variant] || SCENES.can;
  const id = 'cg-' + variant;
  return (
    <svg className={'catart ' + className} viewBox="0 0 320 240" role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={id + '-wall'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sc.wall[0]} />
          <stop offset="1" stopColor={sc.wall[1]} />
        </linearGradient>
        <linearGradient id={id + '-floor'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sc.floor[0]} />
          <stop offset="1" stopColor={sc.floor[1]} />
        </linearGradient>
        <linearGradient id={id + '-ray'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffbe8" stopOpacity=".7" />
          <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id + '-vig'} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#2b1d12" stopOpacity=".28" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill={`url(#${id}-wall)`} />
      {/* แสงจากหน้าต่าง */}
      <polygon points="0,0 120,0 250,196 70,196" fill={`url(#${id}-ray)`} />
      <rect x="18" y="14" width="64" height="76" rx="4" fill="#fff" opacity=".35" />
      <path d="M50 14 V90 M18 52 H82" stroke="#fff" strokeWidth="3" opacity=".6" />
      {/* พื้นไม้ */}
      <rect y="188" width="320" height="52" fill={`url(#${id}-floor)`} />
      <g stroke="#000" strokeOpacity=".12" strokeWidth="1.2">
        <path d="M0 188 H320 M0 206 H320 M0 224 H320" />
        <path d="M70 188 V206 M210 188 V206 M30 206 V224 M150 206 V224 M270 206 V224 M100 224 V240 M230 224 V240" />
      </g>
      <rect width="320" height="240" fill={`url(#${id}-vig)`} />
      {variant === 'can' && (
        <>
          <Can x={222} y={158} s={1.12} />
          <Cat uid={id + '-a'} x={110} y={168} s={1.02} look={3} />
        </>
      )}
      {variant === 'bowl' && (
        <>
          <Cat uid={id + '-a'} x={104} y={166} s={1.05} look={4} tail={0} fur="#8d8f94" stripe="#5d5f64" belly="#eceff1" eye="#7fb04a" />
          <Bowl x={230} y={194} s={1} />
        </>
      )}
      {variant === 'litter' && (
        <>
          <LitterBox x={226} y={176} s={1.05} />
          <Cat uid={id + '-a'} x={98} y={170} s={1} look={4} tail={0} fur="#f1e6d6" stripe="#c9b8a0" belly="#fffaf0" eye="#6fa0c8" />
        </>
      )}
      {variant === 'duo' && (
        <>
          <Cat uid={id + '-a'} x={90} y={170} s={1} look={3} fur="#3f3a37" stripe="#26221f" belly="#f2ece4" eye="#d6b030" />
          <Can x={190} y={160} s={1} />
          <Bowl x={262} y={194} s={0.8} />
        </>
      )}
      {variant === 'kitten' && (
        <>
          <Cat uid={id + '-a'} x={92} y={184} s={0.66} kitten look={4} fur="#e8a15a" stripe="#b8702d" eye="#6aa7d8" tail={0} />
          <Cat uid={id + '-b'} x={196} y={186} s={0.58} kitten look={-3} fur="#bdb7b0" stripe="#8d867e" belly="#f1ede8" eye="#7fb04a" tail={2} />
          <Yarn x={268} y={186} s={0.9} />
        </>
      )}
      {variant === 'family' && (
        <>
          <Cat uid={id + '-k'} x={54} y={182} s={0.6} kitten tail={2} fur="#e3b574" stripe="#b98a47" eye="#6aa7d8" look={2} />
          <Cat uid={id + '-m'} x={156} y={174} s={0.84} look={0} tail={1} />
          <Cat uid={id + '-s'} x={262} y={174} s={0.88} tail={2} senior fur="#9b9690" stripe="#6d6862" belly="#ece7e0" eye="#b8892a" look={-2} />
        </>
      )}
    </svg>
  );
}

// ถ้ามีรูปถ่ายจริงที่ public/articles/<variant>.jpg (can.jpg, bowl.jpg, family.jpg) จะใช้รูปนั้น ถ้าไม่มีไฟล์จะใช้ภาพวาดด้านบนแทนอัตโนมัติ
export default function CatArt(props) {
  const [bad, setBad] = useState(false);
  const { variant = 'can', title = '', className = '' } = props;
  if (bad) return <CatSvg {...props} />;
  return (
    <img
      className={'catart catphoto ' + className}
      src={'/articles/' + variant + '.jpg'}
      alt={title}
      loading="lazy"
      width="320"
      height="240"
      onError={() => setBad(true)}
    />
  );
}

// รูปประกอบบทความ: ถ้ามีรูปถ่ายจริงที่ client/public/articles/<slug>.jpg จะแสดงรูปนั้น ถ้าไม่มี (โหลดไม่ได้) ใช้ภาพวาดแทนอัตโนมัติ
export function ArticleImage({ slug, variant, title = '', className = '' }) {
  const [bad, setBad] = useState(false);
  if (bad) return <CatArt variant={variant} title={title} className={className} />;
  return (
    <img
      className={'catart catphoto ' + className}
      src={'/articles/' + slug + '.jpg'}
      alt={title}
      loading="lazy"
      decoding="async"
      onError={() => setBad(true)}
    />
  );
}
