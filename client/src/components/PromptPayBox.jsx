import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../api';
import { baht } from '../data/products';
import { fmtDateTime } from '../data/orders';
import { ACCEPT_ATTR, prepareImage } from '../utils/image';
import { promptPayPayload } from '../utils/promptpay';
import { useShopInfo } from '../context/ShopInfoContext';
import { useI18n } from '../i18n';

// ชำระเงินออเดอร์ที่รอชำระ: QR PromptPay พร้อมยอดเงิน + แนบสลิปให้ร้านตรวจ
// order = ออเดอร์ (status 'pending') onChange(order) แจ้งหน้าแม่เมื่อแนบสลิปสำเร็จ
function mmss(sec) {
  const s = Math.max(0, sec);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// onExpire() ถูกเรียกเมื่อนับถอยหลังถึง 0 ให้หน้าแม่โหลดออเดอร์ใหม่ (เซิร์ฟเวอร์ยกเลิกให้แล้ว)
export default function PromptPayBox({ order, onChange, onExpire }) {
  const { t } = useI18n();
  const { info } = useShopInfo();
  const payload = promptPayPayload(info.promptpayId, order.total);
  const [qr, setQr] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const file = useRef(null);

  // นับถอยหลังจากเวลาที่เหลือที่เซิร์ฟเวอร์บอก (ไม่พึ่งนาฬิกาเครื่องลูกค้า) หยุดนับเมื่อแนบสลิปแล้ว
  const deadline = useMemo(
    () => (order.payRemainingSec === null || order.payRemainingSec === undefined ? null : Date.now() + order.payRemainingSec * 1000),
    [order.id, order.payRemainingSec] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [left, setLeft] = useState(order.payRemainingSec);
  const expired = useRef(false);
  useEffect(() => {
    expired.current = false;
    if (deadline === null) {
      setLeft(null);
      return undefined;
    }
    const tick = () => {
      const s = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(s);
      if (s <= 0 && !expired.current) {
        expired.current = true;
        if (onExpire) setTimeout(onExpire, 800);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    if (!payload) {
      setQr('');
      return undefined;
    }
    QRCode.toDataURL(payload, { margin: 1, width: 240, errorCorrectionLevel: 'M' })
      .then((u) => alive && setQr(u))
      .catch(() => alive && setQr(''));
    return () => {
      alive = false;
    };
  }, [payload]);

  const pick = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setErr(null);
    setBusy(true);
    try {
      const blob = await prepareImage(f);
      const d = await api.orders.uploadSlip(order.id, blob);
      onChange(d.order);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="paybox">
      {payload ? (
        <>
          <div className="payhead">
            <span className="paylogo">PromptPay</span>
            <span className="meta">{t('สแกนด้วยแอปธนาคารใดก็ได้')}</span>
          </div>
          {left !== null && (
            <div className={'paytimer' + (left <= 60 ? ' urgent' : '')} role="timer" aria-live="off">
              {left > 0 ? <>{t('กรุณาชำระภายใน')} <b className="num">{mmss(left)}</b> {t('นาที')}</> : t('หมดเวลาชำระเงิน กำลังยกเลิกออเดอร์...')}
            </div>
          )}
          <div className="payamount">
            <span>{t('ยอดที่ต้องโอน')}</span>
            <b className="num">{baht(order.total)}</b>
          </div>
          <div className="payqrcard">
            {qr ? <img src={qr} width="200" height="200" alt={t('QR PromptPay ยอด {total}', { total: baht(order.total) })} /> : <div className="qrph">{t('กำลังสร้าง QR...')}</div>}
          </div>
          {info.promptpayName && (
            <div className="payname"><span>{t('ชื่อบัญชีผู้รับ')}</span><b>{info.promptpayName}</b></div>
          )}
          <ol className="paysteps">
            <li>{t('เปิดแอปธนาคาร แล้วสแกน QR ด้านบน (ใส่ยอดให้แล้ว)')}</li>
            <li>{t('ตรวจชื่อบัญชีและยอดให้ตรง แล้วกดโอนเงิน')}</li>
            <li>{t('บันทึกสลิป แล้วกดแนบสลิปด้านล่าง (แนบแล้วระบบหยุดนับเวลา)')}</li>
          </ol>
        </>
      ) : (
        <p className="note">{t('ร้านยังไม่ได้ตั้งค่าช่องทางชำระเงิน กรุณาติดต่อร้านพร้อมแจ้งเลขที่ออเดอร์ {no}', { no: order.orderNo })}</p>
      )}

      {order.slipRejectNote && !order.hasSlip && <div className="err" role="alert">{t('ร้านปฏิเสธสลิปก่อนหน้า:')} {order.slipRejectNote}</div>}

      {order.hasSlip ? (
        <div className="slipok">
          <a href={'/api/orders/' + order.id + '/slip?v=' + encodeURIComponent(order.slipAt || '')} target="_blank" rel="noopener noreferrer" aria-label={t('เปิดสลิปขนาดเต็ม')}>
            <img src={'/api/orders/' + order.id + '/slip?v=' + encodeURIComponent(order.slipAt || '')} alt={t('สลิปที่แนบ')} />
          </a>
          <div>
            <b>{t('แนบสลิปแล้ว รอร้านตรวจสอบ')}</b>
            <div className="meta">{fmtDateTime(order.slipAt)}<br />{t('ร้านยืนยันแล้วสถานะจะเปลี่ยนเป็น "ชำระเงินแล้ว"')}</div>
            <input ref={file} type="file" accept={ACCEPT_ATTR} hidden onChange={pick} />
            <button type="button" className="ghost" disabled={busy} onClick={() => file.current && file.current.click()}>{busy ? t('กำลังอัปโหลด...') : t('แนบสลิปใหม่')}</button>
          </div>
        </div>
      ) : (
        <>
          <input ref={file} type="file" accept={ACCEPT_ATTR} hidden onChange={pick} />
          <button type="button" className="submit payupload" disabled={busy || left === 0} onClick={() => file.current && file.current.click()}>{busy ? t('กำลังอัปโหลด...') : t('แนบสลิปโอนเงิน')}</button>
        </>
      )}
      {err && <div className="err" role="alert">{err}</div>}
    </div>
  );
}
