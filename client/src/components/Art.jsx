// ภาพประกอบสินค้า วาดด้วย SVG ไม่ต้องใช้ไฟล์รูป (สตริงด้านล่างเป็นค่าคงที่ในโค้ด ไม่ได้มาจากผู้ใช้)

function face(cx, cy, r) {
  return (
    `<polygon points="${cx - r},${cy - r * 0.2} ${cx - r * 0.9},${cy - r * 1.2} ${cx - r * 0.2},${cy - r * 0.8}" fill="#fff"/>` +
    `<polygon points="${cx + r},${cy - r * 0.2} ${cx + r * 0.9},${cy - r * 1.2} ${cx + r * 0.2},${cy - r * 0.8}" fill="#fff"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>` +
    `<circle cx="${cx - r * 0.4}" cy="${cy - r * 0.1}" r="${r * 0.12}" fill="#14303a"/>` +
    `<circle cx="${cx + r * 0.4}" cy="${cy - r * 0.1}" r="${r * 0.12}" fill="#14303a"/>` +
    `<polygon points="${cx - r * 0.12},${cy + r * 0.25} ${cx + r * 0.12},${cy + r * 0.25} ${cx},${cy + r * 0.4}" fill="#d63f66"/>`
  );
}

function shapes(kind, c) {
  const line = 'stroke="#14303a" stroke-width="3" stroke-linecap="round" fill="none"';
  switch (kind) {
    case 'bag':
      return `<path d="M30 24h60l4 80H26z" fill="${c}"/><rect x="30" y="20" width="60" height="9" rx="3" fill="#14303a" opacity=".3"/>${face(60, 68, 17)}`;
    case 'can':
      return `<rect x="30" y="38" width="60" height="62" rx="8" fill="${c}"/><ellipse cx="60" cy="38" rx="30" ry="8" fill="#14303a" opacity=".3"/><ellipse cx="60" cy="36" rx="30" ry="8" fill="#fff" opacity=".7"/>${face(60, 70, 15)}`;
    case 'pouch':
      return `<path d="M32 26h56l4 10-6 62H34l-6-62z" fill="${c}"/><rect x="32" y="26" width="56" height="8" fill="#14303a" opacity=".3"/><path d="M60 84c-14-10-16-20-8-24 4-2 7 0 8 3 1-3 4-5 8-3 8 4 6 14-8 24z" fill="#fff"/>`;
    case 'mouse':
      return `<path d="M88 78c14 4 20-6 24-18" ${line}/><ellipse cx="58" cy="76" rx="34" ry="22" fill="${c}"/><circle cx="36" cy="54" r="11" fill="${c}"/><circle cx="36" cy="54" r="6" fill="#d63f66" opacity=".6"/><circle cx="44" cy="68" r="12" fill="${c}"/><circle cx="34" cy="78" r="3" fill="#14303a"/><circle cx="26" cy="86" r="3.5" fill="#d63f66"/>`;
    case 'wand':
      return `<line x1="22" y1="102" x2="74" y2="44" ${line}/><path d="M74 44c8 8 6 14 4 22" ${line}/><ellipse cx="86" cy="76" rx="6" ry="14" fill="${c}" transform="rotate(-20 86 76)"/><ellipse cx="96" cy="70" rx="6" ry="14" fill="#2f8fb0" transform="rotate(10 96 70)"/><ellipse cx="78" cy="82" rx="5" ry="12" fill="#d63f66" transform="rotate(-45 78 82)"/><circle cx="82" cy="94" r="6" fill="#f2b33d"/>`;
    case 'sand':
      return `<path d="M34 30h52l8 72H26z" fill="${c}"/><rect x="34" y="26" width="52" height="8" rx="3" fill="#14303a" opacity=".3"/><rect x="38" y="52" width="44" height="28" rx="4" fill="#fff" opacity=".85"/><circle cx="48" cy="66" r="3" fill="${c}"/><circle cx="60" cy="62" r="3" fill="${c}"/><circle cx="70" cy="68" r="3" fill="${c}"/>`;
    case 'box':
      return `<path d="M18 62a42 40 0 0 1 84 0v30a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8z" fill="${c}"/><ellipse cx="60" cy="74" rx="20" ry="16" fill="#14303a" opacity=".45"/><rect x="38" y="30" width="44" height="6" rx="3" fill="#fff" opacity=".6"/>`;
    case 'post':
      return `<rect x="24" y="96" width="72" height="10" rx="4" fill="#14303a" opacity=".35"/><rect x="50" y="34" width="20" height="64" fill="${c}"/><path d="M50 46h20M50 58h20M50 70h20M50 82h20" stroke="#14303a" stroke-opacity=".35" stroke-width="3"/><circle cx="60" cy="26" r="11" fill="#d63f66"/>`;
    case 'bed':
      return `<ellipse cx="60" cy="82" rx="46" ry="22" fill="${c}"/><ellipse cx="60" cy="74" rx="34" ry="14" fill="#fff" opacity=".7"/><path d="M42 72c6-14 30-14 36 0" fill="#14303a" opacity=".25"/>`;
    case 'collar':
      return `<ellipse cx="60" cy="58" rx="34" ry="30" fill="none" stroke="${c}" stroke-width="12"/><rect x="52" y="82" width="16" height="6" fill="#14303a" opacity=".4"/><circle cx="60" cy="98" r="10" fill="#f2b33d"/><line x1="52" y1="98" x2="68" y2="98" stroke="#14303a" stroke-width="2"/>`;
    case 'fountain':
      return `<ellipse cx="60" cy="92" rx="40" ry="10" fill="#14303a" opacity=".3"/><path d="M22 80h76v12a12 12 0 0 1-12 12H34a12 12 0 0 1-12-12z" fill="${c}"/><rect x="52" y="40" width="16" height="42" rx="6" fill="#fff" opacity=".8"/><path d="M60 24c6 8 8 12 0 16-8-4-6-8 0-16z" fill="#2f8fb0"/><path d="M44 52c-6 8-6 14 2 16M76 52c6 8 6 14-2 16" ${line} opacity=".5"/>`;
    default:
      return '';
  }
}

// กล่องภาพสินค้า: ถ้ามีรูปจริง (imageUrl) แสดงรูปนั้น ไม่งั้นใช้ภาพประกอบ SVG บนพื้นสีอ่อนของสินค้า
export default function Art({ product, children }) {
  if (product.imageUrl) {
    return (
      <div className="art" style={{ background: 'var(--bg)' }}>
        {children}
        <img className="photo" src={product.imageUrl} alt={product.name || ''} loading="lazy" />
      </div>
    );
  }
  const svg = `<svg viewBox="0 0 120 120" aria-hidden="true">${shapes(product.kind, product.color)}</svg>`;
  return (
    <div className="art" style={{ background: `color-mix(in srgb, ${product.color} 20%, var(--surface))` }}>
      {children}
      <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
