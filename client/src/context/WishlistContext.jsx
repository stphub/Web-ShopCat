import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

// รายการโปรดของผู้ใช้ที่ล็อกอินอยู่ (เก็บที่เซิร์ฟเวอร์ ไม่ปนกันระหว่างบัญชี)
// ids = รหัสสินค้า เรียงใหม่สุดก่อน toggle() กดแล้วอัปเดตหน้าจอทันที ถ้าเซิร์ฟเวอร์ปฏิเสธจะย้อนกลับ
export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const uid = user ? user.id : null;
  const [ids, setIds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (!uid) {
      setIds([]);
      return undefined;
    }
    let live = true;
    api.wishlist
      .ids()
      .then((d) => live && setIds(d.ids))
      .catch(() => live && setIds([]));
    return () => {
      live = false;
    };
  }, [uid]);

  const set = useMemo(() => new Set(ids), [ids]);
  const has = useCallback((id) => set.has(id), [set]);

  const toggle = useCallback(
    async (id) => {
      if (!uid) return false;
      const on = set.has(id);
      setError('');
      setIds((l) => (on ? l.filter((x) => x !== id) : [id, ...l]));
      try {
        if (on) await api.wishlist.remove(id);
        else await api.wishlist.add(id);
        return true;
      } catch (e) {
        setIds((l) => (on ? [id, ...l.filter((x) => x !== id)] : l.filter((x) => x !== id)));
        setError(e.message);
        return false;
      }
    },
    [uid, set]
  );

  return <WishlistContext.Provider value={{ ids, has, toggle, error, count: ids.length }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
