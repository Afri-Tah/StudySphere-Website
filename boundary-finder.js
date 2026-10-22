// Board > qualification > session > year pickers that lead to the official
// boundary pages. Logic lives in gradedata/boundary-links.js.
(function () {
  const B = window.SS_BOUNDARY_LINKS;
  const $ = id => document.getElementById(id);
  const board = $('blBoard'), qual = $('blQual'), session = $('blSession'), year = $('blYear'), out = $('blResult');

  function fill(sel, placeholder, pairs) {
    sel.innerHTML = '';
    const o = document.createElement('option'); o.value = ''; o.textContent = placeholder; sel.appendChild(o);
    pairs.forEach(([v, t]) => { const e = document.createElement('option'); e.value = v; e.textContent = t; sel.appendChild(e); });
    sel.style.display = 'block';
  }
  function hide(...sels) { sels.forEach(s => { s.style.display = 'none'; s.innerHTML = ''; }); out.style.display = 'none'; }

  function show() {
    if (!(board.value && qual.value && session.value && year.value)) { out.style.display = 'none'; return; }
    const r = B.resolve(board.value, qual.value, session.value, year.value * 1);
    out.innerHTML = ''; out.style.display = 'block';
    const warn = r.kind === 'notice';
    out.style.borderColor = warn ? '#e0a100' : '';
    const h = document.createElement('div'); h.style.fontWeight = '800';
    h.textContent = (warn ? '⚠ ' : '') + r.headline; out.appendChild(h);
    const p = document.createElement('p'); p.style.cssText = 'margin:6px 0 10px;font-size:.88rem'; p.textContent = r.text; out.appendChild(p);
    r.links.forEach((l, i) => {
      const a = document.createElement('a'); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.className = 'btn' + (i === 0 ? ' btn-peach' : ''); a.style.cssText = 'margin:0 8px 8px 0;display:inline-block';
      a.textContent = l.label; out.appendChild(a);
    });
    if (r.kind === 'ok') {
      const n = document.createElement('p'); n.style.cssText = 'margin:4px 0 0;font-size:.78rem;color:var(--muted)';
      n.textContent = 'Type the boundaries you find into “Grade boundaries” in the calculator above, as marks or percentages.'; out.appendChild(n);
    }
  }

  board.addEventListener('change', () => {
    hide(qual, session, year);
    if (board.value) fill(qual, 'Qualification', B.QUALS[board.value]);
  });
  qual.addEventListener('change', () => {
    hide(session, year);
    if (qual.value) fill(session, 'Exam session', B.sessionsFor(board.value, qual.value));
  });
  session.addEventListener('change', () => {
    hide(year);
    if (session.value) fill(year, 'Year', B.YEARS[board.value].map(y => [String(y), String(y)]));
  });
  year.addEventListener('change', show);
})();
