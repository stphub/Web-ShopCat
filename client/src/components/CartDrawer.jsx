import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Art from './Art';
import AddressFields from './AddressFields';
import { api } from '../api';
import { baht } from '../data/products';
import { ORDER_STATUS } from '../data/orders';
import PromptPayBox from './PromptPayBox';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';

export default function CartDrawer({ open, onClose }) {
  const cart = useCart();
  const { user } = useAuth();
  const { reload, payMinutes } = useProducts();

  const [step, setStep] = useState('cart'); // cart | checkout | done
  const [addresses, setAddresses] = useState(null); // null = กำลังโหลด
  const [sel, setSel] = useState('new'); // รหัสที่อยู่ที่เลือก หรือ 'new' = กรอกใหม่
  const [form, setForm] = useState({ name: '', tel: '', line: '' });
  const [save, setSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null); // { message, field }
  const [notice, setNotice] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // เปลี่ยนบัญชี/ออกจากระบบ: ล้างทุกอย่างที่ค้างในหน้าชำระเงิน (ชื่อ เบอร์ ที่อยู่ ที่อยู่ที่เลือก ออเดอร์ที่เพิ่งสั่ง)
  // ไม่ให้ข้อมูลของคนก่อนหน้าไปโผล่ให้คนถัดไป
  const uid = user ? user.id : null;
  useEffect(() => {
    setStep('cart');
    setAddresses(null);
    setSel('new');
    setForm({ name: '', tel: '', line: '' });
    setSave(true);
    setErr(null);
    setNotice('');
    setOrder(null);
  }, [uid]);

  // เปิดตะกร้าครั้งใหม่หลังสั่งซื้อเสร็จ ให้เริ่มที่หน้าตะกร้า
  useEffect(() => {
    if (open) setStep((s) => (s === 'done' ? 'cart' : s));
  }, [open]);

  // เข้าหน้าชำระเงิน: โหลดที่อยู่ที่บันทึกไว้ เลือกที่อยู่หลักให้ก่อน
  useEffect(() => {
    if (!(open && step === 'checkout' && user)) return undefined;
    let dead = false;
    setAddresses(null);
    api.addresses
      .list()
      .then((d) => {
        if (dead) return;
        setAddresses(d.addresses);
        const def = d.addresses.find((a) => a.isDefault) || d.addresses[0];
        setSel(def ? def.id : 'new');
      })
      .catch(() => {
        if (dead) return;
        setAddresses([]);
        setSel('new');
      });
    setForm((f) => (f.name ? f : { ...f, name: user.name }));
    return () => {
      dead = true;
    };
  }, [open, step, user]);

  const left = Math.max(0, cart.freeFrom - cart.subtotal);
  const pct = Math.min(100, Math.round((cart.subtotal / cart.freeFrom) * 100));

  const place = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    // ส่งเฉพาะรหัสสินค้ากับจำนวน ราคาและยอดรวมเซิร์ฟเวอร์คิดเอง
    const payload = { items: cart.lines.map((l) => ({ productId: l.product.id, qty: l.qty })) };
    if (sel !== 'new') payload.addressId = sel;
    else {
      payload.address = form;
      payload.saveAddress = save;
    }
    try {
      const d = await api.orders.create(payload);
      cart.clear();
      setOrder(d.order);
      setNotice('');
      setStep('done');
      reload(); // สต็อกเปลี่ยนแล้ว
    } catch (ex) {
      if (ex.code === 'STOCK') {
        reload();
        setNotice(ex.message);
        setStep('cart');
      } else {
        setErr({ message: ex.message, field: ex.field });
      }
    } finally {
      setBusy(false);
    }
  };

  const title = step === 'done' ? 'สั่งซื้อเรียบร้อย' : step === 'checkout' ? 'ข้อมูลจัดส่ง' : 'ตะกร้าของคุณ';

  return (
    <>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' open' : '')} aria-hidden={!open} aria-label="ตะกร้าสินค้า">
        <div className="dhead">
          <h2>{title}</h2>
          <button className="x" onClick={onClose} aria-label="ปิดตะกร้า">&#10005;</button>
        </div>

        {step === 'done' && order && (
          <>
            <div className="dbody">
              <div className="done">
                <span className="donecheck" aria-hidden="true">&#10003;</span>
                <h3>ขอบคุณที่อุดหนุน</h3>
                <p className="doneinfo num">ออเดอร์ <b>{order.orderNo}</b> · {ORDER_STATUS[order.status]}</p>
                {order.status === 'pending' && (
                  <PromptPayBox
                    order={order}
                    onChange={setOrder}
                    onExpire={() => api.orders.mine().then((d) => { const n = d.orders.find((x) => x.id === order.id); if (n) setOrder(n); reload(); }).catch(() => {})}
                  />
                )}
                {order.status === 'cancelled' && (
                  <p className="err" role="alert">
                    ออเดอร์นี้ถูกยกเลิกอัตโนมัติ เพราะไม่ได้ชำระเงินภายใน {payMinutes} นาที สินค้าถูกคืนเข้าสต็อกแล้ว หากยังต้องการสั่ง กรุณาสั่งซื้อใหม่
                  </p>
                )}
                <p className="note">
                  ชำระเงินแล้วแนบสลิปได้ที่นี่ หรือแนบทีหลังที่{' '}
                  <Link to="/account" onClick={onClose}>บัญชีของฉัน</Link>{' '}
                  เมื่อร้านตรวจสลิปและยืนยันแล้ว สถานะจะเปลี่ยนเป็น "ชำระเงินแล้ว"
                </p>
              </div>
            </div>
            <div className="dfoot">
              <button className="go" onClick={() => { setStep('cart'); onClose(); }}>กลับไปเลือกสินค้า</button>
            </div>
          </>
        )}

        {step === 'checkout' && (
          <form onSubmit={place} style={{ display: 'contents' }}>
            <div className="dbody">
              {addresses && addresses.length > 0 && (
                <fieldset className="addrpick">
                  <legend>เลือกที่อยู่จัดส่ง</legend>
                  {addresses.map((a) => (
                    <label key={a.id} className={'addropt' + (sel === a.id ? ' on' : '')}>
                      <input type="radio" name="addr" checked={sel === a.id} onChange={() => setSel(a.id)} />
                      <span>
                        <b>{a.label || a.name}</b>
                        {a.isDefault && <em className="tag">ที่อยู่หลัก</em>}
                        <span className="meta block">{a.name} · {a.tel}</span>
                        <span className="meta block">{a.line}</span>
                      </span>
                    </label>
                  ))}
                  <label className={'addropt' + (sel === 'new' ? ' on' : '')}>
                    <input type="radio" name="addr" checked={sel === 'new'} onChange={() => setSel('new')} />
                    <span><b>ใช้ที่อยู่ใหม่</b></span>
                  </label>
                </fieldset>
              )}
              {addresses === null && <p className="note">กำลังโหลดที่อยู่ที่บันทึกไว้...</p>}

              {sel === 'new' && addresses !== null && (
                <>
                  <AddressFields values={form} onChange={setForm} idPrefix="f" errorField={err && err.field} />
                  <label className="check" htmlFor="f-save">
                    <input id="f-save" type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
                    บันทึกที่อยู่นี้ไว้ใช้ครั้งหน้า
                  </label>
                </>
              )}

              {err && <div className="err" role="alert">{err.message}</div>}
              <p className="note">
                หลังกดยืนยันคำสั่งซื้อ ต้องโอนเงินและแนบสลิปภายใน {payMinutes} นาที ไม่เช่นนั้นระบบจะยกเลิกออเดอร์ให้อัตโนมัติ
              </p>
              <p className="note">
                ยอดที่ต้องชำระ {baht(cart.total)} (สินค้า {baht(cart.subtotal)} ค่าส่ง {cart.shipping ? baht(cart.shipping) : 'ฟรี'})
              </p>
            </div>
            <div className="dfoot">
              <button className="go" type="submit" disabled={busy || addresses === null}>{busy ? 'กำลังสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}</button>
              <button className="rm" type="button" onClick={() => setStep('cart')}>กลับไปแก้ตะกร้า</button>
            </div>
          </form>
        )}

        {step === 'cart' && (
          <>
            <div className="dbody">
              {notice && <div className="err" role="alert">{notice}</div>}
              {cart.lines.length === 0 ? (
                <p className="empty" style={{ padding: '40px 0' }}>ตะกร้ายังว่าง เลือกของให้เจ้านายได้เลย</p>
              ) : (
                <>
                  <div className="ship">
                    {left > 0 ? <>ซื้ออีก <b className="num">{baht(left)}</b> ส่งฟรี</> : 'ส่งฟรีแล้ว'}
                    <div className="meter"><i style={{ width: pct + '%' }} /></div>
                  </div>
                  {cart.lines.map(({ product: p, qty, over }) => (
                    <div className="line" key={p.id}>
                      <Art product={p} />
                      <div>
                        <h3>{p.name}</h3>
                        <div className="qty">
                          <button onClick={() => cart.change(p.id, -1)} aria-label="ลดจำนวน">&minus;</button>
                          <span className="num">{qty}</span>
                          <button onClick={() => cart.change(p.id, 1)} aria-label="เพิ่มจำนวน">+</button>
                        </div>
                        {over && (
                          <div className="linewarn" role="alert">
                            {p.stock > 0 ? `เหลือเพียง ${p.stock} ชิ้น กรุณาลดจำนวน` : 'สินค้าหมด กรุณาลบออกจากตะกร้า'}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="num">{baht(p.price * qty)}</div>
                        <button className="rm" onClick={() => cart.remove(p.id)}>ลบ</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="dfoot">
              <div className="row"><span>ยอดสินค้า</span><span className="num">{baht(cart.subtotal)}</span></div>
              <div className="row"><span>ค่าจัดส่ง</span><span className="num">{cart.subtotal ? (cart.shipping ? baht(cart.shipping) : 'ฟรี') : '-'}</span></div>
              <div className="row total"><span>รวม</span><span className="num">{baht(cart.total)}</span></div>
              {cart.count > 0 && !user && (
                <div className="need-login">
                  กรุณา <Link to="/login" onClick={onClose}>เข้าสู่ระบบ</Link> หรือ <Link to="/register" onClick={onClose}>สมัครสมาชิก</Link> ก่อนสั่งซื้อ
                </div>
              )}
              <button
                className="go"
                disabled={cart.count === 0 || !user || cart.hasProblem}
                onClick={() => { setErr(null); setNotice(''); setStep('checkout'); }}
              >
                ไปหน้าจัดส่ง
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
