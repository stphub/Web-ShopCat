import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตอนเปิดเว็บ ถามเซิร์ฟเวอร์ว่ามีใครล็อกอินค้างอยู่ไหม
  useEffect(() => {
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api.login({ email, password });
    setUser(d.user);
  }, []);

  const register = useCallback(async (name, email, password, secQ, secA) => {
    const d = await api.register({ name, email, password, secQ, secA });
    setUser(d.user);
  }, []);

  // credential คือ ID token ที่ได้จากปุ่ม Google
  const loginWithGoogle = useCallback(async (credential) => {
    const d = await api.google(credential);
    setUser(d.user);
  }, []);

  // ตั้งรหัสผ่านใหม่จากลิงก์อีเมล สำเร็จแล้วเซิร์ฟเวอร์ล็อกอินให้เลย
  const resetPassword = useCallback(async (token, password) => {
    const d = await api.reset(token, password);
    setUser(d.user);
  }, []);

  // กู้รหัสผ่านด้วยคำตอบความปลอดภัย สำเร็จแล้วเซิร์ฟเวอร์ล็อกอินให้เลย
  const resetByAnswer = useCallback(async (email, answer, password) => {
    const d = await api.resetByAnswer({ email, answer, password });
    setUser(d.user);
  }, []);

  // อัปเดตข้อมูลผู้ใช้ในหน้าเว็บ (เช่นหลังตั้งคำถามความปลอดภัย)
  const refreshMe = useCallback(async () => {
    const d = await api.me();
    setUser(d.user);
  }, []);

  // ใส่ข้อมูลผู้ใช้ที่เซิร์ฟเวอร์ตอบกลับมาหลังแก้โปรไฟล์
  const updateUser = useCallback((u) => setUser(u), []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, resetPassword, resetByAnswer, refreshMe, updateUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
