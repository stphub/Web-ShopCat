// พจนานุกรมไทย → อังกฤษ (server): คีย์คือข้อความไทยเดิมทุกตัวอักษร
// ข้อความที่เซิร์ฟเวอร์ประกอบตัวเลข/ชื่อเข้าไป ใช้ {ตัวแปร} แทนส่วนที่เปลี่ยน (ดู getPatterns ใน ../index.jsx)
export default {
  "เปิดไฟล์รูปนี้ไม่ได้ ลองใช้ไฟล์ JPG, PNG หรือ WebP": "Could not open this image. Try a JPG, PNG or WebP file.",
  "เลือกได้เฉพาะไฟล์ JPG, PNG หรือ WebP": "Only JPG, PNG or WebP files are allowed",
  "ไฟล์ใหญ่เกิน 15 MB ลองเลือกรูปที่เล็กลง": "The file is over 15 MB. Try a smaller image.",
  "ย่อรูปไม่สำเร็จ ลองรูปอื่น": "Could not resize the image. Try another one.",
  // ---- ทั่วไป ----
  'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง': 'Something went wrong on our side. Please try again.',
  'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์': 'Something went wrong on our side.',
  'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง': 'Something went wrong. Please try again.',
  'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง': 'Could not connect to the server. Please try again.',
  'กรุณาเข้าสู่ระบบ': 'Please log in.',
  'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่': 'Your session has expired. Please log in again.',
  'ต้องเป็นแอดมินเท่านั้น': 'Admins only.',
  'ไม่พบสินค้า': 'Product not found.',
  'ไม่พบสินค้านี้': 'Product not found.',
  'ไม่พบออเดอร์': 'Order not found.',
  'ไม่พบรีวิว': 'Review not found.',
  'ไม่พบคำขอ': 'Request not found.',
  'ไม่พบข้อความ': 'Message not found.',
  'ไม่พบที่อยู่': 'Address not found.',
  'ไม่พบรูป': 'Image not found.',
  'สถานะไม่ถูกต้อง': 'Invalid status.',
  'ลูกค้า': 'Customer',
  'สินค้าที่ถูกลบแล้ว': 'Deleted product',

  // ---- ข้อจำกัดความถี่ ----
  'ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many attempts. Please wait a moment and try again.',
  'ขอรีเซ็ตรหัสผ่านหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many password reset requests. Please wait a moment and try again.',
  'แนบสลิปถี่เกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many slip uploads. Please wait a moment and try again.',
  'สั่งซื้อถี่เกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many orders in a short time. Please wait a moment and try again.',
  'อัปโหลดรูปถี่เกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many image uploads. Please wait a moment and try again.',
  'ส่งข้อความหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many messages sent. Please wait a moment and try again.',
  'แก้โปรไฟล์ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many profile changes. Please wait a moment and try again.',
  'ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่': 'Too many requests. Please wait a moment and try again.',

  // ---- สมัคร / เข้าสู่ระบบ / รหัสผ่าน ----
  'กรุณากรอกชื่อ': 'Please enter your name.',
  'รูปแบบอีเมลไม่ถูกต้อง': 'Invalid email format.',
  'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร': 'Password must be at least 8 characters.',
  'รหัสผ่านยาวเกิน 72 ตัวอักษร': 'Password must be 72 characters or fewer.',
  'กรุณาเลือกคำถามความปลอดภัย': 'Please choose a security question.',
  'คำตอบความปลอดภัยต้องยาวอย่างน้อย 3 ตัวอักษร': 'Your security answer must be at least 3 characters.',
  'คำตอบต้องยาวอย่างน้อย 3 ตัวอักษร': 'Your answer must be at least 3 characters.',
  'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน': 'This email is already registered. Try logging in instead.',
  'อีเมลหรือรหัสผ่านไม่ถูกต้อง': 'Incorrect email or password.',
  'รหัสผ่านปัจจุบันไม่ถูกต้อง': 'Current password is incorrect.',
  'คำตอบไม่ถูกต้อง หรือบัญชีนี้กู้รหัสผ่านด้วยวิธีนี้ไม่ได้ (ถ้ายังไม่เคยตั้งคำถาม ให้ขอลิงก์ทางอีเมลแทน)':
    'Incorrect answer, or this account cannot be recovered this way (if you never set a security question, request a link by email instead).',
  'ตอบผิดหลายครั้งเกินไป บัญชีนี้ถูกล็อกการกู้รหัสผ่านชั่วคราว ลองใหม่ภายหลัง 30 นาที':
    'Too many wrong answers. Password recovery for this account is temporarily locked. Please try again in 30 minutes.',
  'ถ้าอีเมลนี้มีบัญชีอยู่ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้แล้ว (ลิงก์ใช้ได้ {n} นาที)':
    'If this email has an account, we have sent a link to set a new password (valid for {n} minutes).',
  'ลิงก์นี้ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่': 'This link is invalid or has expired. Please request a new one.',
  'ยังไม่ได้ตั้งค่าเข้าสู่ระบบด้วย Google': 'Google sign-in has not been set up.',
  'ไม่พบข้อมูลจาก Google': 'No data received from Google.',
  'ยืนยันตัวตนกับ Google ไม่สำเร็จ ลองใหม่อีกครั้ง': 'Google verification failed. Please try again.',
  'อีเมล Google นี้ยังไม่ได้รับการยืนยัน': 'This Google email has not been verified.',

  // ---- คำถามความปลอดภัย ----
  'ชื่อแมวตัวแรกของคุณคืออะไร': "What was your first cat's name?",
  'ชื่อโรงเรียนประถมของคุณคืออะไร': 'What was the name of your primary school?',
  'คุณเกิดที่จังหวัดอะไร': 'Which province were you born in?',
  'อาหารจานโปรดสมัยเด็กของคุณคืออะไร': 'What was your favourite dish as a child?',
  'ชื่อเล่นเพื่อนสนิทสมัยเด็กของคุณคืออะไร': "What was your childhood best friend's nickname?",
  'เลข 4 ตัวท้ายของเบอร์โทรที่ใช้ประจำของคุณคืออะไร': 'What are the last 4 digits of your main phone number?',

  // ---- โปรไฟล์ ----
  'ชื่อยาวเกิน 80 ตัวอักษร': 'Name must be 80 characters or fewer.',
  'ชื่อเล่นยาวเกิน 30 ตัวอักษร': 'Nickname must be 30 characters or fewer.',

  // ---- รูปภาพ / อัปโหลด ----
  'ไม่พบไฟล์รูป ส่งได้เฉพาะ JPG, PNG หรือ WebP': 'No image file found. Only JPG, PNG or WebP can be uploaded.',
  'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WebP': 'This file is not a JPG, PNG or WebP image.',
  'รูปใหญ่เกินไป (ไม่เกิน 1 MB) ลองเลือกรูปอื่น': 'Image is too large (max 1 MB). Please choose another.',
  'รูปใหญ่เกินไป ลองเลือกรูปอื่น': 'Image is too large. Please choose another.',
  'รูปสลิปใหญ่เกินไป (ไม่เกิน 1 MB) ลองเลือกรูปอื่น': 'Slip image is too large (max 1 MB). Please choose another.',
  'อัปโหลดรูปไม่สำเร็จ': 'Image upload failed.',
  'รูปนี้ถูกใช้กับสินค้าอยู่ ลบไม่ได้': 'This image is used by a product and cannot be deleted.',

  // ---- ที่อยู่ ----
  'บันทึกที่อยู่ได้สูงสุด {n} รายการ ลบรายการเก่าก่อน': 'You can save up to {n} addresses. Please delete an old one first.',
  'ที่อยู่ไม่ถูกต้อง': 'Invalid address.',
  'ไม่พบที่อยู่ที่เลือก': 'The selected address was not found.',
  'กรุณากรอกชื่อผู้รับ (ไม่เกิน 80 ตัวอักษร)': 'Please enter the recipient name (max 80 characters).',
  'เบอร์โทรไม่ถูกต้อง (ตัวเลข 8-15 หลัก)': 'Invalid phone number (8-15 digits).',
  'กรุณากรอกที่อยู่จัดส่งให้ครบ (5-300 ตัวอักษร)': 'Please enter the full delivery address (5-300 characters).',
  'ชื่อที่อยู่ยาวเกิน 30 ตัวอักษร': 'Address label must be 30 characters or fewer.',

  // ---- สั่งซื้อ / ชำระเงิน ----
  'สินค้า "{name}" เหลือเพียง {n} ชิ้น กรุณาปรับจำนวนในตะกร้า': '"{name}" has only {n} left in stock. Please adjust the quantity in your cart.',
  'สินค้า "{name}" หมดแล้ว กรุณาปรับจำนวนในตะกร้า': '"{name}" is out of stock. Please adjust your cart.',
  'ตะกร้าว่างหรือมีรายการมากเกินไป': 'Your cart is empty or has too many items.',
  'ข้อมูลสินค้าในตะกร้าไม่ถูกต้อง (จำนวน 1-{n} ชิ้นต่อรายการ)': 'Invalid cart data (quantity must be 1-{n} per item).',
  'มีสินค้าในตะกร้าที่ไม่มีขายแล้ว กรุณาลบออกจากตะกร้า': 'Some items in your cart are no longer available. Please remove them.',
  'สร้างเลขออเดอร์ไม่สำเร็จ': 'Could not create an order number.',
  'บันทึกที่อยู่ไม่สำเร็จ': 'Could not save the address.',
  'ยกเลิกไม่ได้ ออเดอร์นี้ชำระเงินหรือถูกยกเลิกไปแล้ว ติดต่อร้านหากต้องการความช่วยเหลือ':
    'Cannot cancel: this order has already been paid or cancelled. Contact the shop if you need help.',
  'ออเดอร์นี้ถูกยกเลิกเพราะไม่ได้ชำระเงินภายในเวลาที่กำหนด กรุณาสั่งซื้อใหม่':
    'This order was cancelled because payment was not made in time. Please place a new order.',
  'ออเดอร์นี้ไม่ได้รอชำระเงินแล้ว แนบสลิปไม่ได้': 'This order is no longer awaiting payment, so a slip cannot be attached.',
  'ออเดอร์นี้เพิ่งเปลี่ยนสถานะ แนบสลิปไม่ได้': 'This order has just changed status, so a slip cannot be attached.',
  'คุณยืนยันรับสินค้าของออเดอร์นี้ไปแล้ว': 'You have already confirmed receipt of this order.',
  'ยืนยันรับสินค้าได้เมื่อร้านจัดส่งแล้วเท่านั้น': 'You can confirm receipt only after the shop has shipped the order.',
  'เลขพัสดุยาวเกิน 60 ตัวอักษร': 'Tracking number must be 60 characters or fewer.',
  'เปลี่ยนสถานะจากนี้ไปเป็นสถานะที่เลือกไม่ได้': 'Cannot change to the selected status from the current one.',
  'ใส่เลขพัสดุได้เมื่อชำระเงินแล้วหรือจัดส่งแล้ว': 'A tracking number can be added once the order is paid or shipped.',
  'ออเดอร์นี้เพิ่งถูกเปลี่ยนโดยผู้อื่น กรุณารีเฟรชแล้วลองใหม่': 'This order was just changed by someone else. Please refresh and try again.',
  'สลิปไม่ถูกต้อง กรุณาแนบสลิปใหม่': 'The slip was not accepted. Please attach a new slip.',
  'ไม่มีสลิปรอตรวจในออเดอร์นี้ (อาจถูกเปลี่ยนสถานะไปแล้ว)': 'There is no slip awaiting review for this order (its status may have changed).',

  // ---- รีวิว ----
  'กรุณาให้คะแนน 1-5 ดาว': 'Please give a rating from 1 to 5 stars.',
  'ความคิดเห็นยาวเกิน 500 ตัวอักษร': 'Comment must be 500 characters or fewer.',
  'รีวิวได้หลังจากกดยืนยันรับสินค้าที่หน้า "บัญชีของฉัน" แล้วเท่านั้น':
    'You can review a product only after confirming receipt on the "My orders" page.',
  'แนบรูปได้ไม่เกิน {n} รูป': 'You can attach up to {n} photos.',
  'รูปที่แนบไม่ถูกต้อง': 'The attached photo is invalid.',
  'รูปที่แนบไม่ถูกต้อง ลองอัปโหลดใหม่': 'The attached photo is invalid. Please upload it again.',
  'ลบรีวิวของผู้อื่นไม่ได้': "You cannot delete someone else's review.",

  // ---- ติดต่อร้าน ----
  'กรุณาพิมพ์ข้อความอย่างน้อย 5 ตัวอักษร': 'Please write a message of at least 5 characters.',
  'ข้อความยาวเกิน 2000 ตัวอักษร': 'Message must be 2000 characters or fewer.',
  'ส่งข้อความถึงร้านแล้ว ขอบคุณที่ติดต่อ ร้านจะตอบกลับทางอีเมลที่ให้ไว้':
    'Your message has been sent. Thank you for contacting us. The shop will reply to the email you provided.',
  'กรุณาพิมพ์คำตอบ': 'Please write a reply.',
  'คำตอบยาวเกิน 2000 ตัวอักษร': 'Reply must be 2000 characters or fewer.',

  // ---- คืน / เปลี่ยนสินค้า ----
  'แจ้งคืนหรือเปลี่ยนสินค้าได้หลังจากกดยืนยันรับสินค้าแล้วเท่านั้น': 'You can request a return or exchange only after confirming receipt.',
  'เกินกำหนดแจ้งคืนสินค้าแล้ว (แจ้งได้ภายใน {n} วันหลังยืนยันรับสินค้า) กรุณาติดต่อร้านโดยตรง':
    'The return period has passed (requests must be made within {n} days after confirming receipt). Please contact the shop directly.',
  'ออเดอร์นี้มีคำขอที่รอร้านตรวจสอบอยู่แล้ว': 'This order already has a request awaiting review.',
  'ออเดอร์นี้มีคำขอที่ร้านอนุมัติแล้ว กรุณารอร้านดำเนินการ': 'This order has an approved request. Please wait for the shop to process it.',
  'ออเดอร์นี้แจ้งคืนครบจำนวนครั้งที่กำหนดแล้ว กรุณาติดต่อร้านโดยตรง':
    'This order has reached the maximum number of return requests. Please contact the shop directly.',
  'กรุณาเลือกสินค้าที่ต้องการแจ้ง': 'Please select the items to report.',
  'รายการสินค้าไม่ถูกต้อง': 'Invalid item list.',
  'จำนวนของ "{name}" ต้องอยู่ระหว่าง 1 ถึง {n}': 'Quantity of "{name}" must be between 1 and {n}.',
  'กรุณาเลือกเหตุผล': 'Please select a reason.',
  'รายละเอียดยาวเกิน 1000 ตัวอักษร': 'Details must be 1000 characters or fewer.',
  'กรุณาอธิบายรายละเอียดอย่างน้อย 5 ตัวอักษร': 'Please describe the issue in at least 5 characters.',
  'กรุณาแนบรูปหลักฐานอย่างน้อย 1 รูป': 'Please attach at least 1 photo as evidence.',
  'รูปหลักฐานไม่ถูกต้อง': 'The evidence photo is invalid.',
  'รูปหลักฐานไม่ถูกต้อง กรุณาอัปโหลดใหม่': 'The evidence photo is invalid. Please upload it again.',
  'รูปนี้ถูกใช้กับคำขออื่นแล้ว กรุณาอัปโหลดใหม่': 'This photo is already used in another request. Please upload it again.',
  'ยกเลิกได้เฉพาะคำขอที่ยังรอร้านตรวจสอบ': 'Only requests still awaiting review can be cancelled.',
  'กดดำเนินการเสร็จได้เฉพาะคำขอที่อนุมัติแล้ว': 'Only approved requests can be marked as completed.',
  'คำขอนี้ถูกบันทึกว่าดำเนินการเสร็จแล้ว': 'This request is already marked as completed.',
  'คำขอนี้ถูกตัดสินไปแล้ว หรือลูกค้ายกเลิกแล้ว': 'This request has already been decided or cancelled by the customer.',
  'ข้อความยาวเกิน 500 ตัวอักษร': 'Message must be 500 characters or fewer.',
  'กรุณาเลือกวิธีดำเนินการ (คืนเงิน/ส่งของใหม่/อื่น ๆ)': 'Please choose a resolution (refund / replacement / other).',
  'กรุณาบอกเหตุผลที่ไม่อนุมัติให้ลูกค้าทราบ': 'Please tell the customer why the request was not approved.',
  'คำขอนี้เพิ่งถูกเปลี่ยนสถานะ กรุณารีเฟรชแล้วลองใหม่': 'This request has just changed status. Please refresh and try again.',

  // ---- รายการโปรด ----
  'รายการโปรดเต็มแล้ว (สูงสุด {n} รายการ) ลองเอารายการเก่าออกก่อน': 'Your wishlist is full (max {n} items). Please remove an old item first.',

  // ---- สินค้า (แอดมิน) ----
  'กรุณากรอกชื่อสินค้า (ไม่เกิน 120 ตัวอักษร)': 'Please enter a product name (max 120 characters).',
  'ชื่อภาษาอังกฤษยาวเกิน 120 ตัวอักษร': 'English name must be 120 characters or fewer.',
  'เลือกหมวดสินค้า': 'Choose a category.',
  'เลือกวัยแมว': 'Choose a cat age group.',
  'ราคาต้องเป็นจำนวนเต็มบาท 0 ถึง 1,000,000': 'Price must be a whole number of baht from 0 to 1,000,000.',
  'ราคาก่อนลดต้องเป็นจำนวนเต็มบาท': 'Original price must be a whole number of baht.',
  'ราคาก่อนลดต้องมากกว่าราคาขาย (หรือเว้นว่างถ้าไม่ลดราคา)': 'Original price must be higher than the selling price (or leave blank if not on sale).',
  'ขนาด/น้ำหนักยาวเกิน 60 ตัวอักษร': 'Size/weight must be 60 characters or fewer.',
  'ขนาด/น้ำหนักภาษาอังกฤษยาวเกิน 60 ตัวอักษร': 'English size/weight must be 60 characters or fewer.',
  'เลือกรูปแบบภาพประกอบ': 'Choose an illustration style.',
  'สีต้องเป็นรหัส เช่น #f08a24': 'Colour must be a hex code, e.g. #f08a24.',
  'จำนวนสต็อกต้องเป็นจำนวนเต็ม 0 ขึ้นไป': 'Stock must be a whole number, 0 or more.',
  'ลำดับแนะนำต้องเป็นเลข 0 ถึง 10': 'Featured order must be a number from 0 to 10.',
  'รูปภาพไม่ถูกต้อง': 'Invalid image.',
  'ใส่รูปได้สูงสุด {n} รูปต่อสินค้า': 'Up to {n} images per product.',
  'มีรูปซ้ำกัน': 'Duplicate images.',
  'ต้องมีรูปหลักก่อนจึงใส่รูปเพิ่มเติมได้': 'Add a main image before adding extra images.',
  'ไม่พบรูปที่อัปโหลดไว้ ลองอัปโหลดใหม่': 'Uploaded image not found. Please upload it again.',

  // ---- ข้อมูลร้าน (แอดมิน) ----
  'เบอร์โทรยาวเกิน {n} ตัวอักษร': 'Phone number must be {n} characters or fewer.',
  'LINE IDยาวเกิน {n} ตัวอักษร': 'LINE ID must be {n} characters or fewer.',
  'อีเมลยาวเกิน {n} ตัวอักษร': 'Email must be {n} characters or fewer.',
  'ลิงก์ Facebookยาวเกิน {n} ตัวอักษร': 'Facebook link must be {n} characters or fewer.',
  'ที่อยู่ยาวเกิน {n} ตัวอักษร': 'Address must be {n} characters or fewer.',
  'เวลาทำการยาวเกิน {n} ตัวอักษร': 'Opening hours must be {n} characters or fewer.',
  'เลข PromptPayยาวเกิน {n} ตัวอักษร': 'PromptPay ID must be {n} characters or fewer.',
  'ชื่อบัญชี PromptPayยาวเกิน {n} ตัวอักษร': 'PromptPay account name must be {n} characters or fewer.',
  'เลข PromptPay ต้องเป็นเบอร์โทร 10 หลัก (ขึ้นต้น 0), เลขบัตร/ภาษี 13 หลัก หรือ e-Wallet 15 หลัก':
    'PromptPay ID must be a 10-digit phone number (starting with 0), a 13-digit ID/tax number, or a 15-digit e-Wallet ID.',
  'ลิงก์ Facebook ต้องขึ้นต้นด้วย https://': 'Facebook link must start with https://',
};
