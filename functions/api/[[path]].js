// Router for /api/* — Cloudflare Pages Function.
//   GET/POST        /api/itineraries
//   GET/PUT/DELETE  /api/itineraries/:id
//   GET/POST        /api/lib/:kind            (kind = tours | hotels | snippets)
//   PUT/DELETE      /api/lib/:kind/:id
import {
  LIBS, listItins, getItin, createItin, updateItin, deleteItin,
  libList, libCreate, libUpdate, libDelete,
} from './_notion.js';

const json = (data, status) =>
  new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function onRequest({ request, env, params }) {
  const seg = [].concat(params.path || []);
  const m = request.method;
  try {
    if (seg[0] === 'itineraries' && seg.length <= 2) {
      const id = seg[1];
      if (!id && m === 'GET') return json(await listItins(env));
      if (!id && m === 'POST') return json(await createItin(env, await request.json()));
      if (id && m === 'GET') return json(await getItin(env, id));
      if (id && m === 'PUT') return json(await updateItin(env, id, await request.json()));
      if (id && m === 'DELETE') return json(await deleteItin(env, id));
    }
    if (seg[0] === 'lib' && Object.prototype.hasOwnProperty.call(LIBS, seg[1]) && seg.length <= 3) {
      const kind = seg[1];
      const id = seg[2];
      if (!id && m === 'GET') return json(await libList(env, kind));
      if (!id && m === 'POST') return json(await libCreate(env, kind, await request.json()));
      if (id && m === 'PUT') return json(await libUpdate(env, kind, id, await request.json()));
      if (id && m === 'DELETE') return json(await libDelete(env, kind, id));
    }
    return json({ error: 'Not found' }, 404);
  } catch (e) {
    return json({ error: e.message || 'Server error' }, e.status || 500);
  }
}
