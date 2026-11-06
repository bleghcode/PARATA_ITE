// Optional: fill the four Notion databases with starter data (tours, hotels, standard text, sample itinerary 1179).
// Run once from the project folder:
//   NOTION_ITIN_KEY=... NOTION_ITIN_DB=... NOTION_LIB_TOURS_DB=... NOTION_LIB_HOTELS_DB=... NOTION_LIB_TEXT_DB=... node scripts/seed.mjs
// Needs Node 18+. A database that already has rows is skipped, so running it twice adds nothing.
import { libList, libCreate, listItins, createItin } from '../functions/api/_notion.js';

const env = process.env;

const tours = [
  ['Tiger Topia - Pattaya (Tiger Show + Crocodile Show)', 'Pattaya', ''],
  ['Big Buddha-Pattaya', 'Pattaya', ''],
  ['Pattaya Viewpoint', 'Pattaya', ''],
  ['Coral Island Speedboat Tour (Lunch Included)', 'Pattaya', 'Parasailing, Sea Walk, Jet Ski, and Banana Boat are not included. These activities can be pre-booked at discounted prices at least one day in advance, or you may purchase them on the spot at walk-in rates.'],
  ['Dream World + Snow Town (Lunch Included). All Rides Included', 'Bangkok', ''],
  ['Sealife Bangkok Ocean World & Madame Tussauds Wax Museum', 'Bangkok', ''],
  ['Dinner Cruise (White Orchids)', 'Bangkok', ''],
  ['Airport Pick-Up', 'Transfer', ''],
  ['Transfer from Bangkok to Pattaya', 'Transfer', ''],
  ['Transfer Pattaya to Bangkok', 'Transfer', ''],
  ['Airport Drop-Off', 'Transfer', ''],
  ['Free Day', 'Other', ''],
  ['Shopping', 'Other', ''],
  ['Evening Free Time', 'Other', ''],
].map(([name, cat, note]) => ({ name, cat, note }));

const hotels = [
  { name: 'Seasons Siam Hotel', city: 'Bangkok' },
  { name: 'Caesar Palace Hotel', city: 'Pattaya' },
];

const hotelCond = 'Hotel Booking Conditions\n****Hotels will be booked on a double or triple-sharing basis. If a customer prefers a single occupancy room, they will be responsible for paying the full room charges.\n\n****Standard check-in time is 2:00 PM.\nIf you would like to request an early check-in, please contact the reception directly. An additional charge may apply, and early check-in is subject to room availability — it cannot be guaranteed.\n\nIf you require a guaranteed early check-in, we recommend booking the room for the previous night as well.';
const meals = 'Booked with BB Basis: Your reservation includes breakfast. Not Included Other Meals (Except on Tours that already include Lunch or Dinner.)\n\n***Free One Lunch or Dinner at Siam Ceylon Restaurant (Without Beverages)***';
const terms = 'Terms & Conditions\ncancellation policy - Our establishment operates under a 72-hour advance cancellation policy. This means that should you need to adjust or cancel your reservation, we kindly ask for notification at least 72 hours prior to the scheduled time. This policy allows us to manage our resources effectively and accommodate other guests efficiently. We appreciate your understanding and cooperation in helping us maintain the highest level of service for all our patrons.';

const snippets = [
  { title: 'เงื่อนไขการจองโรงแรม (มาตรฐาน)', kind: 'hotelCond', body: hotelCond },
  { title: 'มื้ออาหาร BB + ฟรี 1 มื้อที่ร้าน Siam Ceylon', kind: 'meals', body: meals },
  { title: 'Terms & Conditions (ยกเลิก 72 ชั่วโมง)', kind: 'terms', body: terms },
];

const sample = {
  number: 1179, issueDate: '2026-10-31', guestName: 'Mrs. Hiruni Wasana', arrival: '2026-11-07', departure: '2026-11-12', adults: 3,
  days: [
    { text: 'Departure From Sri Lanka FD141 (11.00 PM)**On the previous day\nArrival to Bangkok (04.00 AM)\nAirport Pick-Up\nTransfer from Bangkok to Pattaya\nTiger Topia - Pattaya (Tiger Show + Crocodile Show)\nBig Buddha-Pattaya\nPattaya Viewpoint\n(Breakfast needs to be arranged by yourself)\nDrop Off at The Hotel\nCheck-In at Hotel (After 02.00 PM)\nEvening Free Time' },
    { text: 'Check-Out from Hotel\nPick up (09.00-09.45AM)\nCoral Island Speedboat Tour (Lunch Included) Parasailing, Sea Walk, Jet Ski, and Banana Boat are not included. These activities can be pre-booked at discounted prices at least one day in advance, or you may purchase them on the spot at walk-in rates.\nPick-Up (03.30 PM)\nTransfer Pattaya to Bangkok\nCheck-In at Hotel\nEvening Free Time' },
    { text: 'Pick-Up (09.00 AM)\nDream World + Snow Town (Lunch Included). All Rides Included' },
    { text: 'Pick-Up (09.45 AM)\nSealife Bangkok Ocean World & Madame Tussauds Wax Museum\nPick-Up (05.00 PM)\nDinner Cruise (White Orchids)' },
    { text: 'Free Day\nShopping' },
    { text: 'Check-Out from Hotel (Before 12.00 PM)\nPick-Up (04.00 PM)\nAirport Drop-Off\nDeparture from Bangkok FD140 (08.05 PM)' },
  ],
  transport: [
    { k: 'Bangkok to Pattaya Transport by', v: '6 Seater' },
    { k: 'Pattaya to Bangkok Transport by', v: '6 Seater' },
    { k: 'Bangkok Airport Drop-off by', v: '6 Seater' },
    { k: 'Other Tours Travel by', v: 'Car' },
  ],
  hotels: [{ k: 'Bangkok', v: 'Seasons Siam Hotel' }, { k: 'Pattaya', v: 'Caesar Palace Hotel' }],
  hotelCond, meals, sim: '1 Sim', agent: 'Dhanuka', terms,
};

async function fill(kind, rows) {
  const have = await libList(env, kind);
  if (have.length) { console.log(`${kind}: already has ${have.length} rows, skipped`); return; }
  for (const r of rows) await libCreate(env, kind, r);
  console.log(`${kind}: added ${rows.length}`);
}

await fill('tours', tours);
await fill('hotels', hotels);
await fill('snippets', snippets);
const itins = await listItins(env);
if (itins.length) console.log(`itineraries: already has ${itins.length} rows, skipped`);
else { await createItin(env, sample); console.log('itineraries: added sample 1179'); }
