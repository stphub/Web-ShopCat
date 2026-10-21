// ย่อรูปในเบราว์เซอร์ก่อนอัปโหลด: ด้านยาวสุดไม่เกิน 900 พิกเซล แล้วบันทึกเป็น JPEG
// (รูปจากมือถือหลาย MB จะเหลือราว 100-200 KB โหลดหน้าร้านเร็วและไม่เปลืองพื้นที่ฐานข้อมูล)
const MAX_SIDE = 900;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_INPUT_BYTES = 15 * 1024 * 1024; // รูปต้นฉบับใหญ่สุดที่ยอมให้เลือก

export const ACCEPT_ATTR = ACCEPT.join(',');

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('เปิดไฟล์รูปนี้ไม่ได้ ลองใช้ไฟล์ JPG, PNG หรือ WebP'));
    };
    img.src = url;
  });
}

export async function prepareImage(file) {
  if (!ACCEPT.includes(file.type)) throw new Error('เลือกได้เฉพาะไฟล์ JPG, PNG หรือ WebP');
  if (file.size > MAX_INPUT_BYTES) throw new Error('ไฟล์ใหญ่เกิน 15 MB ลองเลือกรูปที่เล็กลง');

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // รูปโปร่งใสจะได้พื้นขาว (JPEG ไม่มีความโปร่งใส)
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('ย่อรูปไม่สำเร็จ ลองรูปอื่น');
  return blob;
}

// รูปโปรไฟล์: ตัดเป็นจัตุรัสจากกลางภาพ ย่อเหลือ 256 พิกเซล แล้วบันทึกเป็น JPEG (ราว 20-50 KB)
export async function prepareAvatar(file) {
  if (!ACCEPT.includes(file.type)) throw new Error('เลือกได้เฉพาะไฟล์ JPG, PNG หรือ WebP');
  if (file.size > MAX_INPUT_BYTES) throw new Error('ไฟล์ใหญ่เกิน 15 MB ลองเลือกรูปที่เล็กลง');
  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, 256, 256);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('ย่อรูปไม่สำเร็จ ลองรูปอื่น');
  return blob;
}
