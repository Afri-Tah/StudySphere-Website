// News headline strip. Add <div id="ssTicker"></div> where you want it (top of the home page),
// then load site-config.js, series-calendar.js and this file. Also exposes SSFeed for the calculator.
(function () {
  const C = window.SS_CONFIG || {}, Cal = window.SSCal;
  const MONTHS = { january: 'January', june: 'June', october: 'October', november: 'November' };
  const QN = { igcse: 'IGCSE', ial: 'IAL' };

  // Live list of what Pearson has published (from the boundary-news Worker). Never blocks the page.
  const feed = { series: [], ok: false };
  const ready = !C.feedUrl ? Promise.resolve() : Promise.race([
    fetch(C.feedUrl).then(r => r.json()).then(j => { if (j && j.ok) { feed.series = j.series || []; feed.ok = true; } }).catch(() => {}),
    new Promise(r => setTimeout(r, 4000))
  ]);
  window.SSFeed = { ready, feed, has: (q, s, y) => feed.series.some(x => x.qual === q && x.session === s && x.year === y) };

  function items() {
    const out = [];
    if (feed.ok && feed.series.length) {            // newest published series, grouped
      const top = feed.series[0], same = feed.series.filter(x => x.session === top.session && x.year === top.year);
      const names = [...new Set(same.map(x => QN[x.qual]))].join(' & ');
      out.push({ tag: 'NEW', text: `Pearson has published the ${MONTHS[top.session]} ${top.year} grade boundaries (${names}).`, href: 'grade-calculator.html', cta: 'Check your grade' });
    } else if (Cal) {                                // no live feed: date-based estimate
      const l = Cal.latestDue();
      if (l) out.push({ tag: 'LATEST', text: `${MONTHS[l.s]} ${l.y} grade boundaries — find yours in the Grade Calculator.`, href: 'grade-calculator.html', cta: 'Open calculator' });
    }
    const digits = String(C.whatsapp || '').replace(/\D/g, '');
    out.push({ tag: 'ADMISSIONS', text: `${C.admissionsText || 'Admission going on'} — contact us on WhatsApp.`,
      href: digits ? `https://wa.me/${digits}?text=${encodeURIComponent(C.whatsappText || '')}` : '', cta: digits ? 'Message us' : '' });
    if ((C.courses || []).length) out.push({ tag: 'COURSES', text: `We teach ${C.courses.join(' · ')}.`, href: '', cta: '' });
    return out;
  }

  function build() {
    const mount = document.getElementById('ssTicker'); if (!mount) return;
    const css = document.createElement('style');
    css.textContent = `.sst{display:flex;align-items:center;overflow:hidden;background:var(--primary,#d9622b);color:var(--primary-ink,#fff);font-size:.88rem;border-radius:10px;margin-bottom:14px}
.sst-track{display:flex;gap:48px;white-space:nowrap;padding:9px 0;animation:sst 38s linear infinite;will-change:transform}
.sst:hover .sst-track{animation-play-state:paused}.sst-item{display:inline-flex;gap:8px;align-items:center}
.sst-tag{font-weight:800;font-size:.7rem;letter-spacing:.06em;background:rgba(0,0,0,.22);border-radius:6px;padding:2px 7px}
.sst a{color:inherit;font-weight:800;text-decoration:underline}
@keyframes sst{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media(prefers-reduced-motion:reduce){.sst-track{animation:none;flex-wrap:wrap;white-space:normal;gap:6px 24px;padding:9px 12px}.sst-dup{display:none}}`;
    document.head.appendChild(css);
    const wrap = document.createElement('div'); wrap.className = 'sst'; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'Latest news');
    const track = document.createElement('div'); track.className = 'sst-track'; wrap.appendChild(track);
    const list = items();
    [0, 1].forEach(pass => list.forEach(it => {
      const s = document.createElement('span'); s.className = 'sst-item' + (pass ? ' sst-dup' : '');
      if (pass) s.setAttribute('aria-hidden', 'true');
      const t = document.createElement('span'); t.className = 'sst-tag'; t.textContent = it.tag; s.appendChild(t);
      s.appendChild(document.createTextNode(it.text));
      if (it.href && it.cta) { const a = document.createElement('a'); a.href = it.href; a.textContent = it.cta; if (/^https?:/.test(it.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } if (pass) a.tabIndex = -1; s.appendChild(a); }
      track.appendChild(s);
    }));
    mount.replaceChildren(wrap);
  }
  ready.then(build);
})();
