import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { api } from '../api';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

// โครงหน้าแอดมิน: ตรวจสิทธิ์ แถบบน และแท็บเมนู (แดชบอร์ด / ออเดอร์ / สินค้า)
export default function AdminShell({ children }) {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const [pendingReturns, setPendingReturns] = useState(0);
  const isAdmin = !!user && user.role === 'admin';

  // ตัวเลขคำขอคืนสินค้าที่รอตรวจ แสดงบนแท็บ (อัปเดตเมื่อเปลี่ยนหน้า หรือหน้าคำขอคืนแจ้งว่ามีการเปลี่ยน)
  useEffect(() => {
    if (!isAdmin) return undefined;
    const refresh = () => api.admin.returnsSummary().then((d) => setPendingReturns(d.pending)).catch(() => {});
    refresh();
    window.addEventListener('returns-changed', refresh);
    return () => window.removeEventListener('returns-changed', refresh);
  }, [isAdmin, pathname]);

  if (loading) return <div className="authwrap"><p className="sub">กำลังโหลด...</p></div>;

  if (!user || user.role !== 'admin') {
    return (
      <div className="authwrap">
        <main className="box">
          <Link className="brand" to="/"><Logo /><span>ของแมวเหมียว</span></Link>
          <h1>เฉพาะแอดมิน</h1>
          <p className="sub">
            {user
              ? 'บัญชีนี้ยังไม่มีสิทธิ์แอดมิน ตั้งสิทธิ์ด้วยคำสั่ง npm run make-admin ในเครื่องที่รันเซิร์ฟเวอร์'
              : 'กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินก่อน'}
          </p>
          {!user && <Link className="submit" style={{ textAlign: 'center', textDecoration: 'none' }} to="/login">เข้าสู่ระบบ</Link>}
        </main>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="adminbar">
        <Link className="brand" to="/" style={{ margin: 0 }}><Logo /><span>จัดการร้าน</span></Link>
        <div className="acct">
          <span className="who">{user.nickname || user.name}</span>
          <Link to="/">ดูหน้าร้าน</Link>
          <button onClick={logout}>ออกจากระบบ</button>
        </div>
      </header>
      <nav className="admintabs wrap" aria-label="เมนูแอดมิน">
        <NavLink to="/admin" end>แดชบอร์ด</NavLink>
        <NavLink to="/admin/orders">ออเดอร์</NavLink>
        <NavLink to="/admin/products">สินค้า</NavLink>
        <NavLink to="/admin/returns">คำขอคืนสินค้า{pendingReturns > 0 && <b className="tabbadge" aria-label={pendingReturns + ' รายการรอตรวจ'}>{pendingReturns}</b>}</NavLink>
        <NavLink to="/admin/settings">ตั้งค่าร้าน</NavLink>
      </nav>
      <main className="wrap adminmain">{children}</main>
    </div>
  );
}
