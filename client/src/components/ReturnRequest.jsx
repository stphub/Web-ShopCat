import { useEffect, useId, useRef, useState } from 'react';
import { api } from '../api';
import { ACCEPT_ATTR, prepareImage } from '../utils/image';
import { MAX_PHOTOS, REASONS } from '../data/returns';

// ฟอร์มแจ้งคืน/เปลี่ยนสินค้าของออเดอร์ที่รับแล้ว: เลือกสินค้า เหตุผล และแนบรูปหลักฐาน
export default function ReturnRequest({ order, onDone, onCancel }) {
  const uid = useId();
  const [qty, setQty] = useState({}); // productId -> จำนวนที่แจ้ง (0 = ไม่เลือก)
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [photos, setPhotos] = useState([]); // { id, preview }
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null); // { message, field }
  const previews = useRef([]);

  // คืนหน่วยความจำของรูปตัวอย่างตอนปิดฟอร์ม
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const invalid = (k) => (error && error.field === k ? 'true' : undefined);

  const pick = async (e) => {
    const files = [...e.target.files].slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const added = [];
      for (const f of files) {
        const blob = await prepareImage(f);
        const up = await api.returns.uploadPhoto(blob);
        const preview = URL.createObjectURL(blob);
        previews.current.push(preview);
        added.push({ id: up.id, preview });
      }
      setPhotos((p) => [...p, ...added]);
    } catch (ex) {
      setError({ message: ex.message, field: 'photos' });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const items = order.items.filter((i) => qty[i.product] > 0).map((i) => ({ product: i.product, qty: qty[i.product] }));
    if (items.length === 0) return setError({ message: 'กรุณาเลือกสินค้าที่ต้องการแจ้งอย่างน้อย 1 รายการ', field: 'items' });
    if (!reason) return setError({ message: 'กรุณาเลือกเหตุผล', field: 'reason' });
    if (photos.length === 0) return setError({ message: 'กรุณาแนบรูปหลักฐานอย่างน้อย 1 รูป', field: 'photos' });
    setBusy(true);
    try {
      const d = await api.returns.create({ orderId: order.id, items, reason, detail, photos: photos.map((p) => p.id) });
      onDone(d.return);
    } catch (ex) {
      setError({ message: ex.message, field: ex.field });
      setBusy(false);
    }
  };

  return (
    <form className="retform" onSubmit={submit} noValidate>
      <h4>แจ้งคืน/เปลี่ยนสินค้า ออเดอร์ {order.orderNo}</h4>

      <fieldset aria-invalid={invalid('items')}>
        <legend>สินค้าที่มีปัญหา</legend>
        {order.items.map((i) => (
          <label key={i.product} className="retitem">
            <span>{i.name} <span className="meta">(สั่ง {i.qty})</span></span>
            <select value={qty[i.product] || 0} onChange={(e) => setQty({ ...qty, [i.product]: Number(e.target.value) })} aria-label={'จำนวนที่แจ้ง ' + i.name}>
              <option value={0}>ไม่แจ้ง</option>
              {Array.from({ length: i.qty }, (_, k) => k + 1).map((n) => (
                <option key={n} value={n}>{n} ชิ้น</option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>

      <label htmlFor={uid + '-reason'}>เหตุผล
        <select id={uid + '-reason'} value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={invalid('reason')}>
          <option value="">เลือกเหตุผล</option>
          {REASONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>

      <label htmlFor={uid + '-detail'}>รายละเอียด {reason === 'other' ? '' : '(ไม่บังคับ)'}
        <textarea id={uid + '-detail'} rows={3} maxLength={1000} value={detail} onChange={(e) => setDetail(e.target.value)} aria-invalid={invalid('detail')} />
      </label>

      <div className="retphotos" aria-invalid={invalid('photos')}>
        <span className="retlabel">รูปหลักฐาน (1-{MAX_PHOTOS} รูป)</span>
        <ul>
          {photos.map((p) => (
            <li key={p.id}>
              <img src={p.preview} alt="รูปหลักฐานที่แนบ" />
              <button type="button" className="x" onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))} aria-label="เอารูปนี้ออก">&#10005;</button>
            </li>
          ))}
        </ul>
        {photos.length < MAX_PHOTOS && (
          <label className="ghost filebtn">
            {uploading ? 'กำลังอัปโหลด...' : 'เลือกรูป'}
            <input type="file" accept={ACCEPT_ATTR} multiple onChange={pick} disabled={uploading} hidden />
          </label>
        )}
        <span className="hint">ถ่ายให้เห็นสินค้าและกล่องพัสดุ รูปจะถูกย่อให้อัตโนมัติ</span>
      </div>

      {error && <div className="err" role="alert">{error.message}</div>}
      <div className="actions">
        <button className="submit" type="submit" disabled={busy || uploading}>{busy ? 'กำลังส่ง...' : 'ส่งคำขอ'}</button>
        <button type="button" className="ghost" onClick={onCancel} disabled={busy}>ยกเลิก</button>
      </div>
    </form>
  );
}
