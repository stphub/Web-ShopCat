import { useId, useRef, useState } from 'react';
import { api } from '../api';
import { ACCEPT_ATTR, prepareImage } from '../utils/image';

export const MAX_REVIEW_PHOTOS = 3;

// เลือก/ลบรูปแนบรีวิว (ย่อรูปในเบราว์เซอร์แล้วอัปโหลดทันที ได้รหัสรูปไว้ส่งพร้อมรีวิว)
export default function ReviewPhotoPicker({ photos, onChange, disabled }) {
  const uid = useId();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const pick = async (e) => {
    const files = [...e.target.files].slice(0, MAX_REVIEW_PHOTOS - photos.length);
    e.target.value = '';
    if (!files.length) return;
    setErr(null);
    setBusy(true);
    const added = [];
    try {
      for (const f of files) {
        const blob = await prepareImage(f);
        const d = await api.reviews.uploadPhoto(blob);
        added.push({ id: d.id, url: d.url });
      }
    } catch (ex) {
      setErr(ex.message);
    } finally {
      if (added.length) onChange([...photos, ...added]);
      setBusy(false);
    }
  };

  return (
    <div className="rvphotos">
      <span className="rv-label" id={uid}>รูปประกอบ (ไม่บังคับ ไม่เกิน {MAX_REVIEW_PHOTOS} รูป)</span>
      <ul className="rvthumbs" aria-labelledby={uid}>
        {photos.map((p) => (
          <li key={p.id}>
            <img src={p.url} alt="รูปที่แนบ" />
            <button type="button" className="x" aria-label="เอารูปนี้ออก" disabled={disabled || busy} onClick={() => onChange(photos.filter((x) => x.id !== p.id))}>&#10005;</button>
          </li>
        ))}
        {photos.length < MAX_REVIEW_PHOTOS && (
          <li>
            <input ref={input} type="file" accept={ACCEPT_ATTR} multiple hidden onChange={pick} />
            <button type="button" className="addphoto" disabled={disabled || busy} onClick={() => input.current && input.current.click()}>
              {busy ? 'กำลังอัปโหลด...' : '+ เพิ่มรูป'}
            </button>
          </li>
        )}
      </ul>
      {err && <div className="err" role="alert">{err}</div>}
    </div>
  );
}
