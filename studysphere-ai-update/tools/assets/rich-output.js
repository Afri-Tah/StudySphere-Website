// ══════════════════════════════════════════════════════
//  RICH AI OUTPUT — shared by the Notes Generator and AI Tutor
// ══════════════════════════════════════════════════════
// Turns the AI's Markdown into clean, safe HTML: headings, bullets, bold,
// tables, and flow-chart diagrams (Mermaid), plus real labelled diagrams
// found on Wikimedia Commons (free, no API key, free-licence images).
//
// Everything here degrades gracefully: if a library can't be downloaded or the
// image search is unreachable, the answer still shows as simple readable text.
// Libraries are loaded on demand from jsDelivr, so nothing slows down pages
// that never show AI output. Load this file AFTER tools-common.js.

const SS_RICH_LIBS = {
  marked:  ['https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
            'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js'],
  purify:  ['https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js',
            'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js'],
  mermaid: ['https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js',
            'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js']
};

const _ssScriptCache = {};
// Loads the first URL in the list that works (the second is a fallback if the
// pinned version path is ever wrong). Each library is only downloaded once.
function ssLoadScript(urls) {
  const key = urls[0];
  if (_ssScriptCache[key]) return _ssScriptCache[key];
  _ssScriptCache[key] = (async () => {
    let lastErr;
    for (const src of urls) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src; s.async = true; s.crossOrigin = 'anonymous';
          const timer = setTimeout(() => { s.remove(); reject(new Error('timeout')); }, 15000);
          s.onload = () => { clearTimeout(timer); resolve(); };
          s.onerror = () => { clearTimeout(timer); s.remove(); reject(new Error('load failed')); };
          document.head.appendChild(s);
        });
        return;
      } catch (err) { lastErr = err; }
    }
    delete _ssScriptCache[key]; // allow a retry on the next answer
    throw lastErr || new Error('could not load script');
  })();
  return _ssScriptCache[key];
}

function ssEscapeHTML(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// The notes prompt asks the AI to end with "DIAGRAM_SEARCH: <keywords>" so the
// image search uses precise terms ("mitosis stages") instead of the raw topic.
// Returns the answer without that line, plus the keywords (or '' if absent).
function ssSplitDiagramQuery(text) {
  const raw = String(text || '');
  const m = raw.match(/^[ \t>*_`-]*DIAGRAM_SEARCH:\s*(.+?)\s*$/im);
  if (!m) return { body: raw.trim(), query: '' };
  const query = m[1].replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  const body = raw.replace(m[0], '').trim();
  return { body, query: query.length >= 2 ? query : '' };
}

// Minimal Markdown → HTML used instantly while the real renderer loads, and
// as the fallback if it can't. Handles headings, bullets, bold, paragraphs.
function ssSimpleMarkdown(text) {
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  let html = '', inList = false, fence = null; // fence: null | 'mermaid' | 'code'
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim();
    if (/^```/.test(line)) { // fenced block: diagrams can't be drawn here, so omit them; keep other code
      if (fence) { if (fence === 'code') html += '</pre>'; fence = null; }
      else { fence = /^```\s*mermaid/i.test(line) ? 'mermaid' : 'code'; if (fence === 'code') { if (inList) { html += '</ul>'; inList = false; } html += '<pre>'; } }
      continue;
    }
    if (fence === 'mermaid') continue;
    if (fence === 'code') { html += ssEscapeHTML(raw) + '\n'; continue; }
    if (!line || /^[-*_]{3,}$/.test(line) || /^\|?[\s:|-]+\|?$/.test(line)) continue; // blanks, rules, table dividers
    const esc = ssEscapeHTML(line);
    const heading = esc.match(/^#{1,4}\s*(.+)/);
    const bullet = esc.match(/^[-*•]\s+(.+)/);
    if (heading) { if (inList) { html += '</ul>'; inList = false; } html += `<h4>${inline(heading[1])}</h4>`; }
    else if (bullet) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inline(bullet[1])}</li>`; }
    else { if (inList) { html += '</ul>'; inList = false; } html += `<p>${inline(esc.replace(/^\|\s*|\s*\|$/g, '').replace(/\s*\|\s*/g, ' · '))}</p>`; }
  }
  if (inList) html += '</ul>';
  return html;
}

// Renders `markdown` into element `el` as sanitized HTML. Returns true if the
// full renderer was used, false if it fell back to the simple one.
async function ssRenderRich(el, markdown, opts) {
  const breaks = !!(opts && opts.breaks);
  try {
    await Promise.all([ssLoadScript(SS_RICH_LIBS.marked), ssLoadScript(SS_RICH_LIBS.purify)]);
    if (!window.marked || !window.DOMPurify) throw new Error('renderer missing');
    const rawHtml = window.marked.parse(String(markdown || ''), { gfm: true, breaks });
    // The AI's text is untrusted: sanitize it, and drop <img> so only the
    // verified Wikimedia figures below ever show pictures (the AI can
    // hallucinate image links that would just appear broken).
    el.innerHTML = window.DOMPurify.sanitize(rawHtml, {
      FORBID_TAGS: ['img', 'style', 'form', 'input', 'button', 'iframe', 'object', 'embed']
    });
    el.querySelectorAll('a[href]').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
    el.querySelectorAll('table').forEach(t => {
      const wrap = document.createElement('div');
      wrap.className = 'ss-table-wrap';
      t.replaceWith(wrap); wrap.appendChild(t);
    });
    await ssRenderMermaid(el);
    return true;
  } catch (err) {
    console.warn('[StudySphere] rich rendering unavailable, using simple text:', err.message || err);
    el.innerHTML = ssSimpleMarkdown(markdown);
    return false;
  }
}

// Turns ```mermaid code blocks into drawn diagrams. A diagram that fails to
// parse (models sometimes write invalid syntax) is removed rather than shown
// as an ugly error.
async function ssRenderMermaid(root) {
  const blocks = Array.from(root.querySelectorAll('pre > code.language-mermaid'));
  if (!blocks.length) return;
  try {
    await ssLoadScript(SS_RICH_LIBS.mermaid);
    if (!window.mermaid) throw new Error('mermaid missing');
  } catch (err) {
    blocks.forEach(b => b.closest('pre').remove());
    return;
  }
  const dark = document.body.classList.contains('dark');
  window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'neutral' });
  let n = 0;
  for (const code of blocks) {
    const pre = code.closest('pre');
    const id = `ssMermaid${Date.now()}_${n++}`;
    try {
      const { svg } = await window.mermaid.render(id, code.textContent);
      const wrap = document.createElement('div');
      wrap.className = 'ss-diagram';
      wrap.innerHTML = svg;
      pre.replaceWith(wrap);
    } catch (err) {
      const leftover = document.getElementById('d' + id) || document.getElementById(id);
      if (leftover) leftover.remove();
      pre.remove();
    }
  }
}

// ── Diagram search (Wikimedia Commons) ──
function _ssPlainText(html) {
  const s = String(html || '');
  if (typeof DOMParser !== 'undefined') {
    return (new DOMParser().parseFromString(s, 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim();
  }
  return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Pure function (tested without a browser): picks usable images out of a
// Commons API response and keeps only trusted Wikimedia URLs.
function ssParseCommonsResults(data, limit) {
  const max = limit || 3;
  const pages = data && data.query && data.query.pages ? Object.values(data.query.pages) : [];
  const okMime = new Set(['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp']);
  pages.sort((a, b) => (a.index || 0) - (b.index || 0)); // search relevance order
  const out = [];
  for (const p of pages) {
    const info = p.imageinfo && p.imageinfo[0];
    if (!info || !okMime.has(info.mime)) continue;
    const thumb = info.thumburl || info.url || '';
    const page = info.descriptionurl || '';
    if (!/^https:\/\/upload\.wikimedia\.org\//.test(thumb) || !/^https:\/\/commons\.wikimedia\.org\//.test(page)) continue;
    const meta = info.extmetadata || {};
    out.push({
      title: String(p.title || '').replace(/^File:/i, '').replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' '),
      thumb, page,
      credit: _ssPlainText(meta.Artist && meta.Artist.value).slice(0, 80),
      license: _ssPlainText(meta.LicenseShortName && meta.LicenseShortName.value).slice(0, 40)
    });
    if (out.length >= max) break;
  }
  return out;
}

// Fills `container` with up to 3 labelled diagrams for `query`, with credit
// and licence under each. Shows nothing at all if the search fails.
async function ssShowDiagrams(container, query) {
  if (!container) return 0;
  const q = String(query || '').trim();
  if (!q) return 0;
  container.innerHTML = '<p class="ss-fig-loading"><i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Looking for diagrams…</p>';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const params = new URLSearchParams({
      action: 'query', format: 'json', origin: '*',
      generator: 'search', gsrnamespace: '6', gsrlimit: '12',
      gsrsearch: `${q} filetype:bitmap|drawing`,
      prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '700'
    });
    const res = await fetch('https://commons.wikimedia.org/w/api.php?' + params.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const items = ssParseCommonsResults(await res.json(), 3);
    container.textContent = '';
    if (!items.length) return 0;

    const title = document.createElement('h4');
    title.innerHTML = '<i class="ti ti-photo"></i> Diagrams from the web';
    const grid = document.createElement('div');
    grid.className = 'ss-figures';
    items.forEach(it => {
      const fig = document.createElement('figure');
      const link = document.createElement('a');
      link.href = it.page; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const img = document.createElement('img');
      img.src = it.thumb; img.alt = it.title; img.loading = 'lazy';
      img.addEventListener('error', () => fig.remove());
      link.appendChild(img);
      const cap = document.createElement('figcaption');
      const strong = document.createElement('strong');
      strong.textContent = it.title;
      const credit = document.createElement('span');
      credit.textContent = [it.credit, it.license].filter(Boolean).join(' · ');
      cap.append(strong, credit);
      fig.append(link, cap);
      grid.appendChild(fig);
    });
    const note = document.createElement('p');
    note.className = 'ss-fig-note';
    note.textContent = 'Images are from Wikimedia Commons (free licences). They may not match your exact syllabus — check labels against your textbook.';
    container.append(title, grid, note);
    return items.length;
  } catch (err) {
    clearTimeout(timer);
    container.textContent = ''; // no diagrams is fine; never show an error for a bonus feature
    console.warn('[StudySphere] diagram search unavailable:', err.message || err);
    return 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ssEscapeHTML, ssSplitDiagramQuery, ssSimpleMarkdown, ssParseCommonsResults };
}
