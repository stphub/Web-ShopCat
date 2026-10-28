// บทความดูแลแมว: แต่ละเรื่องมีทั้งภาษาไทย (th) และอังกฤษ (en) ในที่เดียว หน้าเว็บเลือกตามปุ่มสลับภาษา
// โครงของแต่ละหัวข้อ (sections): h = หัวข้อ, p = ย่อหน้า, ul/ol = รายการ, table = { head, rows }, tip = กล่องเคล็ดลับ
// ข้อมูลเป็นแนวทางทั่วไป อ้างอิงคำแนะนำของสถาบันสัตวแพทย์ (เช่น Cornell Feline Health Center, VCA) ไม่ใช่คำวินิจฉัยของสัตวแพทย์
import { ARTICLES2 } from './articles2';

export const ARTICLES = [
  {
    slug: 'choose-wet-food',
    art: 'can',
    minutes: 5,
    th: {
      title: 'เลือกอาหารเปียกอย่างไรให้ดี',
      desc: 'อ่านฉลากให้เป็น เลือกเนื้อสัมผัสให้ถูกใจเจ้านาย เปลี่ยนอาหารใหม่อย่างไรไม่ให้ท้องเสีย และเก็บอย่างไรให้ปลอดภัย',
      sections: [
        {
          h: 'ทำไมแมวถึงควรได้กินอาหารเปียก',
          p: [
            'แมวเป็นสัตว์กินเนื้อ และดื่มน้ำเองค่อนข้างน้อย อาหารเปียกมีน้ำอย่างน้อยประมาณ 75% จึงช่วยให้แมวได้รับน้ำเพิ่มโดยไม่ต้องรอให้เดินไปกินเอง ส่วนอาหารเม็ดมีน้ำเพียง 6-10%',
            'แมวหลายตัวกินแบบผสมได้ดี คือเปียกบางมื้อ เม็ดบางมื้อ ขึ้นกับความชอบและงบของบ้านคุณ ไม่จำเป็นต้องเลือกอย่างใดอย่างหนึ่ง',
          ],
        },
        {
          h: 'อ่านฉลากให้เป็น 5 ข้อ',
          ol: [
            'ดูว่าเป็นอาหารที่ "ครบถ้วนและสมดุล" (complete and balanced) และระบุช่วงวัยที่เหมาะสม เช่น ลูกแมว แมวโต หรือทุกช่วงวัย ส่วนอาหารที่เขียนว่าเป็นอาหารเสริม ขนม หรือ complementary ใช้เป็นมื้อหลักไม่ได้',
            'ดูส่วนผสมอันดับแรก ควรเป็นเนื้อสัตว์ที่ระบุชนิดชัดเจน เช่น เนื้อไก่ ปลาทูน่า มากกว่าคำกว้างๆ อย่าง "เนื้อสัตว์"',
            'ดูตาราง Guaranteed Analysis (ค่าวิเคราะห์) ว่ามีความชื้น โปรตีน และไขมันเท่าไร อาหารเปียกส่วนใหญ่มีความชื้นราว 75-82%',
            'ตรวจว่าไม่มีหัวหอมหรือกระเทียมในส่วนผสม เพราะเป็นพิษกับแมว',
            'ดูพลังงานต่อกระป๋องหรือซอง (kcal) ไว้คำนวณปริมาณที่ให้ต่อวัน อ่านเรื่องนี้ต่อในบทความ "แมวควรกินอาหารเปียกวันละเท่าไหร่"',
          ],
        },
        {
          h: 'เนื้อสัมผัสแบบไหนเหมาะกับแมวของคุณ',
          table: {
            head: ['แบบ', 'ลักษณะ', 'เหมาะกับ'],
            rows: [
              ['มูส/ปาเต้', 'เนื้อเนียนนุ่ม ตักง่าย', 'ลูกแมว แมวฟันไม่ดี แมวสูงวัย'],
              ['ชิ้นในน้ำเกรวี่/เยลลี่', 'ชิ้นเนื้อเล็กๆ ในน้ำซุปหรือเยลลี่', 'แมวที่ชอบเลียน้ำซุป และแมวที่ต้องการน้ำเพิ่ม'],
              ['ซุปหรือน้ำเปล่า (ทอปปิ้ง)', 'ของเหลวเป็นหลัก เนื้อน้อย', 'เสริมน้ำหรือราดบนอาหารอื่น ไม่ควรใช้เป็นมื้อหลักถ้าฉลากไม่บอกว่าครบถ้วนสมดุล'],
            ],
          },
          p: ['แมวแต่ละตัวชอบไม่เหมือนกัน ลองซื้อซองหรือกระป๋องเล็กชิมก่อนทีละรส อย่าซื้อทีละลังจนกว่าจะแน่ใจว่าเจ้านายกิน'],
        },
        {
          h: 'เปลี่ยนอาหารใหม่ให้ค่อยๆ เปลี่ยน',
          p: ['การเปลี่ยนอาหารกะทันหันทำให้แมวท้องเสียหรืออาเจียนได้ แนะนำให้ผสมอาหารใหม่เข้ากับอาหารเดิมแล้วเพิ่มสัดส่วนทีละน้อยในเวลาประมาณ 7-10 วัน'],
          table: {
            head: ['วัน', 'อาหารเดิม', 'อาหารใหม่'],
            rows: [
              ['1-3', '75%', '25%'],
              ['4-6', '50%', '50%'],
              ['7-9', '25%', '75%'],
              ['วันที่ 10', '0%', '100%'],
            ],
          },
          tip: 'ถ้าแมวถ่ายเหลวหรืออาเจียนระหว่างเปลี่ยน ให้กลับไปสัดส่วนก่อนหน้า และพบสัตวแพทย์ถ้าอาการไม่ดีขึ้น',
        },
        {
          h: 'เก็บและเสิร์ฟอย่างปลอดภัย',
          ul: [
            'อาหารเปียกที่เปิดแล้วและยังไม่ได้ใช้ ให้ปิดฝาแล้วเก็บในตู้เย็น (ตั้งไว้ที่ 4°C หรือต่ำกว่า) และใช้ให้หมดภายใน 3 วัน',
            'อาหารที่ตักใส่ชามแล้ววางที่อุณหภูมิห้อง ไม่ควรวางทิ้งเกินประมาณ 4 ชั่วโมง ยิ่งอากาศร้อนยิ่งควรเก็บเร็วขึ้น และไม่ควรวางทิ้งข้ามคืน',
            'ถ้านำออกจากตู้เย็น ให้ทิ้งไว้ให้หายเย็นจัดสักครู่ก่อนเสิร์ฟ แมวมักชอบอาหารที่ไม่เย็นจัด',
            'ล้างชามทุกครั้งหลังกิน และมีน้ำสะอาดวางไว้ให้เสมอ',
          ],
        },
      ],
    },
    en: {
      title: 'How to Choose a Good Wet Food',
      desc: 'Read the label with confidence, pick a texture your cat will love, switch foods without tummy trouble, and store it safely.',
      sections: [
        {
          h: 'Why cats benefit from wet food',
          p: [
            'Cats are carnivores and tend to drink little water on their own. Wet food is at least about 75% water, so it adds moisture to your cat’s day, while dry food contains only 6–10%.',
            'Many cats do well on a mix: wet food at some meals and dry at others, depending on their taste and your budget. You do not have to choose only one.',
          ],
        },
        {
          h: '5 things to check on the label',
          ol: [
            'Look for “complete and balanced” and a life stage that fits, such as kitten, adult or all life stages. Foods labelled as supplemental, treats or complementary should not be the main meal.',
            'Check the first ingredient. A clearly named meat such as chicken or tuna is better than a vague term like “meat”.',
            'Read the Guaranteed Analysis for moisture, protein and fat. Most wet foods have around 75–82% moisture.',
            'Make sure there is no onion or garlic in the ingredients, as both are toxic to cats.',
            'Note the energy per can or pouch (kcal) so you can work out the daily portion. See the article “How Much Wet Food Should a Cat Eat Per Day”.',
          ],
        },
        {
          h: 'Which texture suits your cat?',
          table: {
            head: ['Type', 'What it is', 'Good for'],
            rows: [
              ['Mousse / pâté', 'Smooth, soft and easy to scoop', 'Kittens, cats with sensitive teeth, senior cats'],
              ['Chunks in gravy / jelly', 'Small pieces of meat in broth or jelly', 'Cats who love licking the sauce and cats who need extra water'],
              ['Broth or toppers', 'Mostly liquid with little meat', 'Adding moisture or topping other food. Not a main meal unless the label says complete and balanced'],
            ],
          },
          p: ['Every cat has its own taste. Try a small pouch or can of each flavour first and avoid buying a whole case until you know your boss will eat it.'],
        },
        {
          h: 'Switch foods slowly',
          p: ['Changing food suddenly can cause diarrhoea or vomiting. Mix the new food into the old one and increase the share gradually over about 7–10 days.'],
          table: {
            head: ['Day', 'Old food', 'New food'],
            rows: [
              ['1–3', '75%', '25%'],
              ['4–6', '50%', '50%'],
              ['7–9', '25%', '75%'],
              ['Day 10', '0%', '100%'],
            ],
          },
          tip: 'If your cat gets loose stools or vomits during the switch, go back to the previous ratio, and see a vet if it does not improve.',
        },
        {
          h: 'Store and serve it safely',
          ul: [
            'Cover opened wet food and keep it in the fridge (4°C or below). Use it within 3 days.',
            'Food served in a bowl at room temperature should not sit out for more than about 4 hours. The hotter the weather, the sooner you should clear it, and never leave it overnight.',
            'If it comes from the fridge, let it lose the chill for a moment before serving. Cats usually prefer food that is not ice cold.',
            'Wash the bowl after every meal and always keep fresh water available.',
          ],
        },
      ],
    },
  },
  {
    slug: 'how-much-wet-food',
    art: 'bowl',
    minutes: 5,
    th: {
      title: 'แมวควรกินอาหารเปียกวันละเท่าไหร่',
      desc: 'ปริมาณที่เหมาะสมขึ้นกับน้ำหนัก วัย และไลฟ์สไตล์ มีตารางตัวอย่างและวิธีสังเกตว่าเจ้านายได้รับพอดีหรือยัง',
      sections: [
        {
          h: 'ไม่มีตัวเลขเดียวที่ใช้ได้กับแมวทุกตัว',
          p: [
            'ปริมาณอาหารที่เหมาะสมขึ้นกับน้ำหนักตัว อายุ ระดับกิจกรรม และทำหมันแล้วหรือยัง แมวบ้านที่ทำหมันแล้วและอยู่ในห้องเป็นส่วนใหญ่ต้องการพลังงานน้อยกว่าแมวที่วิ่งเล่นมาก',
            'จุดเริ่มต้นที่ดีที่สุดคือตารางให้อาหาร (feeding guide) ที่ข้างกระป๋องหรือซอง จากนั้นปรับตามน้ำหนักและรูปร่างของแมวจริงๆ',
          ],
        },
        {
          h: 'ตัวอย่างพลังงานต่อวันของแมวโตที่ทำหมันแล้ว',
          p: ['ตารางนี้เป็นค่าประมาณจากสูตรพลังงานที่สัตวแพทย์นิยมใช้ (พลังงานพื้นฐาน × 1.2) เพื่อให้เห็นภาพเท่านั้น ไม่ใช่ค่าที่แน่นอนสำหรับแมวทุกตัว'],
          table: {
            head: ['น้ำหนักแมว', 'พลังงานโดยประมาณ/วัน', 'ถ้าเปียกกระป๋องละ ~80 kcal (85 กรัม)'],
            rows: [
              ['3 กก.', '160-220 kcal', 'ประมาณ 2-3 กระป๋อง'],
              ['4 กก.', '200-270 kcal', 'ประมาณ 2.5-3.5 กระป๋อง'],
              ['5 กก.', '235-320 kcal', 'ประมาณ 3-4 กระป๋อง'],
              ['6 กก.', '270-370 kcal', 'ประมาณ 3.5-4.5 กระป๋อง'],
            ],
          },
          tip: 'อาหารเปียกแต่ละยี่ห้อให้พลังงานต่างกันมาก (ตั้งแต่ราว 50 ถึง 100 kcal ต่อกระป๋อง) ให้ดูตัวเลข kcal บนฉลากของสินค้าที่ใช้จริงแล้วคำนวณใหม่',
        },
        {
          h: 'กินเปียกอย่างเดียว หรือผสมกับอาหารเม็ด',
          p: [
            'ถ้าให้ทั้งสองอย่าง ให้ตัดปริมาณของแต่ละอย่างลงเพื่อให้พลังงานรวมต่อวันอยู่ในช่วงที่เหมาะสม เช่น เปียกครึ่งหนึ่งของพลังงาน และเม็ดอีกครึ่งหนึ่ง อย่าให้เต็มปริมาณทั้งสองอย่างพร้อมกัน เพราะแมวจะอ้วนได้ง่าย',
          ],
        },
        {
          h: 'แบ่งกี่มื้อ',
          ul: [
            'แมวโตส่วนใหญ่กิน 2-3 มื้อต่อวัน แบ่งปริมาณรวมต่อวันเท่าๆ กัน',
            'ลูกแมวควรได้ 3-4 มื้อเล็กหรือมากกว่านั้นต่อวัน',
            'ให้อาหารเป็นเวลาและตวงปริมาณ แทนที่จะเติมชามทิ้งไว้ตลอด จะดูแลน้ำหนักได้ง่ายกว่า',
          ],
        },
        {
          h: 'ขนมต้องนับรวมด้วย',
          p: ['ขนมไม่ควรเกินประมาณ 10-15% ของพลังงานที่แมวได้ในแต่ละวัน ที่เหลือควรมาจากอาหารหลักที่ครบถ้วนสมดุล'],
        },
        {
          h: 'ดูอย่างไรว่าให้พอดีแล้ว',
          ul: [
            'ชั่งน้ำหนักแมวเดือนละครั้ง และจดไว้ เปลี่ยนแปลงกะทันหันเป็นสัญญาณที่ควรสังเกต',
            'คลำซี่โครงได้ง่ายแต่ไม่เห็นเป็นซี่ชัด และมองจากด้านบนเห็นเอวคอดเล็กน้อย แปลว่ารูปร่างกำลังดี',
            'ถ้าแมวอ้วนหรือผอมเกินไป กินน้อยลงมาก หรือน้ำหนักเปลี่ยนเร็ว ให้ปรึกษาสัตวแพทย์ก่อนปรับอาหาร',
            'อย่าลืมวางน้ำสะอาดไว้หลายจุดในบ้านเสมอ',
          ],
        },
      ],
    },
    en: {
      title: 'How Much Wet Food Should a Cat Eat Per Day?',
      desc: 'The right portion depends on weight, age and lifestyle. See an example table and how to tell if your boss is getting just enough.',
      sections: [
        {
          h: 'There is no single number for every cat',
          p: [
            'The right amount depends on body weight, age, activity level and whether the cat is neutered. A neutered indoor cat needs less energy than a very active one.',
            'The best starting point is the feeding guide on the can or pouch. Then adjust based on how your own cat’s weight and body shape change.',
          ],
        },
        {
          h: 'Example daily energy for a neutered adult cat',
          p: ['This table is a rough estimate using a formula vets commonly use (resting energy × 1.2), meant only to give you an idea. It is not an exact figure for every cat.'],
          table: {
            head: ['Cat’s weight', 'Approx. energy/day', 'If a can is ~80 kcal (85 g)'],
            rows: [
              ['3 kg', '160–220 kcal', 'about 2–3 cans'],
              ['4 kg', '200–270 kcal', 'about 2.5–3.5 cans'],
              ['5 kg', '235–320 kcal', 'about 3–4 cans'],
              ['6 kg', '270–370 kcal', 'about 3.5–4.5 cans'],
            ],
          },
          tip: 'Wet foods differ a lot in energy (roughly 50 to 100 kcal per can). Check the kcal on the label of the food you actually use and recalculate.',
        },
        {
          h: 'Wet only, or mixed with dry food?',
          p: ['If you feed both, reduce each so the total energy per day stays in the right range, for example half of the energy from wet food and half from dry. Do not give the full portion of both, as cats gain weight easily.'],
        },
        {
          h: 'How many meals?',
          ul: [
            'Most adult cats eat 2–3 meals a day. Split the daily total evenly.',
            'Kittens should have 3–4 small meals a day, or more.',
            'Feeding at set times and measuring portions is easier for weight control than leaving a full bowl out all day.',
          ],
        },
        {
          h: 'Treats count too',
          p: ['Treats should not exceed about 10–15% of the energy your cat gets each day. The rest should come from a complete and balanced main food.'],
        },
        {
          h: 'How to tell the portion is right',
          ul: [
            'Weigh your cat once a month and write it down. A sudden change is a sign to pay attention.',
            'You should feel the ribs easily without seeing them clearly, and see a slight waist from above. That suggests a healthy shape.',
            'If your cat is overweight or too thin, is eating much less, or the weight changes quickly, talk to a vet before changing the diet.',
            'Always keep fresh water in several places around the house.',
          ],
        },
      ],
    },
  },
  {
    slug: 'wet-food-by-age',
    art: 'family',
    minutes: 6,
    th: {
      title: 'แมวอายุเท่าไหร่ควรกินอาหารเปียกแบบไหน',
      desc: 'ตั้งแต่ลูกแมวหย่านม แมวโต ไปจนถึงแมวสูงวัย แต่ละวัยควรเลือกสูตรและเนื้อสัมผัสอย่างไร',
      sections: [
        {
          h: 'ภาพรวมตามช่วงวัย',
          table: {
            head: ['ช่วงวัย', 'ควรกินอะไร', 'จำนวนมื้อ'],
            rows: [
              ['แรกเกิด-4 สัปดาห์', 'นมแม่ ถ้าไม่มีแม่ให้ปรึกษาสัตวแพทย์เรื่องนมทดแทนสำหรับลูกแมว', 'ตามที่ลูกแมวต้องการ ถี่มาก'],
              ['4-8 สัปดาห์ (หย่านม)', 'เริ่มอาหารเปียกลูกแมวแบบมูสนิ่มๆ ผสมนมทดแทนหรือน้ำอุ่นพอเละ แล้วค่อยลดของเหลว', '3-4 มื้อเล็กหรือมากกว่า'],
              ['2-6 เดือน', 'อาหารเปียกสูตรลูกแมว (โปรตีนและพลังงานสูงกว่าสูตรแมวโต)', '3-4 มื้อเล็ก'],
              ['6-12 เดือน', 'สูตรลูกแมวต่อไปจนใกล้ครบ 1 ปี แล้วค่อยๆ เปลี่ยนเป็นสูตรแมวโต', '3 มื้อ ลดลงเป็น 2-3 มื้อ'],
              ['1-7 ปี (แมวโต)', 'สูตรแมวโต ครบถ้วนสมดุล เลือกตามน้ำหนักและไลฟ์สไตล์ (ทำหมัน/อยู่ในบ้าน)', '2-3 มื้อ'],
              ['7 ปีขึ้นไป (สูงวัย)', 'สูตรแมวสูงวัย หรือสูตรย่อยง่าย เนื้อสัมผัสนุ่มถ้าฟันไม่ดี', '2-4 มื้อเล็ก ถ้ากินครั้งละน้อย'],
            ],
          },
          p: ['ช่วงอายุเป็นเกณฑ์กลางๆ แมวแต่ละตัวโตและแก่ไม่เท่ากัน ตามร้านนี้แบ่งเป็น ลูกแมว (ถึง 1 ปี) แมวโต (1-7 ปี) และแมวสูงวัย (7 ปีขึ้นไป)'],
        },
        {
          h: 'ลูกแมว: ต้องการพลังงานและโปรตีนมากกว่า',
          ul: [
            'ลูกแมวโตเร็วมาก จึงควรกินอาหารสูตรลูกแมวที่ระบุว่าเหมาะกับช่วงการเติบโต หรือสูตรสำหรับทุกช่วงวัย อย่าใช้สูตรแมวโตเป็นอาหารหลักในช่วงนี้',
            'แมวหย่านมเต็มที่ราว 8 สัปดาห์ และมักโตเต็มวัยเมื่ออายุประมาณ 10-12 เดือน',
            'แบ่งอาหารรวมต่อวันเป็น 3-4 มื้อเล็กหรือมากกว่า และชั่งน้ำหนักเป็นระยะเพื่อดูว่าโตตามเกณฑ์',
            'แม่แมวที่กำลังตั้งท้องหรือให้นม ต้องการพลังงานเพิ่ม ควรปรึกษาสัตวแพทย์เรื่องสูตรอาหาร',
          ],
        },
        {
          h: 'แมวโต: เน้นรักษาน้ำหนักและสุขภาพทางเดินปัสสาวะ',
          ul: [
            'เลือกสูตรแมวโตที่ครบถ้วนสมดุล และคุมปริมาณตามน้ำหนักตัว ดูบทความ "แมวควรกินอาหารเปียกวันละเท่าไหร่"',
            'แมวทำหมันแล้วมักอ้วนง่ายขึ้น ดูแลเรื่องปริมาณและขนมเป็นพิเศษ',
            'อาหารเปียกช่วยเพิ่มน้ำให้แมว ซึ่งดีกับแมวที่ดื่มน้ำน้อย',
          ],
        },
        {
          h: 'แมวสูงวัย: ย่อยง่าย นุ่ม และตรวจสุขภาพสม่ำเสมอ',
          ul: [
            'แมวสูงวัยบางตัวฟันไม่ดีหรือกลิ่นอาหารไม่ดึงดูดเหมือนก่อน อาหารเปียกแบบมูสนุ่มๆ และอุ่นเล็กน้อยช่วยให้กินง่ายขึ้น',
            'เลือกสูตรสำหรับแมวสูงวัยหรือสูตรย่อยง่าย และแบ่งเป็นมื้อเล็กๆ หลายมื้อถ้าแมวกินได้ทีละน้อย',
            'ควรตรวจสุขภาพกับสัตวแพทย์ปีละอย่างน้อย 1 ครั้ง ถ้าเป็นโรคไต เบาหวาน หรือโรคอื่นๆ ต้องใช้อาหารตามที่สัตวแพทย์สั่งเท่านั้น อย่าเลือกเอง',
            'ถ้าแมวกินน้อยลง ซูบผอม หรือดื่มน้ำมากผิดปกติ ให้พาไปพบสัตวแพทย์',
          ],
        },
        {
          h: 'เลือกอาหารเปียกในร้านตามวัย',
          p: ['หน้าร้านของเรามีตัวกรองอายุแมว เลือก "ลูกแมว", "แมวโต" หรือ "แมวสูงวัย" เพื่อดูอาหารที่เหมาะกับวัยของเจ้านายได้ทันที'],
        },
      ],
    },
    en: {
      title: 'Which Wet Food for Which Age?',
      desc: 'From weaning kittens to adults and senior cats, how to choose the right formula and texture at each life stage.',
      sections: [
        {
          h: 'Overview by life stage',
          table: {
            head: ['Life stage', 'What to feed', 'Meals'],
            rows: [
              ['Birth–4 weeks', 'Mother’s milk. If there is no mother, ask a vet about kitten milk replacer', 'As often as the kitten needs'],
              ['4–8 weeks (weaning)', 'Start with soft kitten mousse mixed with milk replacer or warm water into a gruel, then reduce the liquid', '3–4 small meals or more'],
              ['2–6 months', 'Wet food made for kittens (higher in protein and energy than adult food)', '3–4 small meals'],
              ['6–12 months', 'Keep kitten food until close to 1 year, then switch gradually to adult food', '3 meals, reducing to 2–3'],
              ['1–7 years (adult)', 'Complete and balanced adult food chosen for weight and lifestyle (neutered / indoor)', '2–3 meals'],
              ['7+ years (senior)', 'Senior or easy-to-digest food, with a soft texture if teeth are sensitive', '2–4 small meals if they eat little at a time'],
            ],
          },
          p: ['The ages are a rough guide as every cat grows and ages differently. This shop groups cats as kitten (up to 1 year), adult (1–7 years) and senior (7+ years).'],
        },
        {
          h: 'Kittens need more energy and protein',
          ul: [
            'Kittens grow very fast. Feed a formula made for growth or for all life stages, and do not use adult food as the main diet at this stage.',
            'Kittens are fully weaned at about 8 weeks and usually reach adulthood at around 10–12 months.',
            'Split the daily total into 3–4 small meals or more, and weigh them regularly to check they are growing on track.',
            'A queen who is pregnant or nursing needs extra energy, so ask a vet about the right food.',
          ],
        },
        {
          h: 'Adults: weight control and urinary health',
          ul: [
            'Choose a complete and balanced adult formula and control portions by body weight. See the article “How Much Wet Food Should a Cat Eat Per Day”.',
            'Neutered cats tend to gain weight more easily, so watch portions and treats closely.',
            'Wet food adds water, which helps cats that drink little.',
          ],
        },
        {
          h: 'Seniors: easy to digest, soft, and regular check-ups',
          ul: [
            'Some senior cats have sensitive teeth or are less attracted to food smells. Soft mousse, slightly warmed, can make eating easier.',
            'Choose a senior or easy-to-digest formula, and offer several small meals if your cat eats only a little at a time.',
            'See a vet for a check-up at least once a year. For kidney disease, diabetes or other conditions, feed only the diet your vet prescribes and do not choose it yourself.',
            'If your cat eats less, loses weight or drinks unusually much water, see a vet.',
          ],
        },
        {
          h: 'Find the right food in our shop',
          p: ['Our shop has an age filter. Pick “Kitten”, “Adult” or “Senior” to see food that suits your cat’s life stage right away.'],
        },
      ],
    },
  },
];

ARTICLES.push(...ARTICLES2);

export const ARTICLE_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
