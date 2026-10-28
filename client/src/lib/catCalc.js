// คำนวณพลังงานที่แมวต้องการต่อวัน (ค่าประมาณ ไม่ใช่การวินิจฉัย)
// RER (พลังงานขณะพัก) = 70 x น้ำหนัก(กก.)^0.75
// MER (พลังงานที่ต้องการจริง) = ตัวคูณตามช่วงวัย x RER อ้างอิงตัวคูณช่วงของ Pet Nutrition Alliance (MER/RER):
//   ลูกแมว 2-3 เท่า (สูงสุดตอนเล็กและลดลงจนอายุราว 4 เดือน) | แมวโตทำหมันแล้ว 1.2 | แมวโตยังไม่ทำหมัน 1.4 | แมวโตอ้วนง่าย/ขยับน้อย 1.0
// เอกสารเดียวกันระบุว่าแต่ละตัวต่างจากค่าที่คำนวณได้ถึง 50% จึงต้องชั่งน้ำหนักและปรับตามผลจริง
export const STAGES = {
  kitten4: { factor: 2.5, label: 'ลูกแมวอายุไม่เกิน 4 เดือน', meals: 4 }, // กลางช่วง 2-3 เท่า
  kitten12: { factor: 2.0, label: 'ลูกแมวอายุ 4-12 เดือน', meals: 3 },
  adult: { factor: null, label: 'แมวโต (1-7 ปี)', meals: 2 },
  senior: { factor: null, label: 'แมวสูงวัย (7 ปีขึ้นไป)', meals: 2 },
};

export const BODY = {
  ideal: { label: 'รูปร่างพอดี', adj: 1 },
  over: { label: 'ค่อนข้างอ้วน', adj: 1 },
  thin: { label: 'ค่อนข้างผอม', adj: 1.15 },
};

export function dailyEnergy({ kg, stage, neutered, body }) {
  if (!(kg > 0)) return null;
  const rer = 70 * Math.pow(kg, 0.75);
  const st = STAGES[stage] || STAGES.adult;
  const grown = stage === 'adult' || stage === 'senior';
  let factor = st.factor;
  if (grown) {
    factor = neutered ? 1.2 : 1.4;
    if (body === 'over') factor = 1.0; // อ้วนง่าย/ขยับน้อย
  }
  let mer = rer * factor;
  if (grown && body === 'thin') mer *= BODY.thin.adj; // แมวผอม เพิ่มให้เล็กน้อย (ควรพบสัตวแพทย์)
  return { rer, factor, mer, meals: st.meals };
}

// แบ่งพลังงานระหว่างอาหารเม็ดกับอาหารเปียก wetShare = สัดส่วนพลังงานจากอาหารเปียก (0-1)
export function portions({ mer, wetShare, dryKcal100, wetKcal100, canG }) {
  const wetKcal = mer * wetShare;
  const dryKcal = mer - wetKcal;
  const dryG = dryKcal100 > 0 ? (dryKcal / dryKcal100) * 100 : 0;
  const wetG = wetKcal100 > 0 ? (wetKcal / wetKcal100) * 100 : 0;
  return { dryKcal, wetKcal, dryG, wetG, cans: canG > 0 ? wetG / canG : 0 };
}
