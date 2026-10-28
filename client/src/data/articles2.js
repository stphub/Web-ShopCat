// บทความชุดที่ 2 (ทรายแมว / อาหารเม็ดกับอาหารเปียก / ดูแลลูกแมว) รูปแบบเดียวกับ articles.js
// ตัวเลขอ้างอิงแนวทางทั่วไปของสถาบันสัตวแพทย์ (เช่น MSD Veterinary Manual, FirstVet, Pet Nutrition Alliance) ไม่ใช่คำวินิจฉัย
// cta = ปุ่มท้ายบทความ (to = ที่ที่จะไป) ถ้าไม่ใส่จะใช้ปุ่มอาหารแมวแบบเดิม
export const ARTICLES2 = [
  {
    slug: 'choose-cat-litter',
    art: 'litter',
    minutes: 5,
    th: {
      title: 'เลือกทรายแมวและกระบะทรายอย่างไรให้ดี',
      desc: 'ชนิดทรายแต่ละแบบต่างกันอย่างไร กระบะควรใหญ่แค่ไหน วางตรงไหน ต้องมีกี่ใบ และควรทำความสะอาดบ่อยแค่ไหน',
      cta: { title: 'เลือกทรายและกระบะให้เจ้านาย', desc: 'ดูทรายแมวและอุปกรณ์ห้องน้ำทั้งหมดในร้าน', label: 'ดูทรายและห้องน้ำแมว', to: '/?cat=litter' },
      sections: [
        {
          h: 'ห้องน้ำที่ดีทำให้แมวไม่ปัสสาวะผิดที่',
          p: [
            'แมวเป็นสัตว์รักความสะอาดและเลือกมาก ถ้ากระบะทรายไม่ถูกใจ แมวอาจเลี่ยงไปปัสสาวะหรืออุจจาระนอกกระบะ ซึ่งเป็นสาเหตุที่คนเลี้ยงแมวปวดหัวบ่อยที่สุดเรื่องหนึ่ง การเลือกทรายและกระบะให้เหมาะตั้งแต่แรกช่วยป้องกันปัญหานี้ได้มาก',
          ],
        },
        {
          h: 'ทรายแมวแต่ละชนิดต่างกันอย่างไร',
          table: {
            head: ['ชนิด', 'จุดเด่น', 'ข้อควรรู้'],
            rows: [
              ['เบนทอไนต์ (ทรายจับก้อน)', 'จับก้อนเร็ว ตักง่าย แมวส่วนใหญ่คุ้นเคยและชอบ', 'ค่อนข้างหนัก มีฝุ่นบางยี่ห้อ ทิ้งลงชักโครกไม่ได้'],
              ['ทรายเต้าหู้', 'เบา ฝุ่นน้อย จับก้อนได้ ย่อยสลายง่าย', 'ราคาสูงกว่า บางยี่ห้อมีกลิ่นอ่อนๆ ที่แมวบางตัวไม่ชอบ'],
              ['ซิลิกาเจล (คริสตัล)', 'ดูดความชื้นและกลิ่นได้ดี ใช้ได้นานต่อรอบ', 'เม็ดแข็งสากเท้า แมวบางตัวไม่ยอมใช้ ต้องตักอุจจาระทุกวัน'],
              ['เม็ดไม้/กระดาษรีไซเคิล', 'ธรรมชาติ ฝุ่นน้อย เหมาะกับแมวที่แพ้ฝุ่น', 'ไม่จับก้อน (บางสูตรแตกเป็นผงเมื่อเปียก) ต้องมีตะแกรงร่อน'],
            ],
          },
          p: ['แมวส่วนใหญ่ชอบทรายเม็ดเล็กละเอียดที่จับก้อน และมักชอบแบบ "ไม่มีกลิ่นหอม" เพราะจมูกของแมวไวกว่าเรามาก กลิ่นน้ำหอมที่เราว่าหอมอาจทำให้แมวไม่อยากเข้า'],
          tip: 'เมื่อแมวคุ้นกับทรายแบบไหนแล้ว การเปลี่ยนชนิดทรายหรือย้ายที่วางกระบะอาจทำให้แมวปัสสาวะนอกกระบะได้ ถ้าจะเปลี่ยนให้ผสมทรายใหม่เข้ากับทรายเดิมทีละน้อยเป็นเวลาหลายวัน',
        },
        {
          h: 'เลือกกระบะ ขนาด และจำนวน',
          ul: [
            'ขนาด: ยิ่งใหญ่ยิ่งดี กระบะควรยาวอย่างน้อยประมาณ 1.5 เท่าของความยาวตัวแมว (วัดจากจมูกถึงโคนหาง) เพื่อให้แมวหมุนตัวและคุ้ยทรายได้สะดวก',
            'จำนวน: ควรมีกระบะ "จำนวนแมวบวกหนึ่ง" เช่น แมว 2 ตัวมี 3 กระบะ ถ้าบ้านมีหลายชั้นให้มีกระบะทุกชั้น',
            'แบบเปิดหรือแบบมีฝาปิด: แบบเปิดระบายอากาศดีและแมวเห็นรอบตัว แบบมีฝาปิดช่วยลดทรายกระเด็นและกลิ่น แต่แมวบางตัวไม่ชอบที่อับ ลองสังเกตว่าแมวชอบแบบไหน',
            'ลูกแมวและแมวสูงวัย: เลือกกระบะที่ขอบเตี้ย ก้าวเข้าออกง่าย โดยเฉพาะแมวที่ปวดข้อ',
          ],
        },
        {
          h: 'วางกระบะไว้ตรงไหน',
          ul: [
            'มุมสงบ คนเดินผ่านน้อย แมวเข้าถึงได้ตลอดเวลา',
            'ห่างจากชามอาหารและน้ำ (แมวไม่ชอบกินข้าวใกล้ห้องน้ำ)',
            'ห่างจากเครื่องซักผ้าหรือเครื่องใช้ที่มีเสียงดัง และไม่ควรซ่อนในที่อับ เช่น ห้องใต้ดินหรือโรงรถ',
          ],
        },
        {
          h: 'ทำความสะอาดบ่อยแค่ไหน',
          ol: [
            'ตักก้อนปัสสาวะและอุจจาระออกทุกวัน (ถ้าเป็นไปได้วันละ 1-2 ครั้ง)',
            'เทเปลี่ยนทรายใหม่ทั้งกระบะและล้างกระบะด้วยน้ำกับสบู่อ่อนๆ อย่างน้อยสัปดาห์ละครั้ง ถ้ามีแมวหลายตัวใช้กระบะเดียวกันต้องเปลี่ยนถี่ขึ้น',
            'หลีกเลี่ยงน้ำยาที่มีกลิ่นแรง เช่น แอมโมเนีย หรือน้ำยาฟอกขาว เพราะกลิ่นฉุนทำให้แมวไม่อยากเข้า',
            'กระบะที่เก่าแล้วมีรอยขีดข่วนเก็บกลิ่นได้ ควรเปลี่ยนใบใหม่',
          ],
        },
        {
          h: 'เมื่อไรควรพบสัตวแพทย์',
          p: ['ถ้าแมวที่เคยใช้กระบะได้ดีเริ่มปัสสาวะหรืออุจจาระนอกกระบะ ปัสสาวะบ่อยแต่ออกน้อย ร้องเจ็บเวลาปัสสาวะ หรือปัสสาวะมีเลือด อาจเป็นสัญญาณของโรคทางเดินปัสสาวะหรือความเครียด โดยเฉพาะแมวตัวผู้ที่ปัสสาวะไม่ออกถือเป็นภาวะฉุกเฉิน ให้พาไปพบสัตวแพทย์ทันที'],
        },
      ],
    },
    en: {
      title: 'How to Choose Cat Litter and a Litter Box',
      desc: 'How the litter types differ, how big the box should be, where to put it, how many you need, and how often to clean.',
      cta: { title: 'Pick litter and a box for your boss', desc: 'Browse all litter and bathroom supplies in the shop', label: 'Shop litter and litter boxes', to: '/?cat=litter' },
      sections: [
        {
          h: 'A good bathroom keeps accidents away',
          p: [
            'Cats are clean and picky. If the box or litter is not to their liking, they may avoid it and go elsewhere, which is one of the most common headaches for cat owners. Choosing the right litter and box from the start prevents most of these problems.',
          ],
        },
        {
          h: 'How the litter types differ',
          table: {
            head: ['Type', 'Strengths', 'Good to know'],
            rows: [
              ['Bentonite (clumping clay)', 'Clumps fast, easy to scoop, familiar to most cats', 'Fairly heavy, some brands are dusty, cannot be flushed'],
              ['Tofu litter', 'Light, low dust, clumps, breaks down easily', 'Costs more; the mild scent of some brands puts certain cats off'],
              ['Silica gel (crystals)', 'Absorbs moisture and odour well, lasts long', 'Hard granules feel rough on paws; some cats refuse it; still scoop daily'],
              ['Wood pellets / recycled paper', 'Natural, low dust, good for dust-sensitive cats', 'Does not clump (some pellets crumble when wet) so you need a sifting scoop'],
            ],
          },
          p: ['Most cats prefer fine, clumping litter, and usually unscented. A cat’s nose is far more sensitive than ours, so a perfume we find pleasant can keep a cat out of the box.'],
          tip: 'Once a cat is used to a litter, changing the type or moving the box can lead to accidents. If you must change, mix the new litter into the old a little at a time over several days.',
        },
        {
          h: 'Choosing the box, its size and how many',
          ul: [
            'Size: bigger is better. A box should be about 1.5 times the length of your cat (nose to base of tail) so the cat can turn around and dig comfortably.',
            'Number: keep one more box than you have cats. Two cats means three boxes. In a multi-storey home, put a box on every floor.',
            'Open or covered: open boxes ventilate well and let the cat see around. Covered boxes reduce scatter and odour but some cats dislike enclosed spaces, so watch which one yours prefers.',
            'Kittens and senior cats: choose a box with a low entry so it is easy to step in and out, especially for cats with sore joints.',
          ],
        },
        {
          h: 'Where to put it',
          ul: [
            'A quiet corner with little foot traffic that the cat can always reach',
            'Away from food and water bowls (cats dislike eating near their toilet)',
            'Away from washing machines and noisy appliances, and not hidden in cramped places such as a basement or garage',
          ],
        },
        {
          h: 'How often to clean',
          ol: [
            'Scoop clumps and stools out every day (once or twice a day if you can).',
            'Empty the whole box, wash it with mild soap and water, and refill with fresh litter at least once a week. Change more often if several cats share one box.',
            'Avoid strong-smelling cleaners such as ammonia or bleach, because the sharp smell keeps cats away.',
            'Replace old boxes. Scratches in the plastic hold odours.',
          ],
        },
        {
          h: 'When to see a vet',
          p: ['If a cat that used the box well starts going outside it, strains or passes only a little urine, cries while urinating, or has blood in the urine, it may be a urinary problem or stress. A male cat that cannot pass urine is an emergency. See a vet immediately.'],
        },
      ],
    },
  },
  {
    slug: 'dry-vs-wet-food',
    art: 'duo',
    minutes: 5,
    th: {
      title: 'อาหารเม็ดกับอาหารเปียกต่างกันอย่างไร',
      desc: 'เปรียบเทียบความชื้น พลังงาน ราคา และความสะดวก พร้อมวิธีให้แบบผสมโดยไม่ให้เจ้านายอ้วน',
      sections: [
        {
          h: 'ต่างกันที่น้ำ พลังงาน และราคา',
          table: {
            head: ['เรื่อง', 'อาหารเม็ด', 'อาหารเปียก'],
            rows: [
              ['ความชื้น', 'น้อย (ราว 6-10% ตามฉลากส่วนใหญ่)', 'มาก (ราว 75-82% สำหรับกระป๋องและซองส่วนใหญ่)'],
              ['พลังงานต่อน้ำหนัก', 'สูง (มักราว 350-400 kcal ต่อ 100 กรัม)', 'ต่ำกว่าเพราะมีน้ำมาก (มักราว 70-100 kcal ต่อ 100 กรัม)'],
              ['ราคา', 'ประหยัดกว่า', 'แพงกว่า'],
              ['การเก็บ', 'เปิดแล้วเก็บได้นาน ปิดซองให้สนิท', 'เปิดแล้วต้องแช่เย็นและใช้ภายใน 3 วัน'],
              ['ความสะดวก', 'ตวงง่าย วางไว้ได้ (แต่ระวังกินเกิน)', 'ต้องแบ่งมื้อและล้างชามบ่อย'],
            ],
          },
          tip: 'ตัวเลขพลังงานและความชื้นต่างกันมากระหว่างยี่ห้อและสูตร ให้ดู kcal และค่าความชื้นบนฉลากของสินค้าที่ใช้จริงเสมอ',
        },
        {
          h: 'ข้อดีของอาหารเปียก',
          ul: [
            'ให้น้ำเพิ่ม ช่วยให้แมวที่ดื่มน้ำน้อยได้รับน้ำมากขึ้น งานศึกษาพบว่าแมวที่กินอาหารเปียกล้วนดื่มน้ำรวมมากกว่าและปัสสาวะเจือจางกว่าแมวที่กินอาหารเม็ด จึงมักถูกแนะนำเสริมในแมวที่เสี่ยงปัญหาทางเดินปัสสาวะ',
            'พลังงานต่อกรัมต่ำกว่า กินได้ปริมาณมากขึ้นโดยพลังงานไม่สูงเกิน เหมาะกับแมวที่ต้องคุมน้ำหนัก',
            'เนื้อนุ่ม เคี้ยวง่าย เหมาะกับลูกแมว แมวสูงวัย และแมวที่ฟันไม่ดี',
            'กลิ่นและรสน่ากิน ช่วยแมวที่เบื่ออาหารหรือเลือกกิน',
          ],
        },
        {
          h: 'ข้อดีของอาหารเม็ด',
          ul: [
            'ประหยัด ซื้อถุงใหญ่ได้และเก็บได้นาน',
            'สะดวก ตวงง่าย เหมาะกับคนที่ไม่อยู่บ้านหลายชั่วโมง และใช้กับของเล่นให้อาหารได้',
            'เก็บได้หลายชั่วโมงโดยไม่บูดเร็วเท่าอาหารเปียก',
          ],
          p: ['ข้อควรระวังคือการวางอาหารเม็ดให้กินตลอดวัน (free feeding) ทำให้แมวกินเกินได้ง่ายและอ้วน ควรตวงเป็นมื้อตามพลังงานที่แมวต้องการต่อวัน'],
        },
        {
          h: 'ให้แบบผสมดีไหม',
          p: [
            'ได้ และเป็นวิธีที่ครอบครัวแมวหลายบ้านเลือกใช้ เพราะได้ทั้งน้ำจากอาหารเปียก ความประหยัดและสะดวกจากอาหารเม็ด และแมวได้ลองเนื้อสัมผัสหลายแบบ',
            'ข้อสำคัญคือต้อง "แบ่งพลังงานต่อวัน" ไม่ใช่ให้เต็มทั้งสองอย่าง ตัวอย่างเช่น ถ้าแมวต้องการ 200 kcal ต่อวัน อาจให้อาหารเปียก 100 kcal และอาหารเม็ด 100 kcal ใช้เครื่องคำนวณปริมาณอาหารของร้านช่วยแบ่งสัดส่วนได้',
          ],
          ol: [
            'หาพลังงานที่แมวต้องการต่อวันจากน้ำหนักและช่วงวัย',
            'เลือกสัดส่วน เช่น เปียกครึ่งหนึ่ง เม็ดครึ่งหนึ่ง',
            'แปลงเป็นกรัมตามค่า kcal บนฉลากของแต่ละผลิตภัณฑ์',
            'ชั่งน้ำหนักแมวทุก 2-4 สัปดาห์ แล้วปรับปริมาณตามผลจริง',
          ],
        },
        {
          h: 'แล้วควรเลือกแบบไหน',
          p: ['ไม่มีคำตอบเดียวที่ถูกสำหรับแมวทุกตัว ขึ้นกับสุขภาพ อายุ น้ำหนัก ความชอบของแมว และงบของบ้าน สัตวแพทย์อาจแนะนำเน้นอาหารเม็ด เน้นอาหารเปียก หรือผสมกันตามสภาพของแมวแต่ละตัว ถ้าแมวมีโรคประจำตัวหรือกำลังคุมน้ำหนัก ควรปรึกษาสัตวแพทย์ก่อนปรับอาหาร'],
        },
      ],
    },
    en: {
      title: 'Dry vs Wet Cat Food: What’s the Difference?',
      desc: 'Moisture, energy, cost and convenience compared, plus how to feed both without making your cat overweight.',
      sections: [
        {
          h: 'The differences: water, energy and price',
          table: {
            head: ['Topic', 'Dry food', 'Wet food'],
            rows: [
              ['Moisture', 'Low (about 6–10% on most labels)', 'High (about 75–82% for most cans and pouches)'],
              ['Energy by weight', 'High (often about 350–400 kcal per 100 g)', 'Lower because of the water (often about 70–100 kcal per 100 g)'],
              ['Cost', 'More economical', 'More expensive'],
              ['Storage', 'Keeps well once opened; seal the bag tightly', 'Once opened, refrigerate and use within 3 days'],
              ['Convenience', 'Easy to measure and leave out (but easy to overfeed)', 'Needs portioning and frequent bowl washing'],
            ],
          },
          tip: 'Energy and moisture figures vary widely between brands and recipes. Always read the kcal and moisture on the label of the product you actually use.',
        },
        {
          h: 'Benefits of wet food',
          ul: [
            'Extra water. It helps cats that drink little take in more. Studies have found that cats on an all-wet diet take in more total water and produce more dilute urine than cats on dry food, which is why wet food is often suggested for cats at risk of urinary problems.',
            'Fewer calories per gram, so a cat can eat a bigger portion without too much energy. Good for cats that need weight control.',
            'Soft and easy to chew, suitable for kittens, seniors and cats with poor teeth.',
            'Strong smell and taste, which helps cats that are picky or off their food.',
          ],
        },
        {
          h: 'Benefits of dry food',
          ul: [
            'Economical. You can buy big bags and they keep for a long time.',
            'Convenient. Easy to measure, good for people who are away for hours, and works in food puzzle toys.',
            'It can sit out for hours without spoiling as fast as wet food.',
          ],
          p: ['The caution is that leaving dry food out all day (free feeding) makes it easy for cats to overeat and gain weight. Measure meals by the energy your cat needs per day.'],
        },
        {
          h: 'Is mixing a good idea?',
          p: [
            'Yes, and many cat households do it. You get the water from wet food, the economy and convenience of dry food, and your cat enjoys different textures.',
            'The key is to split the daily energy, not to give a full portion of both. For example, if a cat needs 200 kcal a day, you might give 100 kcal of wet food and 100 kcal of dry. The shop’s daily food calculator can help you split it.',
          ],
          ol: [
            'Work out the energy your cat needs per day from weight and life stage.',
            'Choose a split, for example half wet and half dry.',
            'Convert to grams using the kcal on each product’s label.',
            'Weigh your cat every 2–4 weeks and adjust to the real result.',
          ],
        },
        {
          h: 'So which should you choose?',
          p: ['There is no single right answer for every cat. It depends on health, age, weight, your cat’s preference and your budget. A vet may suggest mostly dry, mostly wet or a mix depending on the individual cat. If your cat has a medical condition or is on a weight plan, talk to a vet before changing the diet.'],
        },
      ],
    },
  },
  {
    slug: 'kitten-care',
    art: 'kitten',
    minutes: 6,
    th: {
      title: 'ดูแลลูกแมวเมื่อเริ่มเลี้ยงครั้งแรก',
      desc: 'ตารางมื้ออาหารตามอายุ วัคซีนและถ่ายพยาธิ การฝึกใช้กระบะทราย การเตรียมบ้าน และอาการที่ควรพาไปหาหมอ',
      cta: { title: 'เตรียมของให้ลูกแมวตัวใหม่', desc: 'อาหารลูกแมว ทรายและกระบะ ของเล่น และที่นอนนุ่ม ๆ', label: 'ดูสินค้าทั้งหมดในร้าน', to: '/' },
      sections: [
        {
          h: 'ก่อนพากลับบ้าน',
          ul: [
            'ลูกแมวควรอยู่กับแม่และพี่น้องจนอายุประมาณ 8-12 สัปดาห์ ส่วนใหญ่หย่านมได้เมื่ออายุราว 6-8 สัปดาห์',
            'เตรียมของที่จำเป็น: อาหารลูกแมว ชามอาหารและน้ำ กระบะทรายและทรายแมว ที่นอนหรือกล่องกระดาษนุ่มๆ ที่ลับเล็บ ของเล่น และกรงหรือกระเป๋าเดินทางสำหรับพาไปหาหมอ',
            'ตรวจสอบบ้านให้ปลอดภัย เก็บสายไฟ ยา สารเคมี และของชิ้นเล็กที่กลืนได้ และปิดช่องที่ลูกแมวมุดเข้าไปติดได้',
          ],
        },
        {
          h: 'ให้อาหารกี่มื้อ',
          table: {
            head: ['อายุ', 'จำนวนมื้อต่อวัน'],
            rows: [
              ['ถึงประมาณ 4 เดือน', 'อย่างน้อย 3-4 มื้อ'],
              ['ประมาณ 4-6 เดือน', '2-3 มื้อ'],
              ['หลัง 6 เดือน', '2 มื้อ'],
            ],
          },
          p: [
            'เลือกอาหารที่ระบุว่าสำหรับลูกแมว (kitten) หรือทุกช่วงวัย เพราะมีโปรตีนและพลังงานสูงกว่าสำหรับการเติบโต ช่วงแรกที่บ้านใหม่ให้ใช้อาหารเดิมที่ลูกแมวเคยกินอย่างน้อยสัปดาห์แรก แล้วค่อยๆ เปลี่ยนเป็นอาหารใหม่ภายใน 7-10 วัน',
            'ใช้เครื่องคำนวณปริมาณอาหารของร้านช่วยประมาณปริมาณต่อวันตามน้ำหนักและช่วงวัยของลูกแมวได้',
          ],
        },
        {
          h: 'วัคซีน ถ่ายพยาธิ และกำจัดหมัด',
          ul: [
            'วัคซีน: ฉีดครั้งแรกประมาณ 6-8 สัปดาห์ เข็มต่อไปห่างกัน 3-4 สัปดาห์ และกระตุ้นต่อเนื่องจนอายุประมาณ 16-18 สัปดาห์ จากนั้นกระตุ้นปีละครั้งตามไลฟ์สไตล์ ให้สัตวแพทย์เป็นผู้กำหนดตารางที่เหมาะกับลูกแมวของคุณ',
            'ถ่ายพยาธิ: ลูกแมวมักได้รับยาถ่ายพยาธิทุก 2 สัปดาห์ตั้งแต่อายุราว 3 สัปดาห์จนถึง 12 สัปดาห์ แล้วสัตวแพทย์จะแนะนำต่อ',
            'หมัดและเห็บ: ใช้ผลิตภัณฑ์ที่ระบุว่าใช้กับลูกแมวได้ตามอายุและน้ำหนัก ห้ามใช้ยาของสุนัขกับแมวเด็ดขาด เพราะอาจเป็นพิษ',
            'ทำหมัน: ปรึกษาสัตวแพทย์เรื่องอายุที่เหมาะสม ซึ่งมักอยู่ในช่วงประมาณ 4-6 เดือนขึ้นไปตามน้ำหนักและสุขภาพ',
          ],
          tip: 'อายุและตารางข้างต้นเป็นแนวทางทั่วไป แต่ละคลินิกอาจต่างกันเล็กน้อย ให้ยึดตามที่สัตวแพทย์ของลูกแมวแนะนำ',
        },
        {
          h: 'ฝึกใช้กระบะทราย',
          ol: [
            'วางกระบะในมุมสงบที่ลูกแมวเข้าถึงง่าย ห่างจากชามอาหาร เลือกกระบะขอบเตี้ยให้ก้าวเข้าได้สบาย',
            'หลังกินอาหารหรือตื่นนอน ให้พาลูกแมวไปวางในกระบะ ลูกแมวส่วนใหญ่เรียนรู้ได้เร็วเพราะสัญชาตญาณขุดทราย',
            'ตักก้อนทุกวัน และเปลี่ยนทรายทั้งกระบะอย่างน้อยสัปดาห์ละครั้ง',
            'ถ้าลูกแมวพลาด อย่าดุหรือทำโทษ เพียงทำความสะอาดจุดนั้นแล้วพาไปที่กระบะใหม่',
          ],
          p: ['อ่านเพิ่มเติมที่บทความ "เลือกทรายแมวและกระบะทรายอย่างไรให้ดี"'],
        },
        {
          h: 'ทำความคุ้นเคยและเล่นกับลูกแมว',
          ul: [
            'ให้ลูกแมวเป็นฝ่ายเข้าหาตามจังหวะของตัวเอง ไม่บังคับอุ้ม และไม่ปลุกตอนที่กำลังหลับ',
            'วางที่ซ่อนที่ปลอดภัยให้ เช่น กล่องกระดาษหรือเต็นท์ เพราะลูกแมวต้องการที่หลบเมื่อตื่นกลัว',
            'เล่นด้วยไม้ตกแมวหรือของเล่นทุกวัน อย่าใช้มือหรือนิ้วเป็นของเล่น เพื่อไม่ให้ติดนิสัยกัดมือ',
            'ช่วงอายุแรกๆ เป็นช่วงสำคัญของการเรียนรู้สังคม การได้เจอผู้คนและเสียงต่างๆ อย่างอ่อนโยนช่วยให้โตมามั่นใจ',
            'ลูกแมวเปลี่ยนฟันน้ำนมเป็นฟันแท้ราว 3-6 เดือน อาจคันเหงือกและกัดของมากขึ้น เตรียมของเล่นสำหรับกัดไว้',
          ],
        },
        {
          h: 'อาการที่ควรพาไปหาสัตวแพทย์',
          ul: [
            'อาเจียนหรือท้องเสียซ้ำๆ โดยเฉพาะหลังเปลี่ยนอาหาร',
            'ซึม ไม่กินอาหาร หรือน้ำหนักไม่ขึ้น',
            'ตัวสั่น กระตุก หรือชัก (อาจเกิดหลังได้รับยากำจัดหมัดที่ไม่เหมาะ)',
            'หายใจลำบาก ไอ จาม มีน้ำมูกหรือน้ำตาขุ่น',
            'ไม่ปัสสาวะหรืออุจจาระ หรือถ่ายเป็นเลือด',
          ],
          p: ['ลูกแมวตัวเล็กอาการแย่ลงเร็วกว่าแมวโต ถ้าไม่แน่ใจ ให้ติดต่อสัตวแพทย์เร็วไว้ก่อน'],
        },
      ],
    },
    en: {
      title: 'Caring for Your First Kitten',
      desc: 'Meals by age, vaccines and deworming, litter training, kitten-proofing your home, and the signs that need a vet.',
      cta: { title: 'Get ready for your new kitten', desc: 'Kitten food, litter and boxes, toys and soft beds', label: 'Browse the whole shop', to: '/' },
      sections: [
        {
          h: 'Before you bring them home',
          ul: [
            'A kitten should stay with its mother and littermates until about 8–12 weeks old. Most kittens are weaned by about 6–8 weeks.',
            'Get the essentials: kitten food, food and water bowls, a litter box and litter, a soft bed or cardboard box, a scratching post, toys, and a carrier for vet trips.',
            'Kitten-proof your home. Put away cords, medicines, chemicals and small objects that can be swallowed, and block gaps where a kitten could get stuck.',
          ],
        },
        {
          h: 'How many meals a day',
          table: {
            head: ['Age', 'Meals per day'],
            rows: [
              ['Up to about 4 months', 'At least 3–4 meals'],
              ['About 4–6 months', '2–3 meals'],
              ['After 6 months', '2 meals'],
            ],
          },
          p: [
            'Choose food labelled for kittens or for all life stages, which has more protein and energy for growth. For the first week in the new home, keep using the food the kitten was eating before, then change to the new food gradually over 7–10 days.',
            'The shop’s daily food calculator can estimate the amount per day for your kitten’s weight and life stage.',
          ],
        },
        {
          h: 'Vaccines, deworming and fleas',
          ul: [
            'Vaccines: the first dose at about 6–8 weeks, then every 3–4 weeks with boosters until about 16–18 weeks, then a yearly booster depending on lifestyle. Let your vet set the schedule that suits your kitten.',
            'Deworming: kittens are often dewormed every 2 weeks from about 3 weeks of age up to 12 weeks, and your vet will advise after that.',
            'Fleas and ticks: use a product labelled safe for kittens of their age and weight. Never use dog flea products on cats, because they can be toxic.',
            'Neutering: ask your vet about the best age, which is often from around 4–6 months depending on weight and health.',
          ],
          tip: 'The ages above are general guidance and clinics differ slightly. Follow what your kitten’s vet recommends.',
        },
        {
          h: 'Litter training',
          ol: [
            'Put the box in a quiet corner that is easy to reach, away from the food bowl. Pick a low-sided box that is easy to step into.',
            'After meals and after waking, place the kitten in the box. Most kittens learn quickly because digging in litter is instinctive.',
            'Scoop every day and change all the litter at least once a week.',
            'If the kitten has an accident, do not scold or punish. Just clean the spot and carry the kitten to the box.',
          ],
          p: ['Read more in the article “How to Choose Cat Litter and a Litter Box”.'],
        },
        {
          h: 'Getting used to you, and play',
          ul: [
            'Let the kitten come to you at its own pace. Do not force cuddles or wake a sleeping kitten.',
            'Provide safe hiding places such as a cardboard box or tent, because kittens need somewhere to retreat when scared.',
            'Play every day with a wand toy or toys. Do not use hands or fingers as toys, or the kitten learns to bite hands.',
            'The early weeks are an important time for social learning. Gentle exposure to people and sounds helps a kitten grow up confident.',
            'Kittens swap baby teeth for adult teeth at about 3–6 months and may chew more because of sore gums. Keep chew toys handy.',
          ],
        },
        {
          h: 'Signs that need a vet',
          ul: [
            'Repeated vomiting or diarrhoea, especially after a diet change',
            'Lethargy, not eating, or not gaining weight',
            'Tremors, twitching or seizures (which can follow an unsuitable flea product)',
            'Trouble breathing, coughing, sneezing, or a runny nose or cloudy eyes',
            'Not urinating or passing stool, or blood in the stool',
          ],
          p: ['Small kittens get worse faster than adult cats. If you are unsure, contact a vet early.'],
        },
      ],
    },
  },
];
