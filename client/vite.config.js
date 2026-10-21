import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ตอน dev: เปิดหน้าเว็บที่พอร์ต 5173 และส่งคำขอ /api ต่อไปยังเซิร์ฟเวอร์ Express ที่พอร์ต 3000
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
