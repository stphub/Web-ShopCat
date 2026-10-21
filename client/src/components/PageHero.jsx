// ส่วนหัวสีเข้มไล่สีเบลอของหน้าข้อมูล (เกี่ยวกับเรา / ช่วยเหลือ) ธีมเดียวกับหน้าร้าน
export default function PageHero({ label, title, desc }) {
  return (
    <section className="aurora pagehero" aria-labelledby="ph-title">
      <span className="blob b1" aria-hidden="true" />
      <span className="blob b2" aria-hidden="true" />
      <span className="blob b3" aria-hidden="true" />
      <div className="wrap pageheroin">
        {label && <span className="pill">{label}</span>}
        <h1 id="ph-title">{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
    </section>
  );
}
