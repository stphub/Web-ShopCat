// ภาพประกอบแมวแบบวาดเอง (SVG) สำหรับหน้าบทความ ไม่ต้องใช้ไฟล์รูป
// variant: 'can' แมวกับกระป๋องอาหาร | 'bowl' แมวกับชามอาหาร | 'family' ลูกแมว แมวโต แมวสูงวัย
const INK = '#2b2622';

function Cat({ x = 0, y = 0, s = 1, fur = '#f0a04b', stripe = '#d9822b', belly = '#fff3df', senior = false, kitten = false, look = 0, tail = 1 }) {
  const head = kitten ? 1.12 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* หาง */}
      <path d={tail === 1 ? 'M34 -6 C74 -4 78 -56 52 -70' : 'M-34 -6 C-74 -4 -78 -56 -52 -70'} fill="none" stroke={fur} strokeWidth="14" strokeLinecap="round" />
      {/* ตัว */}
      <ellipse cx="0" cy="-2" rx="44" ry={kitten ? 36 : 46} fill={fur} />
      <ellipse cx="0" cy="6" rx="25" ry={kitten ? 24 : 32} fill={belly} />
      <path d="M-30 -22 q6 8 0 16 M30 -22 q-6 8 0 16" stroke={stripe} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* เท้าหน้า */}
      <ellipse cx="-16" cy={kitten ? 30 : 42} rx="11" ry="8" fill={belly} stroke={fur} strokeWidth="2" />
      <ellipse cx="16" cy={kitten ? 30 : 42} rx="11" ry="8" fill={belly} stroke={fur} strokeWidth="2" />
      {/* หัว */}
      <g transform={`translate(0 ${kitten ? -52 : -66}) scale(${head})`}>
        <path d="M-36 -10 L-30 -44 L-8 -28 Z" fill={fur} />
        <path d="M36 -10 L30 -44 L8 -28 Z" fill={fur} />
        <path d="M-30 -14 L-28 -34 L-15 -26 Z" fill="#f6b9b0" />
        <path d="M30 -14 L28 -34 L15 -26 Z" fill="#f6b9b0" />
        <ellipse cx="0" cy="0" rx="40" ry="34" fill={fur} />
        {senior && <ellipse cx="0" cy="12" rx="22" ry="15" fill="#ddd6cd" />}
        {!senior && <ellipse cx="0" cy="12" rx="22" ry="15" fill={belly} />}
        <path d="M-6 -30 v10 M0 -32 v12 M6 -30 v10" stroke={stripe} strokeWidth="3.2" strokeLinecap="round" />
        {/* ตา */}
        <ellipse cx="-16" cy="-4" rx="5.5" ry="7" fill={INK} />
        <ellipse cx="16" cy="-4" rx="5.5" ry="7" fill={INK} />
        <circle cx={-14 + look} cy="-7" r="2" fill="#fff" />
        <circle cx={18 + look} cy="-7" r="2" fill="#fff" />
        {/* จมูกและปาก */}
        <path d="M-4 6 h8 l-4 5 z" fill="#e58a8a" />
        <path d="M0 11 v4 M0 15 q-6 6 -11 1 M0 15 q6 6 11 1" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* หนวด */}
        <path d="M-24 8 l-22 -4 M-24 13 l-22 3 M24 8 l22 -4 M24 13 l22 3" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
        {/* แก้มแดง */}
        <ellipse cx="-27" cy="10" rx="6" ry="3.6" fill="#f4a29a" opacity=".55" />
        <ellipse cx="27" cy="10" rx="6" ry="3.6" fill="#f4a29a" opacity=".55" />
        {/* แว่นของแมวสูงวัย */}
        {senior && (
          <g fill="none" stroke={INK} strokeWidth="2.4">
            <circle cx="-16" cy="-4" r="11" />
            <circle cx="16" cy="-4" r="11" />
            <path d="M-5 -4 h10" />
          </g>
        )}
      </g>
    </g>
  );
}

function Can({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="44" rx="40" ry="8" fill="#000" opacity=".12" />
      <rect x="-34" y="-34" width="68" height="76" rx="8" fill="#e9eef3" stroke="#b9c5d1" strokeWidth="2" />
      <rect x="-34" y="-6" width="68" height="34" fill="#f26b5b" />
      <path d="M-14 6 q14 -14 28 0 q-14 14 -28 0z" fill="#fff" opacity=".9" />
      <circle cx="-4" cy="6" r="2" fill="#f26b5b" />
      <ellipse cx="0" cy="-34" rx="34" ry="8" fill="#d3dce5" stroke="#b9c5d1" strokeWidth="2" />
      <ellipse cx="0" cy="-35" rx="25" ry="4.5" fill="#c3cfda" />
      <path d="M10 -39 a6 6 0 1 1 0.1 0" fill="none" stroke="#98a8b8" strokeWidth="3" />
    </g>
  );
}

function Bowl({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="26" rx="52" ry="9" fill="#000" opacity=".12" />
      <path d="M-50 0 h100 a50 38 0 0 1 -100 0z" fill="#7fb3c8" />
      <path d="M-50 0 h100 a50 38 0 0 1 -6 20 h-88 a50 38 0 0 1 -6 -20z" fill="#9fc9db" opacity=".55" />
      <ellipse cx="0" cy="0" rx="50" ry="10" fill="#f3d9a8" />
      <g fill="#c98a4b">
        <circle cx="-22" cy="-3" r="6" />
        <circle cx="-4" cy="-6" r="6.5" />
        <circle cx="16" cy="-3" r="6" />
        <circle cx="30" cy="-6" r="5" />
        <circle cx="4" cy="2" r="5" />
      </g>
      <path d="M-18 -2 q-2 -6 2 -9 M8 -9 q-2 -6 2 -9" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7" />
    </g>
  );
}

function Hearts() {
  const h = 'M0 6 C-8 -2 -8 -10 -2 -10 C1 -10 0 -6 0 -6 C0 -6 -1 -10 2 -10 C8 -10 8 -2 0 6z';
  return (
    <g fill="#f26b7a" opacity=".85">
      <path d={h} transform="translate(250 60) scale(1.2)" />
      <path d={h} transform="translate(276 86) scale(.8)" />
      <path d={h} transform="translate(60 88) scale(.9)" />
    </g>
  );
}

const SCENES = {
  can: { bg: ['#fde7d6', '#f9c9b0'] },
  bowl: { bg: ['#dff0f6', '#bcd9e6'] },
  family: { bg: ['#e8f1dc', '#cfe3b9'] },
};

export default function CatArt({ variant = 'can', title = '', className = '' }) {
  const sc = SCENES[variant] || SCENES.can;
  const id = 'cg-' + variant;
  return (
    <svg className={'catart ' + className} viewBox="0 0 320 240" role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={sc.bg[0]} />
          <stop offset="1" stopColor={sc.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="320" height="240" fill={`url(#${id})`} />
      <circle cx="40" cy="40" r="70" fill="#fff" opacity=".25" />
      <circle cx="300" cy="210" r="90" fill="#fff" opacity=".18" />
      <rect y="196" width="320" height="44" fill="#fff" opacity=".35" />
      {variant === 'can' && (
        <>
          <Can x={214} y={150} s={1.15} />
          <Cat x={104} y={164} s={1.05} look={3} />
          <path d="M150 128 q18 -22 36 -6" stroke="#f0a04b" strokeWidth="13" strokeLinecap="round" fill="none" />
          <Hearts />
        </>
      )}
      {variant === 'bowl' && (
        <>
          <Cat x={104} y={158} s={1.1} look={4} tail={0} />
          <Bowl x={226} y={188} s={1} />
          <Hearts />
        </>
      )}
      {variant === 'family' && (
        <>
          <Cat x={64} y={176} s={0.62} kitten fur="#f4c27a" stripe="#e0a24a" look={2} />
          <Cat x={160} y={168} s={0.86} look={0} tail={0} />
          <Cat x={262} y={168} s={0.9} senior fur="#a9a29a" stripe="#8c857d" belly="#ece7e0" look={-2} />
        </>
      )}
    </svg>
  );
}
