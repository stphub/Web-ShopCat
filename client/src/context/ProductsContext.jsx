import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { FREE_SHIPPING_FROM, SHIPPING_FEE } from '../data/products';

const ProductsContext = createContext(null);

// ดึงรายการสินค้าจากเซิร์ฟเวอร์ (MongoDB) ครั้งเดียวตอนเปิดเว็บ และดึงใหม่ได้ด้วย reload()
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  // ค่าส่งที่เซิร์ฟเวอร์ใช้คิดเงินจริง (ค่าเริ่มต้นจนกว่าจะโหลดเสร็จ)
  const [shipping, setShipping] = useState({ freeFrom: FREE_SHIPPING_FROM, fee: SHIPPING_FEE });
  const [payMinutes, setPayMinutes] = useState(5); // ต้องชำระภายในกี่นาทีหลังสั่งซื้อ (ค่าจริงมาจากเซิร์ฟเวอร์)
  const [returnDays, setReturnDays] = useState(7); // แจ้งคืนสินค้าได้กี่วันหลังรับของ (ค่าจริงมาจากเซิร์ฟเวอร์)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setError(null);
    return api.products
      .list()
      .then((d) => {
        setProducts(d.products);
        if (d.shipping) setShipping(d.shipping);
        if (d.returnDays) setReturnDays(d.returnDays);
        if (d.payMinutes) setPayMinutes(d.payMinutes);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  return (
    <ProductsContext.Provider value={{ products, byId, shipping, returnDays, payMinutes, loading, error, reload }}>{children}</ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
