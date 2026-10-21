import { Link } from 'react-router-dom';
import Logo from './Logo';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';

// แถบหัวหน้าแบบเรียบ ใช้กับหน้าบัญชีของฉัน
export default function PageBar({ title }) {
  const { user, logout } = useAuth();
  return (
    <header className="pagebar">
      <Link className="brand" to="/" style={{ margin: 0 }}><Logo /><span>{title}</span></Link>
      <div className="acct">
        {user && <Avatar user={user} size={28} />}
        {user && <span className="who">{user.nickname || user.name}</span>}
        <Link to="/">กลับหน้าร้าน</Link>
        {user && <button onClick={logout}>ออกจากระบบ</button>}
      </div>
    </header>
  );
}
