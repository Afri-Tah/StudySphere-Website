// Cloudflare Worker: tells the StudySphere site which Pearson grade boundaries are
// published. It reads Pearson's own "Most recent grade boundaries" list, caches the
// answer for 30 minutes and returns small JSON with CORS enabled.
// Deploy: Cloudflare dashboard > Workers > Create > paste this file > Deploy.
// Then put the Worker's URL (with /boundary-news) in tools/assets/site-config.js as feedUrl.
const PAGE = 'https://qualifications.pearson.com/en/support/support-topics/results-certification/grade-boundaries.html';
const MONTHS = { january: 'january', february: 'january', may: 'june', june: 'june', october: 'october', november: 'november' };
const QUALS = [['International-GCSE', 'igcse'], ['International-A-level', 'ial']];

export function parse(text) {
  const out = new Map();
  // Pass 1: titles such as "Grade Boundaries - June 2026 - International GCSE (9-1)" + PDF path + ISO date.
  const re = /(?<!Component )Grade Boundaries - (January|May|June|October|November) (\d{4}) - (International GCSE \(9-1\)|International A Level)[\s\S]{0,300}?(\/content\/dam\/[^\s"'<>]+?\.pdf)(?:[\s\S]{0,40}?(\d{4}-\d{2}-\d{2}T[\d:.]+Z))?/gi;
  let m;
  while ((m = re.exec(text))) {
    const qual = /GCSE/i.test(m[3]) ? 'igcse' : 'ial';
    const session = MONTHS[m[1].toLowerCase()], year = +m[2];
    out.set(`${qual}|${session}|${year}`, { qual, session, year, title: `${m[1]} ${m[2]} - ${m[3]}`, url: 'https://qualifications.pearson.com' + m[4], published: m[5] || null });
  }
  // Pass 2 (backup): read the PDF file names themselves.
  const re2 = /\/content\/dam\/pdf\/Support\/Grade-boundaries\/(International-GCSE|International-A-level)\/([^\s"'<>]+?\.pdf)/gi;
  while ((m = re2.exec(text))) {
    const name = m[2].toLowerCase();
    if (/notional|modular|primary|ipls/.test(name)) continue;
    const q = QUALS.find(x => x[0].toLowerCase() === m[1].toLowerCase())[1];
    let session, year, a, b;
    if ((a = name.match(/^(\d{2})(\d{2})[-_]/))) { year = 2000 + +a[1]; const mm = +a[2]; session = mm === 1 ? 'january' : mm === 6 ? 'june' : mm === 10 || mm === 11 ? (mm === 10 ? 'october' : 'november') : null; }
    else if ((b = name.match(/(january|june|october|november)-(\d{4})/))) { session = b[1]; year = +b[2]; }
    if (!session || !year) continue;
    const key = `${q}|${session}|${year}`;
    if (!out.has(key)) out.set(key, { qual: q, session, year, title: m[2], url: 'https://qualifications.pearson.com' + m[0], published: null });
  }
  return [...out.values()].sort((x, y) => (y.published || '').localeCompare(x.published || ''));
}

export default {
  async fetch(request) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=1800' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const cache = caches.default, key = new Request(new URL(request.url).origin + '/boundary-news');
    const hit = await cache.match(key);
    if (hit) return hit;
    let body;
    try {
      const r = await fetch(PAGE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudySphereBot/1.0)' }, cf: { cacheTtl: 1800 } });
      if (!r.ok) throw new Error('Pearson responded ' + r.status);
      const series = parse(await r.text());
      body = { ok: true, updated: new Date().toISOString(), source: PAGE, series };
    } catch (e) {
      body = { ok: false, updated: new Date().toISOString(), error: String(e.message || e), series: [] };
    }
    const res = new Response(JSON.stringify(body), { headers: cors });
    if (body.ok) await cache.put(key, res.clone());
    return res;
  }
};
