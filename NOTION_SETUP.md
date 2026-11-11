# Itinerary Desk (Notion) — วิธีตั้งค่า

เว็บนี้เป็น `index.html` + `functions/api/` บน Cloudflare Pages เหมือน Hotel Contract Database
ข้อมูลทั้งหมดเก็บใน Notion ทีมใช้ผ่านเว็บอย่างเดียว ไม่ต้องเข้า Notion

## 1. สร้างฐานข้อมูลใน Notion 4 ตัว

ชื่อคอลัมน์ต้องสะกดและตัวพิมพ์ตรงตามนี้ทุกตัว (คอลัมน์ Select ไม่ต้องสร้างตัวเลือกไว้ล่วงหน้า ระบบเพิ่มให้เอง)

**Itineraries**

| คอลัมน์ | ชนิด |
|---|---|
| Name | Title (มีอยู่แล้ว) |
| Number | Number |
| Guest | Text |
| Arrival | Date |
| Departure | Date |
| Adults | Number |
| Days | Number |
| Hotels | Text |
| Agent | Text |

**Tours**

| คอลัมน์ | ชนิด |
|---|---|
| Name | Title |
| Category | Select |
| Note | Text |

**Hotels**

| คอลัมน์ | ชนิด |
|---|---|
| Name | Title |
| City | Select |

**Standard Text** (ข้อความมาตรฐาน)

| คอลัมน์ | ชนิด |
|---|---|
| Title | Title |
| Kind | Select |
| Body | Text |

## 2. สร้าง Integration และเชิญเข้าฐานข้อมูล

1. Notion → Settings → Connections → Develop or manage integrations → New integration (ชื่อเช่น Itinerary Desk) แล้วคัดลอก Internal Integration Secret
2. เปิดฐานข้อมูลแต่ละตัว กด ••• → Connections → เพิ่ม integration นี้ ให้ครบทั้ง 4 ตัว
3. คัดลอก Database ID ของแต่ละตัว (ส่วน 32 ตัวอักษรในลิงก์ก่อน `?v=`)

## 3. ตั้งตัวแปรบน Cloudflare Pages

Settings → Variables and Secrets (ใส่ Key เป็น Secret):

| ตัวแปร | ค่า |
|---|---|
| `NOTION_ITIN_KEY` | Integration Secret จากข้อ 2 |
| `NOTION_ITIN_DB` | ID ของ Itineraries |
| `NOTION_LIB_TOURS_DB` | ID ของ Tours |
| `NOTION_LIB_HOTELS_DB` | ID ของ Hotels |
| `NOTION_LIB_TEXT_DB` | ID ของ Standard Text |

## 4. Deploy

ใส่โฟลเดอร์นี้ใน GitHub repo (หรือ repo ใหม่) แล้วเชื่อมกับ Cloudflare Pages ไม่ต้องมี build command ให้ output directory เป็น `/`

ทดสอบในเครื่อง: สร้างไฟล์ `.dev.vars` ใส่ตัวแปรข้างบน แล้วรัน `npx wrangler pages dev .`

## 5. ใส่ข้อมูลเริ่มต้น (ไม่บังคับ)

```
NOTION_ITIN_KEY=... NOTION_ITIN_DB=... NOTION_LIB_TOURS_DB=... NOTION_LIB_HOTELS_DB=... NOTION_LIB_TEXT_DB=... node scripts/seed.mjs
```

จะเพิ่มทัวร์ 14 รายการ โรงแรม 2 แห่ง ข้อความมาตรฐาน 3 ชุด และใบตัวอย่างเลขที่ 1179 ฐานข้อมูลที่มีข้อมูลอยู่แล้วจะถูกข้าม

## ข้อมูลบริษัท

แก้ที่ไฟล์ `company.json` แล้ว push ใหม่

## ความปลอดภัย

ใบ Itinerary มีชื่อลูกค้า เว็บนี้ไม่มีหน้า login ถ้าเปิดสาธารณะ ใครรู้ลิงก์ก็เปิดดูและแก้ได้ แนะนำให้เปิด Cloudflare Access (Zero Trust) ครอบเว็บนี้ก่อนใช้งานจริง

## ข้อจำกัด

- ใบหนึ่งใบเก็บเป็น JSON ในเนื้อหาหน้า Notion ห้ามแก้ข้อความในเนื้อหาหน้านั้นเองใน Notion ให้แก้ผ่านเว็บ ส่วนคอลัมน์ด้านบนใช้ค้นหา กรอง และเรียงใน Notion ได้ แต่การแก้คอลัมน์ใน Notion จะไม่เปลี่ยนเนื้อหาใบ
- Notion จำกัดคำขอประมาณ 3 ครั้งต่อวินาที ใช้ในทีมเล็กไม่มีปัญหา
