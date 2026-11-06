// Shared Notion helpers for the Itinerary Desk API (Cloudflare Pages Functions).
// Every function takes `env` so the same code runs on Cloudflare and in scripts/seed.mjs.

const NOTION_VERSION = '2022-06-28';
const ID_RE = /^[0-9a-fA-F-]{32,36}$/;

function err(message, status) {
  const e = new Error(message);
  e.status = status || 500;
  return e;
}

function need(env, key) {
  if (!env[key]) throw err('Missing environment variable ' + key, 500);
  return env[key];
}

export function checkId(id) {
  if (!ID_RE.test(String(id || ''))) throw err('Bad id', 400);
  return id;
}

export async function notion(env, method, url, body) {
  const res = await fetch('https://api.notion.com/v1' + url, {
    method,
    headers: {
      Authorization: 'Bearer ' + need(env, 'NOTION_ITIN_KEY'),
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = { message: text }; }
  if (!res.ok) throw err('Notion: ' + (json.message || res.status), res.status === 404 ? 404 : 502);
  return json;
}

const plain = (arr) => (arr || []).map((x) => x.plain_text || '').join('');

// Split text into pieces under Notion's 2000-character limit, never cutting a surrogate pair.
function pieces(s) {
  s = String(s == null ? '' : s);
  const out = [];
  let i = 0;
  while (i < s.length) {
    let j = Math.min(i + 1900, s.length);
    if (j < s.length) {
      const c = s.charCodeAt(j - 1);
      if (c >= 0xd800 && c <= 0xdbff) j--;
    }
    out.push(s.slice(i, j));
    i = j;
  }
  return out;
}
const rich = (s) => pieces(s).map((p) => ({ type: 'text', text: { content: p } }));

async function queryAll(env, dbId) {
  let results = [];
  let cursor;
  do {
    const j = await notion(env, 'POST', '/databases/' + dbId + '/query', {
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    results = results.concat(j.results);
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return results;
}

async function childBlocks(env, pageId) {
  let results = [];
  let cursor;
  do {
    const j = await notion(env, 'GET', '/blocks/' + pageId + '/children?page_size=100' + (cursor ? '&start_cursor=' + cursor : ''));
    results = results.concat(j.results);
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return results;
}

/* ---------------- itineraries ----------------
   Notion database "Itineraries" columns:
   Name (title), Number (number), Guest (text), Arrival (date), Departure (date),
   Adults (number), Days (number), Hotels (text), Agent (text).
   The complete itinerary is stored as JSON in code blocks in the page body. */

function itinProps(d) {
  const hotels = (d.hotels || []).filter((h) => h.v).map((h) => h.v).join(' · ');
  return {
    Name: { title: rich(String(d.number || '') + ' · ' + (d.guestName || '')) },
    Number: { number: Number(d.number) || null },
    Guest: { rich_text: rich(d.guestName) },
    Arrival: { date: d.arrival ? { start: d.arrival } : null },
    Departure: { date: d.departure ? { start: d.departure } : null },
    Adults: { number: Number(d.adults) || null },
    Days: { number: (d.days || []).length },
    Hotels: { rich_text: rich(hotels) },
    Agent: { rich_text: rich(d.agent) },
  };
}

function itinBlocks(d) {
  return pieces(JSON.stringify(d)).map((p) => ({
    object: 'block',
    type: 'code',
    code: { language: 'json', rich_text: [{ type: 'text', text: { content: p } }] },
  }));
}

function itinSummary(p) {
  const pr = p.properties || {};
  return {
    id: p.id,
    number: pr.Number && pr.Number.number,
    guestName: plain(pr.Guest && pr.Guest.rich_text),
    arrival: (pr.Arrival && pr.Arrival.date && pr.Arrival.date.start) || '',
    departure: (pr.Departure && pr.Departure.date && pr.Departure.date.start) || '',
    adults: pr.Adults && pr.Adults.number,
    days: (pr.Days && pr.Days.number) || 0,
    hotelsText: plain(pr.Hotels && pr.Hotels.rich_text),
    agent: plain(pr.Agent && pr.Agent.rich_text),
  };
}

export async function listItins(env) {
  const pages = await queryAll(env, need(env, 'NOTION_ITIN_DB'));
  return pages.filter((p) => !p.archived).map(itinSummary);
}

export async function getItin(env, id) {
  checkId(id);
  const blocks = await childBlocks(env, id);
  const json = blocks
    .filter((b) => b.type === 'code')
    .map((b) => plain(b.code.rich_text))
    .join('');
  if (!json) throw err('This page has no itinerary data', 404);
  return JSON.parse(json);
}

export async function createItin(env, d) {
  const page = await notion(env, 'POST', '/pages', {
    parent: { database_id: need(env, 'NOTION_ITIN_DB') },
    properties: itinProps(d),
    children: itinBlocks(d).slice(0, 100),
  });
  return { id: page.id };
}

export async function updateItin(env, id, d) {
  checkId(id);
  await notion(env, 'PATCH', '/pages/' + id, { properties: itinProps(d) });
  const old = await childBlocks(env, id);
  await notion(env, 'PATCH', '/blocks/' + id + '/children', { children: itinBlocks(d).slice(0, 100) });
  for (const b of old) await notion(env, 'DELETE', '/blocks/' + b.id);
  return { id };
}

export async function deleteItin(env, id) {
  checkId(id);
  await notion(env, 'PATCH', '/pages/' + id, { archived: true });
  return { ok: true };
}

/* ---------------- libraries ---------------- */

export const LIBS = {
  tours: { env: 'NOTION_LIB_TOURS_DB', props: { name: ['Name', 'title'], cat: ['Category', 'select'], note: ['Note', 'text'] } },
  hotels: { env: 'NOTION_LIB_HOTELS_DB', props: { name: ['Name', 'title'], city: ['City', 'select'] } },
  snippets: { env: 'NOTION_LIB_TEXT_DB', props: { title: ['Title', 'title'], kind: ['Kind', 'select'], body: ['Body', 'text'] } },
};

function libProps(kind, d) {
  const out = {};
  for (const [key, [name, type]] of Object.entries(LIBS[kind].props)) {
    const v = d[key] == null ? '' : String(d[key]);
    if (type === 'title') out[name] = { title: rich(v) };
    else if (type === 'select') out[name] = { select: v ? { name: v.replace(/,/g, ' ') } : null };
    else out[name] = { rich_text: rich(v) };
  }
  return out;
}

function libItem(kind, p) {
  const item = { id: p.id };
  for (const [key, [name, type]] of Object.entries(LIBS[kind].props)) {
    const prop = (p.properties || {})[name];
    if (!prop) item[key] = '';
    else if (type === 'title') item[key] = plain(prop.title);
    else if (type === 'select') item[key] = (prop.select && prop.select.name) || '';
    else item[key] = plain(prop.rich_text);
  }
  return item;
}

export async function libList(env, kind) {
  const pages = await queryAll(env, need(env, LIBS[kind].env));
  return pages.filter((p) => !p.archived).map((p) => libItem(kind, p));
}

export async function libCreate(env, kind, d) {
  const page = await notion(env, 'POST', '/pages', {
    parent: { database_id: need(env, LIBS[kind].env) },
    properties: libProps(kind, d),
  });
  return { id: page.id };
}

export async function libUpdate(env, kind, id, d) {
  checkId(id);
  await notion(env, 'PATCH', '/pages/' + id, { properties: libProps(kind, d) });
  return { id };
}

export async function libDelete(env, kind, id) {
  checkId(id);
  await notion(env, 'PATCH', '/pages/' + id, { archived: true });
  return { ok: true };
}
