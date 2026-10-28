import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBar from '../components/PageBar';
import SiteNav from '../components/SiteNav';
import PageHero from '../components/PageHero';
import SiteFooter from '../components/SiteFooter';
import { dailyEnergy, portions, STAGES, BODY } from '../lib/catCalc';
import { useI18n } from '../i18n';

const num = (v) => (v === '' || v === null ? NaN : Number(v));
const r0 = (n) => Math.round(n);
const r1 = (n) => Math.round(n * 10) / 10;

// เครื่องคำนวณปริมาณอาหารต่อวัน (/calculator): กรอกน้ำหนักและช่วงวัยของแมว ได้พลังงานต่อวันและปริมาณอาหารเม็ด/เปียก
export default function Calculator() {
  const { t, locale } = useI18n();
  const [kg, setKg] = useState('4');
  const [stage, setStage] = useState('adult');
  const [neutered, setNeutered] = useState(true);
  const [body, setBody] = useState('ideal');
  const [mode, setMode] = useState('mix'); // dry | wet | mix
  const [wetPct, setWetPct] = useState(50);
  const [dryKcal, setDryKcal] = useState('380');
  const [wetKcal, setWetKcal] = useState('85');
  const [canG, setCanG] = useState('85');

  const grown = stage === 'adult' || stage === 'senior';
  const w = num(kg);
  const weightOk = w >= 0.3 && w <= 12;

  const res = useMemo(() => {
    if (!weightOk) return null;
    const e = dailyEnergy({ kg: w, stage, neutered, body: grown ? body : 'ideal' });
    const wetShare = mode === 'dry' ? 0 : mode === 'wet' ? 1 : wetPct / 100;
    const d = num(dryKcal);
    const wk = num(wetKcal);
    const cg = num(canG);
    const p = portions({ mer: e.mer, wetShare, dryKcal100: d > 0 ? d : 0, wetKcal100: wk > 0 ? wk : 0, canG: cg > 0 ? cg : 0 });
    return { ...e, ...p, wetShare, dryOk: d >= 200 && d <= 600, wetOk: wk >= 30 && wk <= 200 };
  }, [w, weightOk, stage, neutered, body, grown, mode, wetPct, dryKcal, wetKcal, canG]);

  const fmt = (n, d = 0) => n.toLocaleString(locale, { maximumFractionDigits: d });
  const useDry = mode !== 'wet';
  const useWet = mode !== 'dry';
  const meals = res ? res.meals : 2;

  return (
    <div className="admin">
      <PageBar title={t('เครื่องคำนวณอาหาร')} />
      <div className="navstrip"><SiteNav /></div>
      <PageHero label="Food Calculator" title={t('คำนวณปริมาณอาหารแมวต่อวัน')} desc={t('กรอกน้ำหนักและช่วงวัยของเจ้านาย แล้วดูว่าควรให้อาหารเม็ดและอาหารเปียกวันละกี่กรัม')} />
      <main className="wrap adminmain calcmain">
        <div className="calc">
          <form className="calcform panel" onSubmit={(e) => e.preventDefault()} aria-label={t('ข้อมูลแมว')}>
            <h2>{t('ข้อมูลแมวของคุณ')}</h2>

            <label className="cfield" htmlFor="c-kg">
              <span>{t('น้ำหนักตัว (กก.)')}</span>
              <input id="c-kg" type="number" inputMode="decimal" min="0.3" max="12" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} aria-invalid={!weightOk} />
              {!weightOk && <em className="cerr" role="alert">{t('กรอกน้ำหนักระหว่าง 0.3 ถึง 12 กก.')}</em>}
            </label>

            <label className="cfield" htmlFor="c-stage">
              <span>{t('ช่วงวัย')}</span>
              <select id="c-stage" value={stage} onChange={(e) => setStage(e.target.value)}>
                {Object.entries(STAGES).map(([id, s]) => <option key={id} value={id}>{t(s.label)}</option>)}
              </select>
            </label>

            {grown && (
              <>
                <fieldset className="cfield cseg">
                  <legend>{t('ทำหมันแล้วหรือยัง')}</legend>
                  <button type="button" aria-pressed={neutered} onClick={() => setNeutered(true)}>{t('ทำหมันแล้ว')}</button>
                  <button type="button" aria-pressed={!neutered} onClick={() => setNeutered(false)}>{t('ยังไม่ทำหมัน')}</button>
                </fieldset>
                <fieldset className="cfield cseg">
                  <legend>{t('รูปร่างของแมว')}</legend>
                  {Object.entries(BODY).map(([id, b]) => (
                    <button key={id} type="button" aria-pressed={body === id} onClick={() => setBody(id)}>{t(b.label)}</button>
                  ))}
                </fieldset>
              </>
            )}

            <h2 className="csub">{t('อาหารที่ให้')}</h2>
            <fieldset className="cfield cseg">
              <legend>{t('ให้อาหารแบบไหน')}</legend>
              <button type="button" aria-pressed={mode === 'dry'} onClick={() => setMode('dry')}>{t('อาหารเม็ดอย่างเดียว')}</button>
              <button type="button" aria-pressed={mode === 'wet'} onClick={() => setMode('wet')}>{t('อาหารเปียกอย่างเดียว')}</button>
              <button type="button" aria-pressed={mode === 'mix'} onClick={() => setMode('mix')}>{t('ผสมทั้งสองแบบ')}</button>
            </fieldset>

            {mode === 'mix' && (
              <label className="cfield" htmlFor="c-mix">
                <span>{t('สัดส่วนพลังงานจากอาหารเปียก: {n}%', { n: wetPct })}</span>
                <input id="c-mix" type="range" min="10" max="90" step="10" value={wetPct} onChange={(e) => setWetPct(Number(e.target.value))} />
              </label>
            )}

            {useDry && (
              <label className="cfield" htmlFor="c-dry">
                <span>{t('พลังงานอาหารเม็ด (kcal ต่อ 100 กรัม)')}</span>
                <input id="c-dry" type="number" inputMode="numeric" min="200" max="600" step="5" value={dryKcal} onChange={(e) => setDryKcal(e.target.value)} />
                {res && !res.dryOk && <em className="cerr">{t('ค่านี้ดูผิดปกติ ตรวจฉลากอีกครั้ง (อาหารเม็ดมักอยู่ราว 300-450)')}</em>}
              </label>
            )}
            {useWet && (
              <>
                <label className="cfield" htmlFor="c-wet">
                  <span>{t('พลังงานอาหารเปียก (kcal ต่อ 100 กรัม)')}</span>
                  <input id="c-wet" type="number" inputMode="numeric" min="30" max="200" step="1" value={wetKcal} onChange={(e) => setWetKcal(e.target.value)} />
                  {res && !res.wetOk && <em className="cerr">{t('ค่านี้ดูผิดปกติ ตรวจฉลากอีกครั้ง (อาหารเปียกมักอยู่ราว 60-110)')}</em>}
                </label>
                <label className="cfield" htmlFor="c-can">
                  <span>{t('น้ำหนักต่อกระป๋องหรือซอง (กรัม)')}</span>
                  <input id="c-can" type="number" inputMode="numeric" min="30" max="400" step="5" value={canG} onChange={(e) => setCanG(e.target.value)} />
                </label>
              </>
            )}
            <p className="note">{t('ดูค่า kcal จากฉลากของสินค้าที่ใช้จริง ค่าเริ่มต้นเป็นแค่ตัวอย่างทั่วไป')}</p>
          </form>

          <section className="calcres panel" aria-live="polite" aria-labelledby="calc-res">
            <h2 id="calc-res">{t('ผลลัพธ์ต่อวัน')}</h2>
            {!res ? (
              <p className="note">{t('กรอกน้ำหนักแมวเพื่อดูผลลัพธ์')}</p>
            ) : (
              <>
                <div className="cbig">
                  <b className="num">{fmt(res.mer)}</b> <span>kcal</span>
                  <small>{t('พลังงานที่แมวต้องการโดยประมาณต่อวัน (พลังงานขณะพัก {rer} kcal × {f})', { rer: fmt(res.rer), f: fmt(res.factor, 2) })}</small>
                </div>
                <ul className="cport">
                  {useDry && (
                    <li>
                      <span>{t('อาหารเม็ด')}</span>
                      <b className="num">{fmt(res.dryG)} {t('กรัม')}</b>
                      <small className="num">{fmt(res.dryKcal)} kcal</small>
                    </li>
                  )}
                  {useWet && (
                    <li>
                      <span>{t('อาหารเปียก')}</span>
                      <b className="num">{fmt(res.wetG)} {t('กรัม')}</b>
                      <small className="num">{fmt(res.wetKcal)} kcal · {t('ประมาณ {n} กระป๋อง/ซอง', { n: fmt(res.cans, 1) })}</small>
                    </li>
                  )}
                </ul>
                <p className="cmeal">
                  {t('แบ่งเป็น {n} มื้อต่อวัน', { n: meals })}:
                  {useDry && <> {t('เม็ด')} <b className="num">{fmt(res.dryG / meals, 1)}</b> {t('กรัม')}</>}
                  {useDry && useWet && ' + '}
                  {useWet && <> {t('เปียก')} <b className="num">{fmt(res.wetG / meals, 1)}</b> {t('กรัม')}</>} {t('ต่อมื้อ')}
                </p>
                <ul className="ctips">
                  <li>{t('ขนมไม่ควรเกินราว 10% ของพลังงานต่อวัน และให้ลดอาหารหลักลงตามจำนวนขนมที่ให้')}</li>
                  <li>{t('ชั่งน้ำหนักแมวทุก 2-4 สัปดาห์ ถ้าน้ำหนักขึ้นหรือลงเกินที่ต้องการ ให้ปรับปริมาณทีละประมาณ 10%')}</li>
                  <li>{t('ต้องมีน้ำสะอาดให้ตลอดเวลา')}</li>
                </ul>
              </>
            )}
            <p className="note artdisc">{t('นี่เป็นค่าประมาณจากสูตรมาตรฐาน แมวแต่ละตัวอาจต่างจากค่าที่คำนวณได้มาก (ได้ถึงราว 50%) ไม่เหมาะกับแมวตั้งท้อง ให้นมลูก แมวป่วย หรือแมวที่ต้องคุมน้ำหนักตามสัตวแพทย์ ให้ปรึกษาสัตวแพทย์เสมอ')}</p>
            <div className="calcnext">
              <Link className="submit" to="/?cat=food">{t('ดูอาหารแมวในร้าน')}</Link>
              <Link className="ghost" to="/articles/how-much-wet-food">{t('อ่านบทความเรื่องปริมาณอาหาร')}</Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
