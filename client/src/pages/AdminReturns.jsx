import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import ReturnStatus from '../components/ReturnStatus';
import { RESOLUTIONS, RETURN_STATUS } from '../data/returns';

const FILTERS = [['', 'ทั้งหมด'], ['pending', 'รอตรวจสอบ'], ['approved', 'อนุมัติแล้ว'], ['rejected', 'ไม่อนุมัติ'], ['withdrawn', 'ลูกค้ายกเลิก']];

// หน้าแอดมิน: ตรวจคำขอคืน/เปลี่ยนสินค้า ดูรูปหลักฐาน แล้วอนุมัติหรือไม่อนุมัติ
export default function AdminReturns() {
  const [status, setStatus] = useState('pending');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({}); // id -> { resolution, note }

  const load = useCallback(() => {
    setLoading(true);
    return api.admin
      .returns(status)
      .then((d) => {
        setList(d.returns);
        setErr(null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const f = (id) => form[id] || { resolution: '', note: '' };
  const setF = (id, patch) => setForm({ ...form, [id]: { ...f(id), ...patch } });

  const act = async (r, body) => {
    setBusyId(r.id);
    setErr(null);
    try {
      const d = await api.admin.reviewReturn(r.id, body);
      // ถ้ากรองสถานะอยู่และคำขอย้ายไปสถานะอื่นแล้ว ให้หายจากรายการนี้
      setList((l) => l.flatMap((x) => (x.id !== r.id ? [x] : status && d.return.status !== status ? [] : [d.return])));
      window.dispatchEvent(new Event('returns-changed')); // ให้ตัวเลขบนแท็บอัปเดต
    } catch (ex) {
      setErr(ex.message);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const approve = (r) => act(r, { status: 'approved', resolution: f(r.id).resolution, adminNote: f(r.id).note });
  const reject = (r) => act(r, { status: 'rejected', adminNote: f(r.id).note });

  return (
    <>
      <div className="dfilters">
        <div className="chips" role="group" aria-label="กรองตามสถานะ">
          {FILTERS.map(([id, label]) => (
            <button key={id} aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>
          ))}
        </div>
        <button className="ghost" onClick={load} disabled={loading}>{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</button>
      </div>

      {err && <div className="err" role="alert">{err}</div>}
      {!loading && list.length === 0 && !err && <p className="note">ไม่มีคำขอ{status ? 'ในสถานะ "' + RETURN_STATUS[status] + '"' : ''}</p>}

      <ul className="ordlist">
        {list.map((r) => {
          const busy = busyId === r.id;
          return (
            <li key={r.id} className="ord panel">
              <div className="ord-head">
                <b className="num">{r.orderNo}</b>
                {r.customer && <span className="meta">ลูกค้า: {r.customer.name} ({r.customer.email})</span>}
              </div>
              <ReturnStatus ret={r}>
                {r.status === 'pending' && (
                  <div className="retreview">
                    <label htmlFor={'rr-' + r.id}>วิธีดำเนินการ (ถ้าอนุมัติ)
                      <select id={'rr-' + r.id} value={f(r.id).resolution} onChange={(e) => setF(r.id, { resolution: e.target.value })}>
                        <option value="">เลือกวิธีดำเนินการ</option>
                        {RESOLUTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </label>
                    <label htmlFor={'rn-' + r.id}>ข้อความถึงลูกค้า (จำเป็นถ้าไม่อนุมัติ)
                      <textarea id={'rn-' + r.id} rows={2} maxLength={500} value={f(r.id).note} onChange={(e) => setF(r.id, { note: e.target.value })} />
                    </label>
                    <div className="actions">
                      <button className="submit" disabled={busy} onClick={() => approve(r)}>อนุมัติ</button>
                      <button className="ghost danger" disabled={busy} onClick={() => reject(r)}>ไม่อนุมัติ</button>
                    </div>
                  </div>
                )}
                {r.status === 'approved' && !r.completedAt && (
                  <div className="actions">
                    <button className="submit" disabled={busy} onClick={() => act(r, { completed: true })}>ดำเนินการเสร็จแล้ว (คืนเงิน/ส่งของใหม่แล้ว)</button>
                  </div>
                )}
              </ReturnStatus>
            </li>
          );
        })}
      </ul>
      <p className="note">ระบบไม่คืนเงินหรือคืนสต็อกให้อัตโนมัติ ร้านโอนเงินคืนหรือส่งของใหม่เอง แล้วกด "ดำเนินการเสร็จแล้ว" และถ้าสินค้าที่ส่งคืนยังขายได้ ให้ปรับสต็อกที่หน้า "สินค้า"</p>
    </>
  );
}
