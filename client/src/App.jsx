import { Routes, Route, Navigate } from 'react-router-dom';
import Shop from './pages/Shop';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import HelpPage from './pages/HelpPage';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import AdminShell from './components/AdminShell';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminReturns from './pages/AdminReturns';
import AdminMessages from './pages/AdminMessages';
import AdminSettings from './pages/AdminSettings';
import AdminProducts from './pages/AdminProducts';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help/:slug" element={<HelpPage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<AdminShell><AdminDashboard /></AdminShell>} />
      <Route path="/admin/orders" element={<AdminShell><AdminOrders /></AdminShell>} />
      <Route path="/admin/products" element={<AdminShell><AdminProducts /></AdminShell>} />
      <Route path="/admin/messages" element={<AdminShell><AdminMessages /></AdminShell>} />
      <Route path="/admin/returns" element={<AdminShell><AdminReturns /></AdminShell>} />
      <Route path="/admin/settings" element={<AdminShell><AdminSettings /></AdminShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
