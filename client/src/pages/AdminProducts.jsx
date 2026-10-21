import { useCallback, useEffect, useState } from 'react';
import Art from '../components/Art';
import { api } from '../api';
import { useProducts } from '../context/ProductsContext';
import { AGES, CATEGORIES, KINDS, baht } from '../data/products';
import { ACCEPT_ATTR, prepareImage } from '../utils/image';

const EMPTY = {
  name: '', cat: 'food', age: 'all', price: '', was: '', size: '',
  kind: 'bag', color: '#f08a24', stock: '', pop: 5, active: true,
  photos: [], // รูปทั้งหมดเรียงตามลำดับ (รูปแรก = รูปหลัก) แต่ละรูปคือ { id, url }
};

const MAX_PHOTOS = 6; // ต้องเท่ากับ MAX_GALLERY + 1 ใน config/shop.js

const catLabel = (id) => (CATEGORIES.find((c) => c[0] === id) || [])[1] || id;

export default function AdminProducts() {
  const { reload: reloadShop } = useProducts();
  const [list, setList] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null); // { message, field }
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savedIds, setSavedIds] = useState([]); // รหัสรูปที่บันทึกกับสินค้าที่กำลังแก้อยู่แล้ว (ห้ามลบก่อนกดบันทึก)

  const load = useCallback(() => {
    setLoadError(null);
    return api.admin
      .list()
      .then((d) => setList(d.products))
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const invalid = (k) => (error && error.field === k ? 'true' : undefined);

  // รูปที่เพิ่งอัปโหลดในฟอร์มแต่ยังไม่ได้บันทึก ถ้าเปลี่ยนใจให้ลบทิ้ง ไม่ให้ค้างในฐานข้อมูล
  const discard = (id) => {
    if (id && !savedIds.includes(id)) api.admin.deleteImage(id).catch(() => {});
  };
  const discardAll = () => form.photos.forEach((ph) => discard(ph.id));

  const onPick = async (e) => {
    const files = [...(e.target.files || [])].slice(0, MAX_PHOTOS - form.photos.length);
    e.target.value = ''; // เลือกไฟล์เดิมซ้ำได้
    if (files.length === 0) return;
    setError(null);
    setNotice('');
    setUploading(true);
    try {
      const added = [];
      for (const file of files) {
        const blob = await prepareImage(file);
        const up = await api.admin.uploadImage(blob);
        added.push({ id: up.id, url: up.url });
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...added] }));
    } catch (err) {
      setError({ message: err.message, field: 'image' });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (id) => {
    discard(id);
    setForm((f) => ({ ...f, photos: f.photos.filter((ph) => ph.id !== id) }));
  };

  // ย้ายรูปที่เลือกมาเป็นรูปแรก (รูปหลักที่แสดงบนการ์ดสินค้า)
  const makeCover = (id) => {
    setForm((f) => ({ ...f, photos: [...f.photos.filter((ph) => ph.id === id), ...f.photos.filter((ph) => ph.id !== id)] }));
  };

  const startEdit = (p) => {
    discardAll();
    setSavedIds(p.photos.map((ph) => ph.id));
    setEditingId(p.id);
    setForm({ ...EMPTY, ...p, was: p.was || '', photos: p.photos });
    setError(null);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    discardAll();
    reset();
  };

  const reset = () => {
    setSavedIds([]);
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      // รูปแรกเป็นรูปหลัก ที่เหลือเป็นรูปเพิ่มเติม
      const payload = { ...form, image: form.photos[0] ? form.photos[0].id : '', gallery: form.photos.slice(1).map((ph) => ph.id) };
      if (editingId) await api.admin.update(editingId, payload);
      else await api.admin.create(payload);
      setNotice(editingId ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มสินค้าแล้ว');
      reset();
      await load();
      reloadShop();
    } catch (err) {
      setError({ message: err.message, field: err.field });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm('ลบ "' + p.name + '" ใช่ไหม ลบแล้วกู้คืนไม่ได้')) return;
    try {
      await api.admin.remove(p.id);
      if (editingId === p.id) reset();
      setNotice('ลบสินค้าแล้ว');
      await load();
      reloadShop();
    } catch (err) {
      setError({ message: err.message });
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.admin.update(p.id, { ...p, active: !p.active });
      await load();
      reloadShop();
    } catch (err) {
      setError({ message: err.message });
    }
  };

  return (
    <>
        <section className="panel">
          <h2>{editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
          <form className="afrom" onSubmit={submit} noValidate>
            {error && <div className="err" role="alert">{error.message}</div>}

            <label htmlFor="a-name" className="span2">ชื่อสินค้า
              <input id="a-name" value={form.name} onChange={set('name')} maxLength={120} aria-invalid={invalid('name')} required />
            </label>
            <label htmlFor="a-cat">หมวด
              <select id="a-cat" value={form.cat} onChange={set('cat')}>
                {CATEGORIES.filter((c) => c[0] !== 'all').map(([id, l]) => <option key={id} value={id}>{l}</option>)}
              </select>
            </label>
            <label htmlFor="a-age">เหมาะกับวัย
              <select id="a-age" value={form.age} onChange={set('age')}>
                {AGES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
              </select>
            </label>
            <label htmlFor="a-price">ราคาขาย (บาท)
              <input id="a-price" type="number" inputMode="numeric" min="0" step="1" value={form.price} onChange={set('price')} aria-invalid={invalid('price')} />
            </label>
            <label htmlFor="a-was">ราคาก่อนลด (ถ้ามี)
              <input id="a-was" type="number" inputMode="numeric" min="0" step="1" value={form.was} onChange={set('was')} aria-invalid={invalid('was')} />
            </label>
            <label htmlFor="a-size">ขนาด/น้ำหนัก
              <input id="a-size" value={form.size} onChange={set('size')} maxLength={60} placeholder="เช่น 1.5 กก." />
            </label>
            <label htmlFor="a-stock">จำนวนสต็อก
              <input id="a-stock" type="number" inputMode="numeric" min="0" step="1" value={form.stock} onChange={set('stock')} aria-invalid={invalid('stock')} />
            </label>
            <label htmlFor="a-kind">รูปแบบภาพประกอบ
              <select id="a-kind" value={form.kind} onChange={set('kind')}>
                {KINDS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
              </select>
            </label>
            <label htmlFor="a-color">สีของสินค้า
              <input id="a-color" type="color" value={form.color} onChange={set('color')} />
            </label>
            <label htmlFor="a-pop">ลำดับแนะนำ (0-10 ยิ่งมากยิ่งขึ้นก่อน)
              <input id="a-pop" type="number" min="0" max="10" step="1" value={form.pop} onChange={set('pop')} aria-invalid={invalid('pop')} />
            </label>
            <label htmlFor="a-active" className="check">
              <input id="a-active" type="checkbox" checked={form.active} onChange={set('active')} />
              แสดงในหน้าร้าน
            </label>

            <div className="photofield">
              <span>รูปสินค้า ({form.photos.length}/{MAX_PHOTOS})</span>
              <div className="row2">
                <div className="thumb">
                  <Art
                    product={{
                      name: form.name,
                      kind: form.kind,
                      color: /^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : '#8a9aa0',
                      imageUrl: form.photos[0] ? form.photos[0].url : null,
                    }}
                  />
                </div>
                <div className="btns">
                  {form.photos.length < MAX_PHOTOS && (
                    <label className={'filebtn' + (uploading ? ' busy' : '')} htmlFor="a-photo">
                      {uploading ? 'กำลังอัปโหลด...' : form.photos.length ? 'เพิ่มรูป' : 'เลือกรูปจากเครื่อง'}
                      <input id="a-photo" type="file" accept={ACCEPT_ATTR} multiple onChange={onPick} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>
              {form.photos.length > 0 && (
                <ul className="photolist" aria-label="รูปสินค้าทั้งหมด">
                  {form.photos.map((ph, i) => (
                    <li key={ph.id}>
                      <img src={ph.url} alt={'รูปที่ ' + (i + 1)} />
                      {i === 0 ? <em className="tag">รูปหลัก</em> : (
                        <button type="button" className="ghost" onClick={() => makeCover(ph.id)}>ตั้งเป็นรูปหลัก</button>
                      )}
                      <button type="button" className="ghost danger" onClick={() => removePhoto(ph.id)} aria-label={'ลบรูปที่ ' + (i + 1)}>ลบ</button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="note">
                ใส่ได้สูงสุด {MAX_PHOTOS} รูป (เลือกหลายไฟล์พร้อมกันได้) รองรับ JPG, PNG, WebP ระบบย่อรูปให้อัตโนมัติ
                รูปแรกคือรูปหลักที่แสดงบนการ์ดสินค้า รูปจะถูกบันทึกเมื่อกด{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                ถ้าไม่ใส่รูป หน้าร้านจะใช้ภาพประกอบตามรูปแบบและสีที่เลือกไว้ด้านบน
              </p>
            </div>

            <div className="actions span2">
              <button className="submit" type="submit" disabled={busy || uploading}>{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
              {editingId && <button type="button" className="ghost" onClick={cancelEdit}>ยกเลิกการแก้ไข</button>}
            </div>
            {notice && <p className="okmsg" role="status">{notice}</p>}
          </form>
        </section>

        <section className="panel">
          <h2>สินค้าทั้งหมด ({list.length})</h2>
          {loadError && <div className="err" role="alert">โหลดรายการไม่สำเร็จ: {loadError}</div>}
          {!loadError && list.length === 0 && (
            <p className="note">ยังไม่มีสินค้า เพิ่มจากฟอร์มด้านบน หรือรัน npm run seed เพื่อใส่สินค้าตัวอย่าง</p>
          )}
          <div className="tablewrap">
            <table>
              <thead>
                <tr><th>สินค้า</th><th>หมวด</th><th className="r">ราคา</th><th className="r">สต็อก</th><th>สถานะ</th><th /></tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className={p.active ? '' : 'off'}>
                    <td>
                      <div className="pcell">
                        <div className="tthumb"><Art product={p} /></div>
                        <div>
                          <div className="pname">{p.name}</div>
                          <div className="meta">{p.size}</div>
                        </div>
                      </div>
                    </td>
                    <td>{catLabel(p.cat)}</td>
                    <td className="r num">{baht(p.price)}{p.was > 0 && <div className="meta"><s>{baht(p.was)}</s></div>}</td>
                    <td className={'r num' + (p.stock <= 5 ? ' low' : '')}>{p.stock}</td>
                    <td>
                      <button className="pill" onClick={() => toggleActive(p)} aria-label={p.active ? 'ซ่อนสินค้านี้' : 'แสดงสินค้านี้'}>
                        {p.active ? 'แสดงอยู่' : 'ซ่อนอยู่'}
                      </button>
                    </td>
                    <td className="rowact">
                      <button className="ghost" onClick={() => startEdit(p)}>แก้ไข</button>
                      <button className="ghost danger" onClick={() => remove(p)}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </>
  );
}
