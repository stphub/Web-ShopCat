// ค่าตั้งของร้านที่ฝั่งเซิร์ฟเวอร์ใช้คิดเงินจริง (หน้าเว็บอ่านค่าเดียวกันจาก GET /api/products)
module.exports = {
  FREE_SHIPPING_FROM: 499, // ซื้อครบเท่านี้ส่งฟรี (บาท)
  SHIPPING_FEE: 40, // ค่าส่งเมื่อไม่ถึงยอดส่งฟรี (บาท)
  LOW_STOCK: 5, // สต็อกเท่านี้หรือน้อยกว่าถือว่าใกล้หมด
  MAX_QTY: 20, // สั่งได้สูงสุดต่อสินค้าต่อออเดอร์
  MAX_ADDRESSES: 10, // จำนวนที่อยู่ที่บันทึกได้ต่อบัญชี
  // จัดส่งแล้วเกินกี่วัน ถ้าลูกค้าไม่กดยืนยัน ระบบจะยืนยันรับสินค้าให้เอง (ตั้งใน .env ด้วย AUTO_RECEIVE_DAYS)
  AUTO_RECEIVE_DAYS: Math.max(1, Math.floor(Number(process.env.AUTO_RECEIVE_DAYS)) || 7),
  // ลูกค้าแจ้งคืน/เปลี่ยนสินค้าได้กี่วันหลังกดยืนยันรับสินค้า (ตั้งใน .env ด้วย RETURN_WINDOW_DAYS)
  RETURN_WINDOW_DAYS: Math.max(1, Math.floor(Number(process.env.RETURN_WINDOW_DAYS)) || 7),
  MAX_GALLERY: 5, // รูปเพิ่มเติมต่อสินค้า (นอกจากรูปหลัก รวมเป็น 6 รูป)
  MAX_WISHLIST: 200, // จำนวนรายการโปรดสูงสุดต่อบัญชี
  MAX_RETURN_PHOTOS: 4, // รูปหลักฐานต่อคำขอ
  MAX_RETURNS_PER_ORDER: 3, // จำนวนคำขอสูงสุดต่อออเดอร์ (รวมที่ถูกปฏิเสธ)
  // ออเดอร์ที่ยังไม่แนบสลิปต้องชำระภายในกี่นาที ไม่งั้นยกเลิกอัตโนมัติและคืนสต็อก (ตั้งใน .env ด้วย PAY_WINDOW_MINUTES)
  PAY_WINDOW_MINUTES: Math.max(1, Math.floor(Number(process.env.PAY_WINDOW_MINUTES)) || 5),
  RESET_TOKEN_MINUTES: 60, // ลิงก์รีเซ็ตรหัสผ่านใช้ได้กี่นาที
};
