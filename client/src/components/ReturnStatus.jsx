import { fmtDateTime } from '../data/orders';
import { useI18n } from '../i18n';
import { REASON_LABEL, RESOLUTION_LABEL, RETURN_STATUS } from '../data/returns';

// แสดงรายละเอียดคำขอคืน/เปลี่ยนสินค้าหนึ่งรายการ (ใช้ทั้งหน้าลูกค้าและหน้าแอดมิน)
// children = ปุ่ม/ฟอร์มที่หน้าแม่ใส่เพิ่มด้านล่าง
export default function ReturnStatus({ ret, children }) {
  const { t } = useI18n();
  return (
    <div className="retcard">
      <div className="ord-head">
        <b>{t('คำขอคืน/เปลี่ยนสินค้า')}</b>
        <span className={'status rs-' + ret.status}>{t(RETURN_STATUS[ret.status])}</span>
        <span className="meta">{fmtDateTime(ret.createdAt)}</span>
      </div>
      <ul className="retlist">
        {ret.items.map((i) => <li key={i.product}>{i.name} × {i.qty}</li>)}
      </ul>
      <div className="meta">{t('เหตุผล')}: {t(REASON_LABEL[ret.reason])}{ret.detail ? ' · ' + ret.detail : ''}</div>
      {ret.photos.length > 0 && (
        <ul className="retthumbs" aria-label={t('รูปหลักฐาน')}>
          {ret.photos.map((u, i) => (
            <li key={u}>
              <a href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={t('รูปหลักฐานที่ {n}', { n: i + 1 })} loading="lazy" /></a>
            </li>
          ))}
        </ul>
      )}
      {ret.status === 'approved' && (
        <p className="note">
          {t('ร้านอนุมัติแล้ว วิธีดำเนินการ')}: {RESOLUTION_LABEL[ret.resolution] ? t(RESOLUTION_LABEL[ret.resolution]) : '-'}
          {ret.completedAt ? ' · ' + t('ดำเนินการเสร็จแล้ว') + ' ' + fmtDateTime(ret.completedAt) : ' · ' + t('ร้านกำลังดำเนินการ')}
        </p>
      )}
      {ret.adminNote && <p className="note">{t('ข้อความจากร้าน')}: {ret.adminNote}</p>}
      {children}
    </div>
  );
}
