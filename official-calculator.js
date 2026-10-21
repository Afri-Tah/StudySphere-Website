// Edexcel IGCSE / IAL: curriculum > session > year > subject > marks => grade.
// Boundary data comes from assets/gradedata/series/pearson-{qual}-{year}-{session}.json.
(function () {
  const Cal = window.SSCal, G = window.SSGrade, L = window.SS_BOUNDARY_LINKS;
  const $ = id => document.getElementById(id);
  const cur = $('ocCur'), ses = $('ocSession'), yr = $('ocYear'), sub = $('ocSubject'),
        stat = $('ocStatus'), box = $('ocInputs'), res = $('ocResult');
  let series = null, subject = null;

  const mk = (tag, attrs, parent) => { const e = document.createElement(tag); Object.entries(attrs || {}).forEach(([k, v]) => k === 'text' ? (e.textContent = v) : e.setAttribute(k, v)); if (parent) parent.appendChild(e); return e; };
  function fill(sel, ph, pairs) { sel.innerHTML = ''; mk('option', { value: '', text: ph }, sel); pairs.forEach(([v, t]) => mk('option', { value: v, text: t }, sel)); sel.style.display = 'block'; }
  function clear(...els) { els.forEach(e => { if (e.tagName === 'SELECT') { e.style.display = 'none'; e.innerHTML = ''; } else e.replaceChildren(); }); stat.replaceChildren(); stat.style.display = 'none'; }

  function banner(kind, headline, text, links, big) {
    stat.replaceChildren(); stat.style.display = 'block';
    stat.style.borderColor = kind === 'warn' ? '#e0a100' : kind === 'wait' ? '#c0392b' : '';
    mk('div', { style: big ? 'font-size:1.7rem;font-weight:900;line-height:1.2;color:#c0392b' : 'font-weight:800', text: headline }, stat);
    if (text) mk('p', { style: 'margin:8px 0 10px;font-size:.9rem', text }, stat);
    (links || []).forEach((l, i) => { const a = mk('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', class: 'btn' + (i ? '' : ' btn-peach'), style: 'margin:0 8px 8px 0;display:inline-block', text: l.label }, stat); });
  }

  cur.addEventListener('change', () => { clear(ses, yr, sub, box, res); series = null; if (cur.value) fill(ses, 'Exam session', Cal.sessionList(cur.value)); });
  ses.addEventListener('change', () => { clear(yr, sub, box, res); series = null; if (ses.value) fill(yr, 'Year', Cal.years(cur.value, ses.value).map(y => [String(y), String(y)])); });
  yr.addEventListener('change', load);
  sub.addEventListener('change', () => { subject = series && series.subjects.find(s => s.name === sub.value); drawInputs(); });

  async function load() {
    clear(sub, box, res); series = null; subject = null;
    if (!yr.value) return;
    const q = cur.value, s = ses.value, y = +yr.value, name = Cal.label(q, s, y);
    const r = L.resolve('edexcel', q, s, y);
    if (r.kind === 'notice') { banner('warn', '⚠ ' + r.headline, r.text, r.links); return; }
    try {
      const resp = await fetch(`assets/gradedata/series/pearson-${q}-${y}-${s}.json`, { cache: 'no-cache' });
      if (resp.ok) series = await resp.json();
    } catch (e) { /* not loaded */ }
    if (series && series.subjects && series.subjects.length) {
      const note = series.demo ? 'DEMO DATA, not official. Do not publish.' : '';
      banner(series.demo ? 'warn' : 'ok', `Pearson Edexcel ${name}`, (note ? note + ' ' : '') + 'Choose your subject and type your marks. Your grade appears automatically.', series.source ? [{ label: 'Official PDF', url: series.source }] : []);
      fill(sub, 'Subject', series.subjects.map(x => [x.name, x.name + (x.code ? ` (${x.code})` : '')]));
      return;
    }
    await (window.SSFeed ? window.SSFeed.ready : Promise.resolve());
    const out = (window.SSFeed && window.SSFeed.has(q, s, y)) || Cal.isDue(q, s, y);
    if (!out) banner('wait', 'Grade boundaries not yet published', `Pearson has not published the ${name} boundaries yet. This page will offer them as soon as they are out.`, [{ label: 'Pearson grade boundaries page', url: r.links[r.links.length - 1].url }], true);
    else banner('ok', `Pearson Edexcel ${name}`, 'Pearson has published these boundaries. We are adding them to the calculator, so automatic grading for this series is coming soon. You can open the official file in the meantime.', r.links);
  }

  function drawInputs() {
    box.replaceChildren(); res.replaceChildren(); res.style.display = 'none';
    if (!subject) return;
    const rows = cur.value === 'ial' ? subject.units : (subject.papers && subject.papers.length ? subject.papers : [{ name: 'Total mark', max: subject.max }]);
    rows.forEach(u => {
      const row = mk('label', { style: 'display:flex;gap:10px;align-items:center;margin-bottom:8px;font-size:.9rem' }, box);
      mk('span', { style: 'flex:1', text: `${u.name}${u.code ? ' (' + u.code + ')' : ''}` }, row);
      const inp = mk('input', { type: 'number', min: 0, max: u.max, step: 'any', placeholder: `out of ${u.max}`, 'data-max': u.max, style: 'width:120px;margin:0;padding:10px' }, row);
      inp.addEventListener('input', compute);
    });
  }

  function compute() {
    const ins = [...box.querySelectorAll('input')]; res.replaceChildren();
    const vals = ins.map(i => i.value === '' ? null : parseFloat(i.value));
    const bad = ins.findIndex((i, k) => vals[k] !== null && (isNaN(vals[k]) || vals[k] < 0 || vals[k] > +i.dataset.max));
    res.style.display = 'block';
    if (bad >= 0) { mk('p', { class: 'gc-err', text: `Enter a mark between 0 and ${ins[bad].dataset.max}.` }, res); return; }
    if (vals.every(v => v === null)) { res.style.display = 'none'; return; }
    const top = mk('div', { style: 'display:flex;align-items:center;gap:16px;flex-wrap:wrap' }, res);
    if (cur.value === 'ial') {
      const used = subject.units.map((u, k) => ({ u, v: vals[k] })).filter(x => x.v !== null);
      const r = G.computeIAL(used.map(x => ({ raw: x.v, max: x.u.max, bounds: x.u.bounds, umsMax: x.u.umsMax, a2: !!x.u.a2 })), 90);
      mk('div', { class: 'gc-grade', text: r.grade }, top);
      const info = mk('div', {}, top);
      mk('div', { style: 'font-weight:800', text: `${r.got} of ${r.tot} UMS (${r.percent.toFixed(1)}%)` }, info);
      mk('div', { style: 'font-size:.85rem;color:var(--muted)', text: used.map((x, k) => `${x.u.name}: ${r.per[k]} UMS`).join(' · ') }, info);
      if (r.grade === 'A' && r.a2Percent !== null) mk('p', { style: 'margin:10px 0 0;font-size:.88rem', text: `For A* you need 90% of the A2 UMS; you have ${r.a2Percent.toFixed(1)}%.` }, res);
      if (used.length < subject.units.length) mk('p', { style: 'margin:10px 0 0;font-size:.8rem;color:var(--muted)', text: 'Grade shown for the units entered so far.' }, res);
    } else {
      const total = vals.reduce((a, v) => a + (v || 0), 0), g = G.linearGrade(total, subject.bounds), nx = G.marksToNext(total, subject.bounds);
      mk('div', { class: 'gc-grade', text: g }, top);
      const info = mk('div', {}, top);
      mk('div', { style: 'font-weight:800', text: `${total} of ${subject.max} marks` }, info);
      mk('div', { style: 'font-size:.85rem;color:var(--muted)', text: nx ? `${nx.marks} more mark${nx.marks === 1 ? '' : 's'} for grade ${nx.grade}` : 'Top grade reached' }, info);
      const t = Object.entries(subject.bounds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join('   ');
      mk('p', { style: 'margin:10px 0 0;font-size:.78rem;color:var(--muted)', text: 'Boundaries (minimum marks)  ' + t }, res);
    }
  }
  if (!Cal || !G || !L) return;
  fill(cur, 'Curriculum', [['igcse', 'Edexcel IGCSE'], ['ial', 'Edexcel IAL']]);
})();
