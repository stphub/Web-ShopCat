const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { newToken, hashToken } = require('../lib/resetToken');
const { sendMail } = require('../lib/mailer');
const { RESET_TOKEN_MINUTES } = require('../config/shop');
const { QUESTIONS, BY_ID, normalizeAnswer, fakeQuestionFor } = require('../lib/securityQuestions');

const router = express.Router();
const COOKIE = 'catshop_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// จำกัดจำนวนครั้งที่ลองสมัคร/ล็อกอิน ป้องกันการเดารหัสผ่าน
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// ขอลิงก์รีเซ็ตรหัสผ่านได้น้อยกว่าล็อกอิน กันคนยิงอีเมลรบกวนเจ้าของบัญชี
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'ขอรีเซ็ตรหัสผ่านหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่' },
});

// ตอบผิดครบ 5 ครั้ง ล็อกการกู้รหัสผ่านด้วยคำตอบ 30 นาที
const MAX_SEC_FAILS = 5;
const SEC_LOCK_MS = 30 * 60 * 1000;
// ล็อกอินผิดครบ 8 ครั้งติดกัน ล็อกการล็อกอินบัญชีนั้น 15 นาที (นับต่อบัญชี ไม่ใช่ต่อ IP)
const MAX_LOGIN_FAILS = 8;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync('dummy-answer', 10); // ใช้เทียบเวลาเมื่อไม่มีบัญชี
const hashAnswer = (a) => bcrypt.hash(normalizeAnswer(a), 10);

function validAnswer(a) {
  return normalizeAnswer(a).length >= 3 && String(a).length <= 100;
}

function setSession(res, user) {
  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
  });
}

// ตัวเช็กว่าล็อกอินอยู่หรือไม่ ใช้กับเส้นทางที่ต้องล็อกอินก่อน
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE];
    if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(sub);
    if (!user) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

// ต้องใช้ต่อจาก requireAuth: ผ่านเฉพาะบัญชีที่ role เป็น admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'ต้องเป็นแอดมินเท่านั้น' });
  }
  next();
}

// ถ้าล็อกอินอยู่จะใส่ req.user ให้ ถ้าไม่ล็อกอินก็ผ่านไปโดยไม่มี req.user (ไม่ถือเป็นข้อผิดพลาด)
async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE];
    if (token) {
      const { sub } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(sub);
    }
  } catch (e) {
    req.user = null;
  }
  next();
}

router.post('/register', limiter, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อ', field: 'name' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง', field: 'email' });
    if (password.length < 8) return res.status(400).json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร', field: 'password' });
    if (password.length > 72) return res.status(400).json({ error: 'รหัสผ่านยาวเกิน 72 ตัวอักษร', field: 'password' });

    const secQ = String(req.body.secQ || '');
    const secA = String(req.body.secA || '');
    if (!BY_ID[secQ]) return res.status(400).json({ error: 'กรุณาเลือกคำถามความปลอดภัย', field: 'secQ' });
    if (!validAnswer(secA)) return res.status(400).json({ error: 'คำตอบความปลอดภัยต้องยาวอย่างน้อย 3 ตัวอักษร', field: 'secA' });

    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน', field: 'email' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, secQ, secAHash: await hashAnswer(secA) });
    setSession(res, user);
    res.status(201).json({ user: user.toPublic() });
  } catch (e) {
    // กรณีสมัครพร้อมกันสองครั้ง unique index จะจับให้
    if (e && e.code === 11000) return res.status(409).json({ error: 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน', field: 'email' });
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

router.post('/login', limiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash +loginFails +loginLockUntil');
    if (user && user.loginLockUntil && user.loginLockUntil > new Date()) {
      const mins = Math.ceil((user.loginLockUntil.getTime() - Date.now()) / 60000);
      return res.status(429).json({ error: 'ล็อกอินผิดหลายครั้ง บัญชีนี้ถูกล็อกชั่วคราว กรุณาลองใหม่ในอีก ' + mins + ' นาที หรือใช้ "ลืมรหัสผ่าน"' });
    }
    // ข้อความเดียวกันทั้งกรณีไม่พบอีเมลและรหัสผ่านผิด เพื่อไม่บอกว่ามีอีเมลนี้ในระบบหรือไม่
    const ok = user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      if (user) {
        // นับแบบอะตอมมิก (ไม่พลาดเมื่อมีคำขอพร้อมกัน) ครบกำหนดแล้วตั้งเวลาล็อกและเริ่มนับใหม่
        const upd = await User.findByIdAndUpdate(user._id, { $inc: { loginFails: 1 } }, { new: true }).select('+loginFails');
        if (upd && upd.loginFails >= MAX_LOGIN_FAILS) {
          await User.updateOne({ _id: user._id }, { loginFails: 0, loginLockUntil: new Date(Date.now() + LOGIN_LOCK_MS) });
        }
      }
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
    if (user.loginFails || user.loginLockUntil) await User.updateOne({ _id: user._id }, { loginFails: 0, $unset: { loginLockUntil: 1 } });
    setSession(res, user);
    res.json({ user: user.toPublic() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// รายการคำถามความปลอดภัยให้เลือกตอนสมัคร/ตั้งในบัญชี
router.get('/questions', (req, res) => res.json({ questions: QUESTIONS }));

// ตั้ง/เปลี่ยนคำถามความปลอดภัยของตัวเอง (ต้องล็อกอิน และยืนยันรหัสผ่านปัจจุบัน ถ้ามี)
router.put('/security-question', limiter, requireAuth, async (req, res) => {
  try {
    const secQ = String(req.body.secQ || '');
    const secA = String(req.body.secA || '');
    if (!BY_ID[secQ]) return res.status(400).json({ error: 'กรุณาเลือกคำถามความปลอดภัย', field: 'secQ' });
    if (!validAnswer(secA)) return res.status(400).json({ error: 'คำตอบต้องยาวอย่างน้อย 3 ตัวอักษร', field: 'secA' });
    const me = await User.findById(req.user._id).select('+passwordHash');
    if (me.passwordHash) {
      const ok = await bcrypt.compare(String(req.body.password || ''), me.passwordHash);
      if (!ok) return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง', field: 'password' });
    }
    await User.updateOne({ _id: me._id }, { secQ, secAHash: await hashAnswer(secA), secFails: 0, $unset: { secLockUntil: 1 } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ขั้นที่ 1 ของการกู้รหัสผ่านบนเว็บ: ขอดูคำถามของอีเมลนั้น (อีเมลที่ไม่มี/ยังไม่ตั้งคำถามจะได้คำถามปลอมที่ตอบไม่ผ่าน)
router.post('/security-question', resetLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง', field: 'email' });
    const user = await User.findOne({ email }).select('secQ role');
    const q = user && user.secQ && BY_ID[user.secQ] && user.role !== 'admin' ? BY_ID[user.secQ] : fakeQuestionFor(email);
    res.json({ question: q.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ขั้นที่ 2: ตอบคำถามให้ถูกแล้วตั้งรหัสผ่านใหม่ได้เลย ไม่ต้องใช้อีเมล (บัญชีแอดมินใช้วิธีนี้ไม่ได้)
router.post('/reset-by-answer', resetLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const answer = String(req.body.answer || '');
    const password = String(req.body.password || '');
    if (password.length < 8) return res.status(400).json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร', field: 'password' });
    if (password.length > 72) return res.status(400).json({ error: 'รหัสผ่านยาวเกิน 72 ตัวอักษร', field: 'password' });

    const fail = () => res.status(400).json({ error: 'คำตอบไม่ถูกต้อง หรือบัญชีนี้กู้รหัสผ่านด้วยวิธีนี้ไม่ได้ (ถ้ายังไม่เคยตั้งคำถาม ให้ขอลิงก์ทางอีเมลแทน)', code: 'BAD_ANSWER' });
    const user = await User.findOne({ email }).select('+secAHash +secFails +secLockUntil');
    const eligible = user && user.secQ && user.secAHash && user.role !== 'admin';
    // เทียบแฮชทุกครั้ง (แม้ไม่มีบัญชี) เพื่อให้ใช้เวลาใกล้เคียงกัน
    const match = await bcrypt.compare(normalizeAnswer(answer), eligible ? user.secAHash : DUMMY_HASH);

    if (eligible && user.secLockUntil && user.secLockUntil > new Date()) {
      return res.status(429).json({ error: 'ตอบผิดหลายครั้งเกินไป บัญชีนี้ถูกล็อกการกู้รหัสผ่านชั่วคราว ลองใหม่ภายหลัง 30 นาที', code: 'LOCKED' });
    }
    if (!eligible || !match) {
      if (eligible) {
        const fails = (user.secFails || 0) + 1;
        await User.updateOne(
          { _id: user._id },
          fails >= MAX_SEC_FAILS ? { secFails: 0, secLockUntil: new Date(Date.now() + SEC_LOCK_MS) } : { secFails: fails }
        );
      }
      return fail();
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne({ _id: user._id }, { passwordHash, secFails: 0, $unset: { secLockUntil: 1, resetTokenHash: 1, resetExpires: 1 } });
    setSession(res, user);
    res.json({ user: user.toPublic() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ลืมรหัสผ่าน: ตอบข้อความเดียวกันเสมอไม่ว่ามีอีเมลนี้หรือไม่ (ไม่บอกว่าใครมีบัญชี)
router.post('/forgot', resetLimiter, async (req, res) => {
  const reply = { ok: true, message: 'ถ้าอีเมลนี้มีบัญชีอยู่ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้แล้ว (ลิงก์ใช้ได้ ' + RESET_TOKEN_MINUTES + ' นาที)' };
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง', field: 'email' });

    const token = newToken();
    const user = await User.findOneAndUpdate(
      { email },
      { resetTokenHash: hashToken(token), resetExpires: new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000) }
    );
    res.json(reply); // ตอบก่อนส่งอีเมล เวลาตอบจะได้ไม่ต่างกันระหว่างมี/ไม่มีบัญชี
    if (user) {
      const base = (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');
      sendMail({
        to: user.email,
        subject: 'ตั้งรหัสผ่านใหม่ - ของแมวเหมียว',
        text:
          'สวัสดีคุณ ' + user.name + '\n\nกดลิงก์นี้เพื่อตั้งรหัสผ่านใหม่ (ใช้ได้ ' + RESET_TOKEN_MINUTES + ' นาที และใช้ได้ครั้งเดียว):\n' +
          base + '/reset-password?token=' + token + '\n\nถ้าคุณไม่ได้เป็นคนขอ ไม่ต้องทำอะไร รหัสผ่านเดิมยังใช้ได้ตามปกติ',
      }).catch((e) => console.error('ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ:', e.message));
    }
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// ตั้งรหัสผ่านใหม่จาก token ในลิงก์ (ใช้ได้ครั้งเดียว) สำเร็จแล้วล็อกอินให้เลย
router.post('/reset', limiter, async (req, res) => {
  try {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    if (password.length < 8) return res.status(400).json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร', field: 'password' });
    if (password.length > 72) return res.status(400).json({ error: 'รหัสผ่านยาวเกิน 72 ตัวอักษร', field: 'password' });

    const bad = () => res.status(400).json({ error: 'ลิงก์นี้ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่', code: 'BAD_TOKEN' });
    if (!token) return bad();
    const h = hashToken(token);
    const user = await User.findOne({ resetTokenHash: h, resetExpires: { $gt: new Date() } });
    if (!user) return bad();

    const passwordHash = await bcrypt.hash(password, 12);
    // ใช้ token ได้ครั้งเดียว: เงื่อนไขแฮชเดิมกันสองคำขอพร้อมกัน
    const r = await User.updateOne(
      { _id: user._id, resetTokenHash: h },
      { passwordHash, $unset: { resetTokenHash: 1, resetExpires: 1 } }
    );
    if (r.modifiedCount !== 1) return bad();
    setSession(res, user);
    res.json({ user: user.toPublic() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

// หน้าเว็บถามว่ามีการตั้งค่า Google ไว้ไหม (ถ้าไม่มีจะไม่แสดงปุ่ม Google)
router.get('/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

// ล็อกอินด้วย Google: หน้าเว็บส่ง ID token (credential) มา เซิร์ฟเวอร์ตรวจกับ Google แล้วสร้างเซสชันของเราเอง
router.post('/google', limiter, async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(503).json({ error: 'ยังไม่ได้ตั้งค่าเข้าสู่ระบบด้วย Google' });
    const credential = String(req.body.credential || '');
    if (!credential) return res.status(400).json({ error: 'ไม่พบข้อมูลจาก Google' });

    let payload;
    try {
      const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch (e) {
      return res.status(401).json({ error: 'ยืนยันตัวตนกับ Google ไม่สำเร็จ ลองใหม่อีกครั้ง' });
    }
    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(401).json({ error: 'อีเมล Google นี้ยังไม่ได้รับการยืนยัน' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // อีเมลนี้เคยสมัครด้วยรหัสผ่านไว้ → ผูกกับ Google และลบรหัสผ่านเดิมทิ้ง
        // (เราไม่ได้ยืนยันอีเมลตอนสมัครแบบรหัสผ่าน จึงกันคนอื่นสมัครดักอีเมลนี้ไว้ก่อน)
        user.googleId = payload.sub;
        user.passwordHash = undefined;
        if (payload.picture) user.picture = payload.picture;
        await user.save();
      } else {
        user = await User.create({
          name: (payload.name || email.split('@')[0]).slice(0, 80),
          email,
          googleId: payload.sub,
          picture: payload.picture,
        });
      }
    }
    setSession(res, user);
    res.json({ user: user.toPublic() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ลองใหม่อีกครั้ง' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
});

// หน้าเว็บเรียกเพื่อรู้ว่าใครล็อกอินอยู่ (ไม่ล็อกอินจะได้ user: null ไม่ใช่ error)
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies[COOKIE];
    if (!token) return res.json({ user: null });
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(sub);
    res.json({ user: user ? user.toPublic() : null });
  } catch (e) {
    res.json({ user: null });
  }
});

module.exports = { router, requireAuth, requireAdmin, optionalAuth };
