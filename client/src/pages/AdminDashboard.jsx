import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Art from '../components/Art';
import { api } from '../api';
import { baht } from '../data/products';

const RANGES = [7, 30, 90];

// ---------- ตัวช่วยจัดรูปแบบ ----------
function fmtCompact(n) {
  if (n >= 1e6) return +(n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return +(n / 1e3).toFixed(2) + 'K';
  return String(n);
}
// เพดานแกน Y ที่หารสี่แล้วได้เลขกลม (1, 2, 4, 8, 10 เท่าของหลักสิบ)
function niceMax(v) {
  if (v <= 0) return 100;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 8 ? 8 : 10) * p;
}
const thDay = (key, opts) =>
  new Date(key + 'T00:00:00+07:00').toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', ...opts });

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setW(Math.max(260, Math.floor(el.clientWidth || 640)));
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// ---------- กราฟแท่งยอดขายรายวัน (ชุดข้อมูลเดียว ใช้สีเดียว) ----------
function SalesChart({ daily, total }) {
  const [wrapRef, w] = useWidth();
  const [active, setActive] = useState(null);
  const H = 240;
  const padL = 46;
  const padR = 8;
  const padT = 20;
  const padB = 26;
  const plotW = w - padL - padR;
  const plotH = H - padT - padB;
  const n = daily.length;
  const band = plotW / n;
  const bw = Math.max(1.5, Math.min(24, band - 2)); // แท่งบางไม่เกิน 24px เว้นช่อง 2px
  const peak = Math.max(0, ...daily.map((d) => d.revenue));
  const max = niceMax(peak);
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const y = (v) => padT + plotH - (v / max) * plotH;
  const peakIdx = peak > 0 ? daily.findIndex((d) => d.revenue === peak) : -1;

  const labelEvery = Math.max(1, Math.ceil(n / (w < 480 ? 4 : 7)));
  const bar = (i, d) => {
    const x = padL + band * i + (band - bw) / 2;
    const h = (d.revenue / max) * plotH;
    if (h <= 0) return null;
    const r = Math.min(4, bw / 2, h); // ปลายแท่งมน 4px ฐานเหลี่ยม
    const top = padT + plotH - h;
    return `M${x},${top + h} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x + bw - r},${top} Q${x + bw},${top} ${x + bw},${top + r} L${x + bw},${top + h} Z`;
  };

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive((a) => (a === null ? n - 1 : Math.max(0, a - 1)));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive((a) => (a === null ? 0 : Math.min(n - 1, a + 1)));
    } else if (e.key === 'Escape') setActive(null);
  };

  const a = active === null ? null : daily[active];
  const ax = active === null ? 0 : padL + band * active + band / 2;
  const ay = a ? y(a.revenue) : 0;

  return (
    <div className="chartwrap" ref={wrapRef}>
      <svg
        width={w}
        height={H}
        role="img"
        tabIndex={0}
        aria-label={`กราฟแท่งยอดขายรายวัน ${n} วัน รวม ${baht(total)} ใช้ปุ่มลูกศรซ้ายขวาเพื่ออ่านค่าแต่ละวัน หรือเปิดดูเป็นตาราง`}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} className="gridline" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="axis num">{fmtCompact(t)}</text>
          </g>
        ))}
        {daily.map((d, i) => {
          const path = bar(i, d);
          return path ? <path key={d.date} d={path} className="bar" style={{ opacity: active === null || active === i ? 1 : 0.5 }} /> : null;
        })}
        {peakIdx >= 0 && (() => {
          const cx = padL + band * peakIdx + band / 2;
          const anchor = cx < padL + 24 ? 'start' : cx > w - padR - 24 ? 'end' : 'middle';
          return <text x={cx} y={y(peak) - 6} textAnchor={anchor} className="peaklabel num">{fmtCompact(peak)}</text>;
        })()}
        {daily.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.date} x={padL + band * i + band / 2} y={H - 8} textAnchor="middle" className="axis">
              {thDay(d.date, { day: 'numeric', month: 'short' })}
            </text>
          ) : null
        )}
        {/* พื้นที่รับเมาส์/นิ้วกว้างเต็มช่องของแต่ละวัน ใหญ่กว่าตัวแท่ง */}
        {daily.map((d, i) => (
          <rect key={'h' + d.date} x={padL + band * i} y={padT} width={band} height={plotH} fill="transparent" onPointerEnter={() => setActive(i)} onPointerMove={() => setActive(i)} />
        ))}
      </svg>
      {a && (
        <div className="tip" style={{ left: Math.min(Math.max(ax, 80), w - 80), top: Math.max(ay, 28) - 8 }} role="status">
          <div className="tip-val num">{baht(a.revenue)}</div>
          <div className="tip-lab">{thDay(a.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {a.orders} ออเดอร์</div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, sub, to }) {
  const inner = (
    <>
      <div className="stat-label">{label}</div>
      <div className="stat-value num">{value}</div>
      <div className="stat-sub">{sub}</div>
    </>
  );
  return to ? <Link className="stat" to={to}>{inner}</Link> : <div className="stat">{inner}</div>;
}

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [table, setTable] = useState(false);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    api.admin
      .stats(days)
      .then((d) => {
        if (dead) return;
        setData(d);
        setErr(null);
      })
      .catch((e) => !dead && setErr(e.message))
      .finally(() => !dead && setLoading(false));
    return () => {
      dead = true;
    };
  }, [days]);

  const maxQty = useMemo(() => (data ? Math.max(1, ...data.bestSellers.map((b) => b.qty)) : 1), [data]);

  if (!data) {
    return err ? <div className="err" role="alert">โหลดข้อมูลแดชบอร์ดไม่สำเร็จ: {err}</div> : <p className="note">กำลังโหลดแดชบอร์ด...</p>;
  }

  const t = data;
  return (
    <>
      <div className="dfilters">
        <div className="chips" role="group" aria-label="ช่วงเวลา">
          {RANGES.map((r) => (
            <button key={r} aria-pressed={days === r} onClick={() => setDays(r)}>{r} วันล่าสุด</button>
          ))}
        </div>
        <span className="meta">ยอดขายนับเฉพาะออเดอร์ที่ชำระเงินแล้วหรือจัดส่งแล้ว ตามวันที่สั่งซื้อ (เวลาไทย)</span>
      </div>
      {err && <div className="err" role="alert">อัปเดตข้อมูลไม่สำเร็จ: {err}</div>}

      <div className={'dashbody' + (loading ? ' refetch' : '')}>
        <div className="stats">
          <Tile label="ยอดขายวันนี้" value={baht(t.today.revenue)} sub={`${t.today.orders} ออเดอร์`} />
          <Tile label={`ยอดขาย ${t.days} วัน`} value={baht(t.totals.revenue)} sub={`${t.totals.orders} ออเดอร์`} />
          <Tile label="เฉลี่ยต่อออเดอร์" value={baht(t.totals.aov)} sub={t.totals.orders ? `จาก ${t.totals.orders} ออเดอร์` : 'ยังไม่มีออเดอร์'} />
          <Tile label="รอชำระเงิน" value={`${t.pending.orders} ออเดอร์`} sub={`รวม ${baht(t.pending.amount)} · ดูรายการ`} to="/admin/orders?status=pending" />
        </div>

        <section className="panel" aria-labelledby="chart-title">
          <div className="panelhead">
            <h2 id="chart-title">ยอดขายรายวัน (บาท)</h2>
            <button className="ghost" aria-expanded={table} onClick={() => setTable((v) => !v)}>{table ? 'ซ่อนตาราง' : 'ดูเป็นตาราง'}</button>
          </div>
          {t.totals.orders === 0 && (
            <p className="note">ยังไม่มียอดขายในช่วงนี้ ยอดจะขึ้นเมื่อมีออเดอร์ที่ชำระเงินแล้ว (ยืนยันที่หน้า "ออเดอร์")</p>
          )}
          <SalesChart daily={t.daily} total={t.totals.revenue} />
          {table && (
            <div className="tablewrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>วันที่</th><th className="r">ออเดอร์</th><th className="r">ยอดขาย</th></tr></thead>
                <tbody>
                  {[...t.daily].reverse().map((d) => (
                    <tr key={d.date}>
                      <td>{thDay(d.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="r num">{d.orders}</td>
                      <td className="r num">{baht(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="dgrid">
          <section className="panel" aria-labelledby="best-title">
            <h2 id="best-title">สินค้าขายดี {t.days} วัน</h2>
            {t.bestSellers.length === 0 ? (
              <p className="note">ยังไม่มีข้อมูล เมื่อมีออเดอร์ที่ชำระเงินแล้ว สินค้าขายดีจะแสดงที่นี่</p>
            ) : (
              <ol className="bslist">
                {t.bestSellers.map((b) => (
                  <li key={b.id} className="bs">
                    <div className="tthumb"><Art product={b} /></div>
                    <div className="bs-main">
                      <div className="bs-top"><span className="pname">{b.name}</span><span className="num">{b.qty} ชิ้น</span></div>
                      <div className="track"><i style={{ width: (b.qty / maxQty) * 100 + '%' }} /></div>
                      <div className="meta num">ยอดขาย {baht(b.revenue)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="panel" aria-labelledby="low-title">
            <h2 id="low-title">สินค้าใกล้หมดสต็อก</h2>
            {t.lowStock.length === 0 ? (
              <p className="note">ไม่มีสินค้าที่เหลือ {t.lowThreshold} ชิ้นหรือน้อยกว่า</p>
            ) : (
              <ul className="lowlist">
                {t.lowStock.map((p) => (
                  <li key={p.id}>
                    <div className="tthumb"><Art product={p} /></div>
                    <span className="pname">{p.name}</span>
                    <span className={'lowtag' + (p.stock === 0 ? ' zero' : '')}>{p.stock === 0 ? 'หมด' : `เหลือ ${p.stock}`}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="meta"><Link to="/admin/products">ไปปรับจำนวนสต็อกที่หน้าสินค้า</Link> (แสดงเฉพาะสินค้าที่เปิดขายอยู่ เหลือไม่เกิน {t.lowThreshold} ชิ้น)</p>
          </section>
        </div>

        {t.pendingReturns > 0 && (
          <p className="note">มีคำขอคืน/เปลี่ยนสินค้ารอตรวจสอบ {t.pendingReturns} รายการ <Link to="/admin/returns">ไปตรวจสอบ</Link></p>
        )}
        <p className="meta">
          ออเดอร์ทั้งหมดตามสถานะ: รอชำระเงิน {t.statusCounts.pending} · ชำระเงินแล้ว {t.statusCounts.paid} · จัดส่งแล้ว {t.statusCounts.shipped} · ลูกค้ารับแล้ว {t.statusCounts.received || 0} · ยกเลิก {t.statusCounts.cancelled}
        </p>
      </div>
    </>
  );
}
