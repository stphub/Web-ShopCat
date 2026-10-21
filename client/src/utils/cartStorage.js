// เก็บตะกร้าไว้ในเบราว์เซอร์ แยกตามเจ้าของ: บัญชีผู้ใช้แต่ละคนมีตะกร้าของตัวเอง
// และคนที่ยังไม่ล็อกอินมีตะกร้า "guest" ต่างหาก ไม่ปนกัน
const PREFIX = 'catshop-cart:';
const LEGACY_KEY = 'catshop-cart'; // เวอร์ชันเก่าเก็บตะกร้าเดียวให้ทุกคนใช้ร่วมกัน
const MAX_QTY = 20;

export const GUEST = 'guest';

function getStore() {
  try {
    return window.localStorage;
  } catch {
    return null; // บางเบราว์เซอร์/โหมดส่วนตัวไม่ให้ใช้ ตะกร้าจะอยู่แค่ในหน้านั้น
  }
}

// รับเฉพาะ { รหัสสินค้า: จำนวนเต็ม 1-20 } ข้อมูลอื่นที่ปนมาทิ้งไป
function clean(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const id of Object.keys(raw)) {
    const q = Number(raw[id]);
    if (id && id.length <= 64 && Number.isInteger(q) && q >= 1) out[id] = Math.min(q, MAX_QTY);
  }
  return out;
}

export function readCart(owner, store = getStore()) {
  if (!store) return {};
  try {
    return clean(JSON.parse(store.getItem(PREFIX + owner)));
  } catch {
    return {};
  }
}

export function writeCart(owner, items, store = getStore()) {
  if (!store) return;
  try {
    if (Object.keys(items).length === 0) store.removeItem(PREFIX + owner);
    else store.setItem(PREFIX + owner, JSON.stringify(items));
  } catch {
    /* เก็บไม่ได้ ข้ามไป */
  }
}

// ตะกร้าเดิมที่ใช้ร่วมกันทุกบัญชี ไม่รู้ว่าเป็นของใคร จึงทิ้ง ไม่ให้หลุดไปอยู่ในบัญชีของคนอื่น
export function dropLegacyCart(store = getStore()) {
  if (!store) return;
  try {
    store.removeItem(LEGACY_KEY);
  } catch {
    /* ข้ามไป */
  }
}

// รวมสองตะกร้า (จำนวนบวกกัน ไม่เกิน 20 ต่อรายการ)
export function mergeCarts(base, extra) {
  const out = { ...base };
  for (const id of Object.keys(extra)) out[id] = Math.min(MAX_QTY, (out[id] || 0) + extra[id]);
  return out;
}

// เปลี่ยนเจ้าของตะกร้า: คืนตะกร้าของเจ้าของใหม่ ถ้าเป็นบัญชีผู้ใช้ และมีของในตะกร้า guest
// จะรวมเข้าไปและล้างตะกร้า guest (ซื้อของก่อนล็อกอินแล้วของไม่หาย)
export function switchOwner(owner, store = getStore()) {
  let items = readCart(owner, store);
  if (owner !== GUEST) {
    const guest = readCart(GUEST, store);
    if (Object.keys(guest).length > 0) {
      items = mergeCarts(items, guest);
      writeCart(owner, items, store);
      writeCart(GUEST, {}, store);
    }
  }
  return items;
}
