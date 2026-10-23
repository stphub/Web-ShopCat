import { Link } from 'react-router-dom';
import Logo from './Logo';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { LangSwitch, useI18n } from '../i18n';

// แถบหัวหน้าแบบเรียบ ใช้กับหน้าบัญชีของฉัน
export default function PageBar({ title }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  return (
    <header className="pagebar">
      <Link className="brand" to="/" style={{ margin: 0 }}><Logo /><span>{title}</span></Link>
      <div className="acct">
        {user && <Avatar user={user} size={28} />}
        {user && <span className="who">{user.nickname || user.name}</span>}
        <LangSwitch />
        <Link to="/">{t('กลับหน้าร้าน')}</Link>
        {user && <button onClick={logout}>{t('ออกจากระบบ')}</button>}
      </div>
    </header>
  );
}
