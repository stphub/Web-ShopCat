import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts } from './ProductsContext';
import { useAuth } from './AuthContext';
import { GUEST, dropLegacyCart, readCart, switchOwner, writeCart } from '../utils/cartStorage';

const CartContext = createContext(null);
const NONE = {}; // ตะกร้าว่างที่ใช้ระหว่างรอสลับเจ้าของ (ไม่แก้ค่านี้)

export function CartProvider({ children }) {
  const { byId, shipping: shipCfg } = useProducts();
  const { user, loading: authLoading } = useAuth();

  // เจ้าของตะกร้าตอนนี้: รหัสผู้ใช้ที่ล็อกอิน หรือ 'guest' ถ้ายังไม่ล็อกอิน (null = ยังไม่รู้ว่าใครล็อกอินอยู่)
  const owner = authLoading ? null : user ? user.id : GUEST;

  // state เก็บตะกร้าพร้อมบอกว่าเป็นของใคร กันไม่ให้ตะกร้าของคนก่อนหน้าโผล่หรือถูกเขียนทับให้คนใหม่
  const [state, setState] = useState({ owner: null, items: NONE });
  const items = state.owner === owner && owner !== null ? state.items : NONE;

  // ทิ้งตะกร้ารุ่นเก่าที่ทุกบัญชีใช้ร่วมกัน (ครั้งเดียวตอนเปิดเว็บ)
  useEffect(() => {
    dropLegacyCart();
  }, []);

  // เปลี่ยนคนล็อกอิน/ออกจากระบบ: โหลดตะกร้าของเจ้าของใหม่
  // ถ้าเพิ่งล็อกอิน ของที่หยิบไว้ตอนยังไม่ล็อกอินจะรวมเข้าตะกร้าของบัญชีนั้น
  useEffect(() => {
    if (owner === null) return;
    setState({ owner, items: switchOwner(owner) });
  }, [owner]);

  // บันทึกลงเบราว์เซอร์ เฉพาะเมื่อตะกร้าที่ถืออยู่เป็นของเจ้าของปัจจุบันจริง
  useEffect(() => {
    if (state.owner !== null && state.owner === owner) writeCart(state.owner, state.items);
  }, [state, owner]);

  // แก้ตะกร้า: ทำได้เฉพาะตะกร้าของเจ้าของปัจจุบัน
  const update = (fn) =>
    setState((cur) => (cur.owner === owner && owner !== null ? { owner, items: fn(cur.items) } : cur));

  const change = (id, delta) =>
    update((cur) => {
      const p = byId[id];
      const cap = p ? Math.min(20, p.stock) : 20; // ไม่ให้เกินสต็อก
      const q = Math.min((cur[id] || 0) + delta, cap);
      const next = { ...cur };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

  const remove = (id) =>
    update((cur) => {
      const next = { ...cur };
      delete next[id];
      return next;
    });

  const clear = () => update(() => ({}));

  const summary = useMemo(() => {
    const lines = Object.keys(items)
      .map((id) => ({ product: byId[id], qty: items[id] }))
      .filter((l) => l.product)
      .map((l) => ({ ...l, over: l.qty > l.product.stock })); // จำนวนในตะกร้าเกินสต็อกที่เหลือ
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
    const shipping = subtotal === 0 || subtotal >= shipCfg.freeFrom ? 0 : shipCfg.fee;
    const hasProblem = lines.some((l) => l.over);
    return { lines, count, subtotal, shipping, total: subtotal + shipping, freeFrom: shipCfg.freeFrom, hasProblem };
  }, [items, byId, shipCfg]);

  return <CartContext.Provider value={{ ...summary, change, remove, clear }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
