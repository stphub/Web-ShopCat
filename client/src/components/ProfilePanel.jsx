import { useRef, useState } from 'react';
import Avatar from './Avatar';
import { api } from '../api';
import { ACCEPT_ATTR, prepareAvatar } from '../utils/image';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

// โปรไฟล์ในหน้าบัญชี: รูปโปรไฟล์ ชื่อเล่น ชื่อ
export default function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname || '');
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [err, setErr] = useState(null); // { message, field }
  const [ok, setOk] = useState('');
  const fileRef = useRef(null);

  const pick = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setErr(null);
    setOk('');
    setImgBusy(true);
    try {
      const blob = await prepareAvatar(f);
      const d = await api.profile.uploadAvatar(blob);
      updateUser(d.user);
      setOk(t('เปลี่ยนรูปโปรไฟล์แล้ว'));
    } catch (ex) {
      setErr({ message: ex.message });
    } finally {
      setImgBusy(false);
    }
  };

  const removeAvatar = async () => {
    setErr(null);
    setOk('');
    setImgBusy(true);
    try {
      const d = await api.profile.removeAvatar();
      updateUser(d.user);
      setOk(t('ลบรูปโปรไฟล์แล้ว'));
    } catch (ex) {
      setErr({ message: ex.message });
    } finally {
      setImgBusy(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk('');
    setBusy(true);
    try {
      const d = await api.profile.save({ name: name.trim(), nickname: nickname.trim() });
      updateUser(d.user);
      setOk(t('บันทึกโปรไฟล์แล้ว'));
    } catch (ex) {
      setErr({ message: ex.message, field: ex.field });
    } finally {
      setBusy(false);
    }
  };

  const bad = (k) => (err && err.field === k ? 'true' : undefined);

  return (
    <section className="panel" aria-labelledby="prof-title">
      <h2 id="prof-title">{t('โปรไฟล์ของฉัน')}</h2>
      <div className="profrow">
        <div className="profpic">
          <Avatar user={user} size={96} />
          <input ref={fileRef} type="file" accept={ACCEPT_ATTR} hidden onChange={pick} />
          <div className="profbtns">
            <button type="button" className="ghost" disabled={imgBusy} onClick={() => fileRef.current && fileRef.current.click()}>{imgBusy ? t('กำลังอัปโหลด...') : t('เปลี่ยนรูป')}</button>
            {user.hasAvatar && <button type="button" className="ghost danger" disabled={imgBusy} onClick={removeAvatar}>{t('ลบรูป')}</button>}
          </div>
        </div>
        <form className="sqform" onSubmit={save} noValidate>
          {err && <div className="err" role="alert">{err.message}</div>}
          <label htmlFor="prof-nick">{t('ชื่อเล่น')}
            <input id="prof-nick" type="text" maxLength={30} value={nickname} onChange={(e) => setNickname(e.target.value)} aria-invalid={bad('nickname')} placeholder={t('เช่น ส้ม (แสดงแทนชื่อจริงบนหน้าเว็บ)')} />
          </label>
          <label htmlFor="prof-name">{t('ชื่อ')}
            <input id="prof-name" type="text" maxLength={80} required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={bad('name')} />
          </label>
          <div className="meta">{t('อีเมล')}: {user.email}</div>
          {ok && <p className="okmsg" role="status">{ok}</p>}
          <div className="actions"><button className="submit" type="submit" disabled={busy}>{busy ? t('กำลังบันทึก...') : t('บันทึกโปรไฟล์')}</button></div>
        </form>
      </div>
    </section>
  );
}
