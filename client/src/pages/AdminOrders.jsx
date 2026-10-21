import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { baht } from '../data/products';
import { ORDER_STATUS, fmtDate, fmtDateTime } from '../data/orders';
import { useProducts } from '../context/ProductsContext';

const FILTERS = [['', 'ทั้งหมด'], ['pending', 'รอชำระเงิน'], ['paid', 'ชำระเงินแล้ว'], ['shipped', 'จัดส่งแล้ว'], ['received', 'ลูกค้ารับแล้ว'], ['cancelled', 'ยกเลิก']];

export default function AdminOrders() {
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || '';
  const { reload: reloadShop } = useProducts();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [track, setTrack] = useState({}); // เลขพัสดุที่กำลังพิมพ์ แยกตามออเดอร์

  const load = useCallback(() => {
    setLoading(true);
    return api.admin
      .orders(status)
      .then((d) => {
        setOrders(d.orders);
        setErr(null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (o, body) => {
    setBusyId(o.id);
    setErr(null);
    try {
      const d = await api.admin.updateOrder(o.id, body);
      setOrders((list) =>
        list.flatMap((x) => {
          if (x.id !== o.id) return [x];
          // ถ้ากรองสถานะอยู่และออเดอร์ย้ายไปสถานะอื่นแล้ว ให้หายจากรายการนี้
          return status && d.order.status !== status ? [] : [d.order];
        })
      );
      if (body.status === 'cancelled') reloadShop(); // สต็อกถูกคืนแล้ว
    } catch (ex) {
      setErr(ex.message);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const rejectSlip = async (o) => {
    const note = window.prompt('เหตุผลที่ปฏิเสธสลิป (ลูกค้าจะเห็นข้อความนี้)', 'ยอดเงินไม่ตรงหรือสลิปไม่ชัด กรุณาแนบสลิปใหม่');
    if (note === null) return;
    setBusyId(o.id);
    setErr(null);
    try {
      const d = await api.admin.rejectSlip(o.id, note);
      setOrders((list) => list.map((x) => (x.id === o.id ? d.order : x)));
    } catch (ex) {
      setErr(ex.message);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const cancel = (o) => {
    if (window.confirm('ยกเลิกออเดอร์ ' + o.orderNo + ' ? ระบบจะคืนสต็อกสินค้าให้อัตโนมัติ')) update(o, { status: 'cancelled' });
  };

  return (
    <>
      <div className="dfilters">
        <div className="chips" role="group" aria-label="กรองตามสถานะ">
          {FILTERS.map(([id, label]) => (
            <button key={id} aria-pressed={status === id} onClick={() => setSp(id ? { status: id } : {})}>{label}</button>
          ))}
        </div>
        <button className="ghost" onClick={load} disabled={loading}>{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</button>
      </div>

      {err && <div className="err" role="alert">{err}</div>}
      {!loading && orders.length === 0 && !err && <p className="note">ไม่มีออเดอร์ในสถานะนี้</p>}

      <ul className="ordlist">
        {orders.map((o) => {
          const busy = busyId === o.id;
          const trackValue = track[o.id] !== undefined ? track[o.id] : o.tracking;
          return (
            <li key={o.id} className="ord panel">
              <div className="ord-head">
                <b className="num">{o.orderNo}</b>
                <span className={'status s-' + o.status}>{ORDER_STATUS[o.status]}</span>
                {o.cancelledByTimeout && <span className="meta">ยกเลิกอัตโนมัติ (ไม่ชำระตามเวลาที่กำหนด)</span>}
                {o.status === 'pending' && o.hasSlip && <span className="slipbadge">แนบสลิปแล้ว รอตรวจ</span>}
                <span className="meta">{fmtDateTime(o.createdAt)}</span>
                {o.customer && <span className="meta">ลูกค้า: {o.customer.name} ({o.customer.email})</span>}
              </div>
              <ul className="ord-items">
                {o.items.map((i) => (
                  <li key={i.product}>
                    <span>{i.name} × {i.qty}</span>
                    <span className="num">{baht(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="ord-foot">
                <span className="num">สินค้า {baht(o.subtotal)} · ค่าส่ง {o.shipping ? baht(o.shipping) : 'ฟรี'} · รวม <b>{baht(o.total)}</b></span>
              </div>
              <div className="meta">จัดส่งถึง {o.address.name} · {o.address.tel} · {o.address.line}</div>

              {o.hasSlip && (
                <div className="slipadmin">
                  <a href={'/api/orders/' + o.id + '/slip?v=' + encodeURIComponent(o.slipAt || '')} target="_blank" rel="noopener noreferrer" aria-label="เปิดสลิปขนาดเต็ม">
                    <img src={'/api/orders/' + o.id + '/slip?v=' + encodeURIComponent(o.slipAt || '')} alt={'สลิปของออเดอร์ ' + o.orderNo} loading="lazy" />
                  </a>
                  <div className="meta">
                    สลิปแนบเมื่อ {fmtDateTime(o.slipAt)}<br />
                    ตรวจยอด <b className="num">{baht(o.total)}</b> ชื่อบัญชีผู้รับ และเวลาโอนให้ตรงก่อนกดยืนยัน
                  </div>
                </div>
              )}

              {(o.status === 'paid' || o.status === 'shipped') && (
                <div className="trackrow">
                  <label htmlFor={'t-' + o.id}>เลขพัสดุ</label>
                  <input id={'t-' + o.id} value={trackValue} maxLength={60} onChange={(e) => setTrack({ ...track, [o.id]: e.target.value })} placeholder="เช่น TH0123456789" />
                  {o.status === 'shipped' && (
                    <button className="ghost" disabled={busy || trackValue === o.tracking} onClick={() => update(o, { tracking: trackValue })}>บันทึกเลขพัสดุ</button>
                  )}
                </div>
              )}

              {o.status === 'shipped' && <p className="note">ร้านจัดส่งแล้ว รอลูกค้ากดยืนยันรับสินค้า (ลูกค้ารีวิวได้หลังยืนยัน)
                {o.autoReceiveAt ? ' · ระบบจะยืนยันให้อัตโนมัติหลัง ' + fmtDate(o.autoReceiveAt) : ''}</p>}
              {o.status === 'received' && (
                <p className="note">
                  {o.autoReceived ? 'ระบบยืนยันรับสินค้าให้อัตโนมัติ' : 'ลูกค้ายืนยันรับสินค้าแล้ว'} {fmtDateTime(o.receivedAt)}{o.tracking ? ' · เลขพัสดุ ' + o.tracking : ''}
                </p>
              )}

              <div className="actions">
                {o.status === 'pending' && (
                  <>
                    <button className="submit" disabled={busy} onClick={() => update(o, { status: 'paid' })}>ยืนยันว่าชำระเงินแล้ว</button>
                    {o.hasSlip && <button className="ghost" disabled={busy} onClick={() => rejectSlip(o)}>สลิปไม่ถูกต้อง</button>}
                    <button className="ghost danger" disabled={busy} onClick={() => cancel(o)}>ยกเลิกออเดอร์</button>
                  </>
                )}
                {o.status === 'paid' && (
                  <>
                    <button className="submit" disabled={busy} onClick={() => update(o, { status: 'shipped', tracking: trackValue })}>จัดส่งแล้ว</button>
                    <button className="ghost" disabled={busy} onClick={() => update(o, { status: 'pending' })}>ย้อนเป็นรอชำระเงิน</button>
                    <button className="ghost danger" disabled={busy} onClick={() => cancel(o)}>ยกเลิกออเดอร์</button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
