import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ตอน dev: เปิดหน้าเว็บที่พอร์ต 5173 และส่งคำขอ /api ต่อไปยังเซิร์ฟเวอร์ Express ที่พอร์ต 3000
// Content-Security-Policy ใส่ใน index.html ตอน build เท่านั้น (ตอน dev Vite ต้องใช้สคริปต์ inline จึงไม่ใส่)
// อนุญาตเฉพาะ: สคริปต์/สไตล์ของเว็บเอง, Google Fonts และ Google Sign-In ถ้าเพิ่มบริการภายนอกใหม่ต้องเพิ่มโดเมนที่นี่
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://accounts.google.com",
  "frame-src https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');
const cspPlugin = {
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }],
};

export default defineConfig({
  plugins: [react(), cspPlugin],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
