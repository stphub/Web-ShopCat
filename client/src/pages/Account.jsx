import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageBar from '../components/PageBar';
import AddressFields from '../components/AddressFields';
import OrderItemReview from '../components/OrderItemReview';
import ReturnRequest from '../components/ReturnRequest';
import ReturnStatus from '../components/ReturnStatus';
import PromptPayBox from '../components/PromptPayBox';
import ProfilePanel from '../components/ProfilePanel';
import SecurityQuestionPanel from '../components/SecurityQuestionPanel';
import { api } from '../api';
import { baht } from '../data/products';
import { ORDER_STATUS, fmtDate, fmtDateTime } from '../data/orders';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';

const EMPTY = { label: '', name: '', tel: '', line: '', isDefault: false };

// หน้าบัญชีของฉัน: จัดการที่อยู่จัดส่งที่บันทึกไว้ และดูประวัติคำสั่งซื้อ
export default function Account() {
  const { user, loading } = useAuth();
  const { reload: reloadShop, returnDays, payMinutes, byId } = useProducts();
  const { change } = useCart();
  const [buyMsg, setBuyMsg] = useState(null); // { id, text, added }

  const [addresses, setAddresses] = useState(null);
  const [addrErr, setAddrErr] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [formErr, setFormErr] = useState(null); // { message, field }
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const [orders, setOrders] = useState(null);
  const [ordErr, setOrdErr] = useState(null);

  const loadAddresses = useCallback(
    () =>
      api.addresses
        .list()
        .then((d) => {
          setAddresses(d.addresses);
          setAddrErr(null);
        })
        .catch((e) => setAddrErr(e.message)),
    []
  );
  const loadOrders = useCallback(
    () =>
      api.orders
        .mine()
        .then((d) => {
          setOrders(d.orders);
          setOrdErr(null);
        })
        .catch((e) => setOrdErr(e.message)),
    []
  );

  const [myReviews, setMyReviews] = useState({}); // productId -> { id, rating, comment }
  const [recvBusy, setRecvBusy] = useState(null);
  const [returns, setReturns] = useState([]); // คำขอคืน/เปลี่ยนสินค้าของฉัน
  const [returnFor, setReturnFor] = useState(null); // id ออเดอร์ที่กำลังเปิดฟอร์มแจ้งคืน
  const [retMsg, setRetMsg] = useState('');

  const loadReviews = useCallback(
    () =>
      api.reviews
        .mine()
        .then((d) => {
          const m = {};
          d.reviews.forEach((r) => {
            m[r.product] = r;
          });
          setMyReviews(m);
        })
        .catch(() => {}),
    []
  );

  const loadReturns = useCallback(
    () =>
      api.returns
        .mine()
        .then((d) => setReturns(d.returns))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadOrders();
      loadReviews();
      loadReturns();
    } else {
      setMyReviews({});
      setReturns([]);
      setReturnFor(null);
    }
  }, [user, loadAddresses, loadOrders, loadReviews, loadReturns]);

  if (loading) return <div className="authwrap"><p className="sub">กำลังโหลด...</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormErr(null);
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({ label: a.label, name: a.name, tel: a.tel, line: a.line, isDefault: a.isDefault });
    setFormErr(null);
    setNotice('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormErr(null);
    setNotice('');
    try {
      if (editingId) await api.addresses.update(editingId, form);
      else await api.addresses.create(form);
      setNotice(editingId ? 'บันทึกการแก้ไขที่อยู่แล้ว' : 'เพิ่มที่อยู่แล้ว');
      reset();
      await loadAddresses();
    } catch (ex) {
      setFormErr({ message: ex.message, field: ex.field });
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = async (a) => {
    setNotice('');
    try {
      await api.addresses.setDefault(a.id);
      await loadAddresses();
    } catch (ex) {
      setAddrErr(ex.message);
    }
  };

  const removeAddress = async (a) => {
    if (!window.confirm('ลบที่อยู่ "' + (a.label || a.name) + '" ใช่ไหม')) return;
    setNotice('');
    try {
      await api.addresses.remove(a.id);
      if (editingId === a.id) reset();
      await loadAddresses();
    } catch (ex) {
      setAddrErr(ex.message);
    }
  };

  // สั่งซ้ำ: ใส่สินค้าของออเดอร์เก่าลงตะกร้า (ข้ามของที่เลิกขาย/หมด และลดจำนวนตามสต็อกที่เหลือ)
  const buyAgain = (o) => {
    let added = 0;
    const notes = [];
    o.items.forEach((i) => {
      const p = byId[i.product];
      if (!p) return notes.push(i.name + ' (เลิกขายแล้ว)');
      if (p.stock <= 0) return notes.push(i.name + ' (หมด)');
      const want = Math.min(i.qty, p.stock);
      change(i.product, want);
      added += 1;
      if (want < i.qty) notes.push(i.name + ' (เหลือ ' + p.stock + ' ชิ้น ใส่ให้เท่าที่มี)');
    });
    setBuyMsg({
      id: o.id,
      added,
      text: added
        ? 'ใส่ตะกร้าแล้ว ' + added + ' รายการ' + (notes.length ? ' · ข้าม/ปรับ: ' + notes.join(', ') : '')
        : 'สินค้าในออเดอร์นี้ไม่มีให้สั่งแล้ว: ' + notes.join(', '),
    });
  };

  const cancelOrder = async (o) => {
    if (!window.confirm('ยกเลิกออเดอร์ ' + o.orderNo + ' ใช่ไหม')) return;
    try {
      await api.orders.cancel(o.id);
      await loadOrders();
      reloadShop(); // สต็อกถูกคืนแล้ว
    } catch (ex) {
      setOrdErr(ex.message);
    }
  };

  const receiveOrder = async (o) => {
    if (!window.confirm('ยืนยันว่าคุณได้รับสินค้าของออเดอร์ ' + o.orderNo + ' แล้วใช่ไหม')) return;
    setRecvBusy(o.id);
    setOrdErr(null);
    try {
      await api.orders.receive(o.id);
      await loadOrders();
    } catch (ex) {
      setOrdErr(ex.message);
      loadOrders();
    } finally {
      setRecvBusy(null);
    }
  };

  const withdrawReturn = async (r) => {
    if (!window.confirm('ยกเลิกคำขอคืน/เปลี่ยนสินค้านี้ใช่ไหม')) return;
    setOrdErr(null);
    try {
      await api.returns.withdraw(r.id);
    } catch (ex) {
      setOrdErr(ex.message);
    }
    loadReturns();
  };

  const onReturnSent = () => {
    setReturnFor(null);
    setRetMsg('ส่งคำขอแล้ว ร้านจะตรวจสอบและแจ้งผลที่หน้านี้');
    loadReturns();
  };

  const onReviewSaved = (productId, review) => {
    setMyReviews((m) => ({ ...m, [productId]: review }));
    reloadShop(); // อัปเดตคะแนนเฉลี่ยบนหน้าร้าน
  };

  return (
    <div className="admin">
      <PageBar title="บัญชีของฉัน" />
      <main className="wrap adminmain">
        <ProfilePanel />

        <section className="panel" aria-labelledby="addr-title">
          <h2 id="addr-title">ที่อยู่จัดส่งที่บันทึกไว้</h2>
          {addrErr && <div className="err" role="alert">{addrErr}</div>}
          {addresses === null && !addrErr && <p className="note">กำลังโหลด...</p>}
          {addresses && addresses.length === 0 && (
            <p className="note">ยังไม่มีที่อยู่ที่บันทึกไว้ เพิ่มจากฟอร์มด้านล่าง หรือติ๊ก "บันทึกที่อยู่นี้" ตอนสั่งซื้อ</p>
          )}
          {addresses && addresses.length > 0 && (
            <ul className="addrlist">
              {addresses.map((a) => (
                <li key={a.id} className="addrcard">
                  <div>
                    <b>{a.label || a.name}</b>
                    {a.isDefault && <em className="tag">ที่อยู่หลัก</em>}
                    <div className="meta">{a.name} · {a.tel}</div>
                    <div className="meta">{a.line}</div>
                  </div>
                  <div className="rowact">
                    {!a.isDefault && <button className="ghost" onClick={() => makeDefault(a)}>ตั้งเป็นที่อยู่หลัก</button>}
                    <button className="ghost" onClick={() => startEdit(a)}>แก้ไข</button>
                    <button className="ghost danger" onClick={() => removeAddress(a)}>ลบ</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className="addrform" onSubmit={submit} noValidate>
            <h3>{editingId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h3>
            <AddressFields values={form} onChange={setForm} idPrefix="a" showLabel errorField={formErr && formErr.field} />
            {!editingId && addresses && addresses.length > 0 && (
              <label className="check" htmlFor="a-default">
                <input id="a-default" type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                ตั้งเป็นที่อยู่หลัก
              </label>
            )}
            {formErr && <div className="err" role="alert">{formErr.message}</div>}
            <div className="actions">
              <button className="submit" type="submit" disabled={busy}>{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มที่อยู่'}</button>
              {editingId && <button type="button" className="ghost" onClick={reset}>ยกเลิกการแก้ไข</button>}
            </div>
            {notice && <p className="okmsg" role="status">{notice}</p>}
          </form>
        </section>

        <SecurityQuestionPanel />

        <section className="panel" aria-labelledby="ord-title">
          <h2 id="ord-title">คำสั่งซื้อของฉัน</h2>
          {ordErr && <div className="err" role="alert">{ordErr}</div>}
          {retMsg && <p className="okmsg" role="status">{retMsg}</p>}
          {orders === null && !ordErr && <p className="note">กำลังโหลด...</p>}
          {orders && orders.length === 0 && (
            <p className="note">ยังไม่มีคำสั่งซื้อ <Link to="/">ไปเลือกสินค้า</Link></p>
          )}
          {orders && orders.length > 0 && (
            <ul className="ordlist">
              {orders.map((o) => (
                <li key={o.id} className="ord">
                  <div className="ord-head">
                    <b className="num">{o.orderNo}</b>
                    <span className={'status s-' + o.status}>{ORDER_STATUS[o.status]}</span>
                    <span className="meta">{fmtDateTime(o.createdAt)}</span>
                  </div>
                  <ul className="ord-items">
                    {o.items.map((i) => (
                      <li key={i.product} className={o.status === 'received' ? 'hasrv' : undefined}>
                        <span>{i.name} × {i.qty}</span>
                        <span className="num">{baht(i.price * i.qty)}</span>
                        {o.status === 'received' && (
                          <OrderItemReview item={i} review={myReviews[i.product] || null} onSaved={onReviewSaved} />
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="ord-foot">
                    <span className="num">ค่าส่ง {o.shipping ? baht(o.shipping) : 'ฟรี'} · รวม <b>{baht(o.total)}</b></span>
                    {o.tracking && <span className="num">เลขพัสดุ: <b>{o.tracking}</b></span>}
                    {o.status === 'pending' && <button className="ghost danger" onClick={() => cancelOrder(o)}>ยกเลิกออเดอร์</button>}
                    <button className="ghost buyagain" onClick={() => buyAgain(o)}>สั่งซ้ำ</button>
                    {o.status === 'shipped' && (
                      <button className="submit" disabled={recvBusy === o.id} onClick={() => receiveOrder(o)}>ยืนยันรับสินค้า</button>
                    )}
                  </div>
                  {o.cancelledByTimeout && (
                    <p className="note">ออเดอร์นี้ถูกยกเลิกอัตโนมัติ เพราะไม่ได้ชำระเงินภายใน {payMinutes} นาที (คืนสต็อกแล้ว) กด "สั่งซ้ำ" เพื่อสั่งใหม่ได้</p>
                  )}
                  {buyMsg && buyMsg.id === o.id && (
                    <p className={buyMsg.added ? 'okmsg' : 'err'} role="status">
                      {buyMsg.text} {buyMsg.added > 0 && <Link to="/?cart=1">เปิดตะกร้า</Link>}
                    </p>
                  )}
                  <div className="meta">ส่งไปที่ {o.address.name} · {o.address.tel} · {o.address.line}</div>
                  {o.status === 'pending' && (
                    <PromptPayBox
                      order={o}
                      onChange={(n) => setOrders((list) => list.map((x) => (x.id === n.id ? n : x)))}
                      onExpire={() => { loadOrders(); reloadShop(); }}
                    />
                  )}
                  {o.status === 'shipped' && (
                    <p className="note">
                      เมื่อได้รับสินค้าแล้ว กด "ยืนยันรับสินค้า" เพื่อปิดออเดอร์ และจะรีวิวสินค้าได้ทันที
                      {o.autoReceiveAt ? ' (ถ้าไม่กด ระบบจะยืนยันให้อัตโนมัติหลัง ' + fmtDate(o.autoReceiveAt) + ')' : ''}
                    </p>
                  )}
                  {o.status === 'received' && (
                    <p className="note">{o.autoReceived ? 'ระบบยืนยันรับสินค้าให้อัตโนมัติเมื่อ ' : 'ได้รับสินค้าเมื่อ '}{fmtDateTime(o.receivedAt)} · กด "เขียนรีวิว" ใต้สินค้าแต่ละรายการได้เลย</p>
                  )}
                  {o.status === 'received' && (() => {
                    const mine = returns.filter((r) => r.order === o.id);
                    const open = mine.some((r) => r.status === 'pending' || r.status === 'approved');
                    const inWindow = o.returnUntil && new Date(o.returnUntil).getTime() > Date.now();
                    return (
                      <div className="retblock">
                        {mine.map((r) => (
                          <ReturnStatus key={r.id} ret={r}>
                            {r.status === 'pending' && <button className="ghost danger" onClick={() => withdrawReturn(r)}>ยกเลิกคำขอ</button>}
                          </ReturnStatus>
                        ))}
                        {returnFor === o.id ? (
                          <ReturnRequest order={o} onDone={onReturnSent} onCancel={() => setReturnFor(null)} />
                        ) : (
                          !open && inWindow && (
                            <div className="rowact">
                              <button className="ghost" onClick={() => { setReturnFor(o.id); setRetMsg(''); }}>แจ้งคืน/เปลี่ยนสินค้า</button>
                              <span className="meta">แจ้งได้ถึง {fmtDate(o.returnUntil)} (ภายใน {returnDays} วันหลังยืนยันรับสินค้า)</span>
                            </div>
                          )
                        )}
                        {!open && !inWindow && mine.length === 0 && (
                          <p className="meta">เกินกำหนดแจ้งคืนผ่านเว็บแล้ว หากมีปัญหากับสินค้า ติดต่อร้านได้ที่หน้า <Link to="/contact">ติดต่อเรา</Link></p>
                        )}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
