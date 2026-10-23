import { translate } from './i18n';

// เรียก API ของเซิร์ฟเวอร์ ถ้าไม่สำเร็จจะ throw Error ที่มี message ภาษาไทยและชื่อช่อง (field) ที่ผิด
async function request(method, path, body) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(translate('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง'));
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* ไม่มีเนื้อหา */
  }
  if (!res.ok) {
    const err = new Error(translate(data.error || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'));
    err.field = data.field;
    err.code = data.code;
    throw err;
  }
  return data;
}

// ส่งไฟล์รูป (Blob) แบบไบนารีตรง ๆ ไปเก็บในฐานข้อมูล คืน { id, url }
async function uploadImage(blob, url = '/api/admin/images') {
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
  } catch {
    throw new Error(translate('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง'));
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* ไม่มีเนื้อหา */
  }
  if (!res.ok) throw new Error(translate(data.error || 'อัปโหลดรูปไม่สำเร็จ'));
  return data;
}

export const api = {
  me: () => request('GET', '/auth/me'),
  register: (b) => request('POST', '/auth/register', b),
  login: (b) => request('POST', '/auth/login', b),
  questions: () => request('GET', '/auth/questions'),
  saveSecurityQuestion: (b) => request('PUT', '/auth/security-question', b),
  securityQuestion: (email) => request('POST', '/auth/security-question', { email }),
  resetByAnswer: (b) => request('POST', '/auth/reset-by-answer', b),
  profile: {
    save: (b) => request('PUT', '/profile', b),
    removeAvatar: () => request('DELETE', '/profile/avatar'),
    uploadAvatar: (blob) => uploadImage(blob, '/api/profile/avatar'),
  },
  forgot: (email) => request('POST', '/auth/forgot', { email }),
  reset: (token, password) => request('POST', '/auth/reset', { token, password }),
  contact: (b) => request('POST', '/contact', b),
  contactMine: () => request('GET', '/contact/mine'),
  shopInfo: () => request('GET', '/shop-info'),
  logout: () => request('POST', '/auth/logout'),
  config: () => request('GET', '/auth/config'),
  google: (credential) => request('POST', '/auth/google', { credential }),
  products: { list: () => request('GET', '/products') },
  orders: {
    create: (b) => request('POST', '/orders', b),
    mine: () => request('GET', '/orders'),
    cancel: (id) => request('POST', '/orders/' + id + '/cancel'),
    receive: (id) => request('POST', '/orders/' + id + '/receive'),
    uploadSlip: (id, blob) => uploadImage(blob, '/api/orders/' + id + '/slip'),
  },
  addresses: {
    list: () => request('GET', '/addresses'),
    create: (b) => request('POST', '/addresses', b),
    update: (id, b) => request('PUT', '/addresses/' + id, b),
    setDefault: (id) => request('POST', '/addresses/' + id + '/default'),
    remove: (id) => request('DELETE', '/addresses/' + id),
  },
  returns: {
    mine: () => request('GET', '/returns/mine'),
    create: (b) => request('POST', '/returns', b),
    withdraw: (id) => request('POST', '/returns/' + id + '/withdraw'),
    uploadPhoto: (blob) => uploadImage(blob, '/api/returns/images'),
  },
  wishlist: {
    ids: () => request('GET', '/wishlist'),
    add: (productId) => request('PUT', '/wishlist/' + productId),
    remove: (productId) => request('DELETE', '/wishlist/' + productId),
  },
  reviews: {
    mine: () => request('GET', '/reviews/mine'),
    list: (productId) => request('GET', '/products/' + productId + '/reviews'),
    save: (productId, b) => request('POST', '/products/' + productId + '/reviews', b),
    remove: (id) => request('DELETE', '/reviews/' + id),
    reviewer: (reviewId) => request('GET', '/reviews/' + reviewId + '/reviewer'),
    uploadPhoto: (blob) => uploadImage(blob, '/api/reviews/images'),
  },
  admin: {
    list: () => request('GET', '/admin/products'),
    create: (b) => request('POST', '/admin/products', b),
    update: (id, b) => request('PUT', '/admin/products/' + id, b),
    remove: (id) => request('DELETE', '/admin/products/' + id),
    uploadImage,
    deleteImage: (id) => request('DELETE', '/admin/images/' + id),
    orders: (status) => request('GET', '/admin/orders' + (status ? '?status=' + encodeURIComponent(status) : '')),
    rejectSlip: (id, note) => request('POST', '/admin/orders/' + id + '/reject-slip', { note }),
    updateOrder: (id, b) => request('PATCH', '/admin/orders/' + id, b),
    returns: (status) => request('GET', '/admin/returns' + (status ? '?status=' + encodeURIComponent(status) : '')),
    reviewReturn: (id, b) => request('PATCH', '/admin/returns/' + id, b),
    returnsSummary: () => request('GET', '/admin/returns/summary'),
    messages: (status) => request('GET', '/admin/messages' + (status ? '?status=' + encodeURIComponent(status) : '')),
    messagesSummary: () => request('GET', '/admin/messages/summary'),
    setMessageStatus: (id, status) => request('PATCH', '/admin/messages/' + id, { status }),
    replyMessage: (id, reply) => request('POST', '/admin/messages/' + id + '/reply', { reply }),
    deleteMessage: (id) => request('DELETE', '/admin/messages/' + id),
    saveShopInfo: (b) => request('PUT', '/admin/shop-info', b),
    stats: (days) => request('GET', '/admin/stats?days=' + days),
  },
};
