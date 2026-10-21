import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY = { phone: '', lineId: '', email: '', facebook: '', address: '', hours: '', promptpayId: '', promptpayName: '' };
const ShopInfoContext = createContext(null);

// ข้อมูลติดต่อของร้านจากฐานข้อมูล (แอดมินแก้ได้ที่หน้า "ตั้งค่าร้าน")
export function ShopInfoProvider({ children }) {
  const [info, setInfo] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(
    () =>
      api
        .shopInfo()
        .then((d) => setInfo({ ...EMPTY, ...d.info }))
        .catch(() => {})
        .finally(() => setLoaded(true)),
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return <ShopInfoContext.Provider value={{ info, loaded, setInfo, reload }}>{children}</ShopInfoContext.Provider>;
}

export const useShopInfo = () => useContext(ShopInfoContext);
