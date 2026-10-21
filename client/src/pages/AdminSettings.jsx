import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useShopInfo } from '../context/ShopInfoContext';

const FIELDS = [
  ['phone', 'เบอร์โทร', 'เช่น 081-234-5678', 'tel'],
  ['lineId', 'LINE ID', 'เช่น @catshop (ใส่ @ ด้วยถ้าเป็น LINE Official)', 'text'],
  ['email', 'อีเมลร้าน', 'เช่น hello@example.com (ข้อความจากหน้าติดต่อเรา จะส่งมาที่นี่)', 'email'],
  ['facebook', 'ลิงก์ Facebook', 'เช่น https://facebook.com/yourpage', 'url'],
];

// หน้าตั้งค่าร้าน: ข้อมูลติดต่อที่แสดงในหน้า "ติดต่อเรา" ช่องที่เว้นว่างจะไม่แสดง
export default function AdminSettings() {
  const { info, loaded, setInfo } = useShopInfo();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null); // { message, field }
  const [ok, setOk] = useState('');

  // เริ่มฟอร์มจากข้อมูลที่โหลดมาแล้ว (ครั้งเดียว)
  useEffect(() => {
    if (loaded && form === null) setForm(info);
  }, [loaded, info, form]);

  if (!form) return <p className="note">กำลังโหลด...</p>;

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setOk('');
  };
  const invalid = (k) => (error && error.field === k ? 'true' : undefined);

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setOk('');
    setBusy(true);
    try {
      const d = await api.admin.saveShopInfo(form);
      setInfo(d.info);
      setForm(d.info);
      setOk('บันทึกแล้ว หน้า "ติดต่อเรา" อัปเดตทันที');
    } catch (ex) {
      setError({ message: ex.message, field: ex.field });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="set-title">
      <h2 id="set-title">ข้อมูลติดต่อของร้าน</h2>
      <p className="note">แสดงในหน้า <Link to="/contact">ติดต่อเรา</Link> ช่องที่เว้นว่างจะไม่แสดง (เช่น ไม่ใส่ LINE ปุ่ม LINE ก็จะไม่ขึ้น)</p>
      <form className="settingsform" onSubmit={save} noValidate>
        {FIELDS.map(([k, label, hint, type]) => (
          <label key={k} htmlFor={'s-' + k}>
            {label}
            <input id={'s-' + k} type={type} maxLength={k === 'facebook' ? 300 : 254} value={form[k]} onChange={set(k)} aria-invalid={invalid(k)} />
            <span className="hint">{hint}</span>
          </label>
        ))}
        <label htmlFor="s-address">ที่อยู่ร้าน
          <textarea id="s-address" rows={3} maxLength={400} value={form.address} onChange={set('address')} aria-invalid={invalid('address')} />
        </label>
        <label htmlFor="s-hours">เวลาทำการ
          <textarea id="s-hours" rows={2} maxLength={200} value={form.hours} onChange={set('hours')} aria-invalid={invalid('hours')} />
          <span className="hint">เช่น จันทร์-ศุกร์ 9:00-18:00 น. (ขึ้นบรรทัดใหม่ได้)</span>
        </label>
        <h3 className="setsub">รับเงินผ่าน PromptPay</h3>
        <label htmlFor="s-promptpayId">เลข PromptPay
          <input id="s-promptpayId" type="text" inputMode="numeric" maxLength={20} value={form.promptpayId} onChange={set('promptpayId')} aria-invalid={invalid('promptpayId')} />
          <span className="hint">เบอร์โทร 10 หลัก, เลขบัตรประชาชน/ภาษี 13 หลัก หรือ e-Wallet 15 หลัก (ใส่ขีดได้) เว้นว่าง = ไม่แสดง QR ให้ลูกค้า</span>
        </label>
        <label htmlFor="s-promptpayName">ชื่อบัญชีที่แสดงให้ลูกค้าเช็ก
          <input id="s-promptpayName" type="text" maxLength={80} value={form.promptpayName} onChange={set('promptpayName')} aria-invalid={invalid('promptpayName')} />
          <span className="hint">เช่น ร้านของแมวเหมียว (ลูกค้าจะเทียบกับชื่อที่แอปธนาคารขึ้นตอนสแกน)</span>
        </label>
        {error && <div className="err" role="alert">{error.message}</div>}
        {ok && <p className="okmsg" role="status">{ok}</p>}
        <div className="actions">
          <button className="submit" type="submit" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </section>
  );
}
