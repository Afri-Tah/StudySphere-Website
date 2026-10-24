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
            'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'],
  katex:   ['https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
            'https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.js']
};
const SS_KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';

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

// ══ MATHS ══
// The AI writes maths as LaTeX ($x^2$, $$\frac{a}{b}$$). Markdown would mangle
// it, so it is lifted out into placeholders first, then drawn with KaTeX after
// the Markdown is rendered. If KaTeX can't load, a Unicode version is shown
// instead (x², √, π, ×, ≤ ...) so symbols are never raw backslash code.
const _SS_TEX_SYMBOLS = {
  alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ε',zeta:'ζ',eta:'η',theta:'θ',vartheta:'ϑ',iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',rho:'ρ',sigma:'σ',tau:'τ',upsilon:'υ',phi:'φ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',
  Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',Phi:'Φ',Psi:'Ψ',Omega:'Ω',
  times:'×',div:'÷',cdot:'·',pm:'±',mp:'∓',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',equiv:'≡',sim:'∼',propto:'∝',infty:'∞',
  to:'→',rightarrow:'→',leftarrow:'←',leftrightarrow:'↔',Rightarrow:'⇒',Leftarrow:'⇐',Leftrightarrow:'⇔',rightleftharpoons:'⇌',uparrow:'↑',downarrow:'↓',
  int:'∫',sum:'∑',prod:'∏',partial:'∂',nabla:'∇',degree:'°',circ:'°',angle:'∠',triangle:'△',perp:'⊥',parallel:'∥',therefore:'∴',because:'∵',
  in:'∈',notin:'∉',subset:'⊂',subseteq:'⊆',cup:'∪',cap:'∩',emptyset:'∅',forall:'∀',exists:'∃',neg:'¬',land:'∧',lor:'∨',
  ldots:'…',cdots:'⋯',dots:'…',quad:' ',qquad:'  ',',':' ',';':' ','!':'',' ':' ',lbrace:'{',rbrace:'}',
  sin:'sin',cos:'cos',tan:'tan',sec:'sec',csc:'csc',cot:'cot',log:'log',ln:'ln',lim:'lim',exp:'exp',max:'max',min:'min',
  mathbb:'',displaystyle:'',left:'',right:'',big:'',Big:'',bigg:''
};
const _SS_SUP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','−':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','i':'ⁱ','x':'ˣ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','k':'ᵏ','m':'ᵐ','t':'ᵗ','y':'ʸ' };
const _SS_SUB = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎','a':'ₐ','e':'ₑ','i':'ᵢ','n':'ₙ','o':'ₒ','x':'ₓ','m':'ₘ','t':'ₜ' };
function _ssScript(s, map, mark) {
  if (s === '°' || s === '∘') return '°';
  const chars = Array.from(s);
  return chars.every(c => map[c]) ? chars.map(c => map[c]).join('') : mark + (chars.length > 1 ? '(' + s + ')' : s);
}
// Reads one {...} group (or one character) starting at index i; returns [content, nextIndex].
function _ssTexArg(t, i) {
  while (t[i] === ' ') i++;
  if (t[i] === '{') {
    let d = 0, j = i;
    for (; j < t.length; j++) { if (t[j] === '{') d++; else if (t[j] === '}' && --d === 0) break; }
    return [t.slice(i + 1, j), j + 1];
  }
  if (t[i] === '\\') { const m = /^\\[A-Za-z]+/.exec(t.slice(i)); if (m) return [m[0], i + m[0].length]; }
  return [t[i] || '', i + 1];
}
function ssTexToUnicode(tex) {
  let t = String(tex || '');
  let out = '', i = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(t.slice(i));
      const cmd = m[1]; i += m[0].length;
      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const [a, j] = _ssTexArg(t, i); const [b, k] = _ssTexArg(t, j); i = k;
        const A = ssTexToUnicode(a), B = ssTexToUnicode(b);
        out += (/^[\w.²³]+$/.test(A) ? A : '(' + A + ')') + '/' + (/^[\w.²³]+$/.test(B) ? B : '(' + B + ')');
      } else if (cmd === 'sqrt') {
        let root = '';
        if (t[i] === '[') { const e = t.indexOf(']', i); root = t.slice(i + 1, e); i = e + 1; }
        const [a, j] = _ssTexArg(t, i); i = j;
        const A = ssTexToUnicode(a);
        out += (root === '3' ? '∛' : root === '4' ? '∜' : '√') + (/^[\w.]+$/.test(A) ? A : '(' + A + ')');
      } else if (cmd === 'text' || cmd === 'mathrm' || cmd === 'textbf' || cmd === 'mathbf' || cmd === 'operatorname' || cmd === 'mathit' || cmd === 'boldsymbol') {
        const [a, j] = _ssTexArg(t, i); i = j; out += ssTexToUnicode(a);
      } else if (cmd === 'vec' || cmd === 'overrightarrow') { const [a, j] = _ssTexArg(t, i); i = j; out += ssTexToUnicode(a) + '⃗';
      } else if (cmd === 'hat') { const [a, j] = _ssTexArg(t, i); i = j; out += ssTexToUnicode(a) + '̂';
      } else if (cmd === 'bar' || cmd === 'overline') { const [a, j] = _ssTexArg(t, i); i = j; out += ssTexToUnicode(a) + '̄';
      } else if (cmd === 'dot') { const [a, j] = _ssTexArg(t, i); i = j; out += ssTexToUnicode(a) + '̇';
      } else if (cmd === '\\') { out += ' ';
      } else if (Object.prototype.hasOwnProperty.call(_SS_TEX_SYMBOLS, cmd)) {
        out += _SS_TEX_SYMBOLS[cmd]; if (t[i] === ' ' && /[A-Za-z0-9]/.test(t[i + 1] || '') && !/^(sin|cos|tan|sec|csc|cot|log|ln|lim|exp|max|min)$/.test(cmd)) i++; if (/^[a-z]+$/i.test(cmd) && /^(sin|cos|tan|sec|csc|cot|log|ln|lim|exp|max|min)$/.test(cmd) && t[i] !== '(' && t[i] !== ' ') out += ' ';
      } else { out += cmd.length === 1 ? cmd : ''; }
    } else if (c === '^' || c === '_') {
      const [a, j] = _ssTexArg(t, i + 1); i = j;
      out += _ssScript(ssTexToUnicode(a), c === '^' ? _SS_SUP : _SS_SUB, c === '^' ? '^' : '_');
    } else if (c === '{' || c === '}') { i++;
    } else if (c === '~') { out += ' '; i++;
    } else { out += c; i++; }
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

// Lifts $...$, $$...$$, \(...\) and \[...\] out of the text (not inside code
// fences) and returns the text with placeholders, plus the list of formulas.
// Written without regex look-behind so it also runs on older phones.
function ssProtectMath(text) {
  const store = [];
  const put = (tex, display) => { store.push({ tex: tex.trim(), display }); return '@@SSMATH' + (store.length - 1) + '@@'; };
  const protectSeg = (seg) => {
    seg = seg.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => put(t, true))
             .replace(/\\\[([\s\S]+?)\\\]/g, (m, t) => put(t, true))
             .replace(/\\\(([\s\S]+?)\\\)/g, (m, t) => put(t, false));
    let out = '', i = 0;
    while (i < seg.length) {
      const c = seg[i];
      if (c === '$' && seg[i + 1] !== undefined && !/\s|\$/.test(seg[i + 1])) {
        let j = i + 1, found = -1;
        while (j < seg.length && seg[j] !== '\n') {
          if (seg[j] === '$' && seg[j - 1] !== '\\' && !/\s/.test(seg[j - 1]) && !/\d/.test(seg[j + 1] || '')) { found = j; break; }
          j++;
        }
        if (found > 0) { out += put(seg.slice(i + 1, found), false); i = found + 1; continue; }
      }
      out += c; i++;
    }
    return out;
  };
  const parts = String(text || '').split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  const out = parts.map((seg, k) => (k % 2 === 1 ? seg : protectSeg(seg))).join('');
  return { text: out, store };
}
function ssRestoreMath(html, store, mode) {
  return html.replace(/@@SSMATH(\d+)@@/g, (m, n) => {
    const it = store[+n]; if (!it) return '';
    if (mode === 'katex' && window.katex) {
      try {
        return window.katex.renderToString(it.tex, { displayMode: it.display, throwOnError: false, strict: 'ignore', trust: false,
          macros: { '\\degree': '^{\\circ}', '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}' } });
      } catch (e) { /* fall through */ }
    }
    const u = ssEscapeHTML(ssTexToUnicode(it.tex));
    return it.display ? '<div class="ss-math-fb">' + u + '</div>' : '<span class="ss-math-fb">' + u + '</span>';
  });
}
function ssEnsureKatexCSS() {
  if (typeof document === 'undefined' || document.getElementById('ssKatexCss')) return;
  const l = document.createElement('link'); l.id = 'ssKatexCss'; l.rel = 'stylesheet'; l.href = SS_KATEX_CSS; document.head.appendChild(l);
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
function _ssSimpleMarkdownCore(text) {
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

function ssSimpleMarkdown(text) {
  const p = ssProtectMath(text);
  return ssRestoreMath(_ssSimpleMarkdownCore(p.text), p.store, 'plain');
}

// Renders `markdown` into element `el` as sanitized HTML. Returns true if the
// full renderer was used, false if it fell back to the simple one.
async function ssRenderRich(el, markdown, opts) {
  const breaks = !!(opts && opts.breaks);
  try {
    await Promise.all([ssLoadScript(SS_RICH_LIBS.marked), ssLoadScript(SS_RICH_LIBS.purify)]);
    if (!window.marked || !window.DOMPurify) throw new Error('renderer missing');
    const prot = ssProtectMath(String(markdown || ''));
    const rawHtml = window.marked.parse(prot.text, { gfm: true, breaks });
    // The AI's text is untrusted: sanitize it, and drop <img> so only the
    // verified Wikimedia figures below ever show pictures (the AI can
    // hallucinate image links that would just appear broken).
    const clean = window.DOMPurify.sanitize(rawHtml, {
      FORBID_TAGS: ['img', 'style', 'form', 'input', 'button', 'iframe', 'object', 'embed']
    });
    let mathMode = 'plain';
    if (prot.store.length) {
      try { await ssLoadScript(SS_RICH_LIBS.katex); ssEnsureKatexCSS(); if (window.katex) mathMode = 'katex'; } catch (e) { /* Unicode fallback */ }
    }
    el.innerHTML = ssRestoreMath(clean, prot.store, mathMode);
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

// Models often write labels with brackets, colons or slashes that Mermaid
// rejects. Wrapping every plain [label] in quotes fixes most failures.
function ssFixMermaid(code) {
  return String(code || '')
    .replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'")
    .split('\n').map(line => line.replace(/(\b[A-Za-z][\w-]*)\[([^\]\["]+)\]/g, (m, id, label) => id + '["' + label.replace(/"/g, "'") + '"]')).join('\n');
}

function _ssSvgToCanvas(svgEl, scale) {
  return new Promise((resolve, reject) => {
    const clone = svgEl.cloneNode(true);
    const vb = (svgEl.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const w = vb.length === 4 ? vb[2] : svgEl.getBoundingClientRect().width;
    const h = vb.length === 4 ? vb[3] : svgEl.getBoundingClientRect().height;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', w); clone.setAttribute('height', h);
    clone.removeAttribute('style');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', vb[0] || 0); bg.setAttribute('y', vb[1] || 0); bg.setAttribute('width', w); bg.setAttribute('height', h); bg.setAttribute('fill', '#ffffff');
    clone.insertBefore(bg, clone.firstChild);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve(c);
    };
    img.onerror = () => reject(new Error('could not draw diagram'));
    img.src = url;
  });
}
function ssSaveBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
async function ssDownloadDiagram(wrap, kind) {
  const svg = wrap.querySelector('svg'); if (!svg) return;
  try {
    if (kind === 'svg') {
      const clone = svg.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      ssSaveBlob(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }), 'studysphere-diagram.svg');
    } else {
      const canvas = await _ssSvgToCanvas(svg, 2.5);
      canvas.toBlob(b => b && ssSaveBlob(b, 'studysphere-diagram.png'), 'image/png');
    }
  } catch (e) { alert('Could not save that diagram. Try the SVG button, or take a screenshot.'); }
}

// Turns ```mermaid code blocks into drawn diagrams, each with Download SVG/PNG
// buttons. A diagram that still fails to parse after one automatic repair is
// removed rather than shown as an ugly error.
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
  window.mermaid.initialize({
    startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'neutral',
    fontFamily: 'Nunito, Arial, sans-serif', themeVariables: { fontSize: '16px' },
    flowchart: { htmlLabels: false, useMaxWidth: true, curve: 'basis', nodeSpacing: 40, rankSpacing: 45 }
  });
  let n = 0;
  for (const code of blocks) {
    const pre = code.closest('pre');
    const src = code.textContent;
    let svg = null;
    for (const attempt of [src, ssFixMermaid(src)]) {
      const id = `ssMermaid${Date.now()}_${n++}`;
      try { svg = (await window.mermaid.render(id, attempt)).svg; break; }
      catch (err) { const leftover = document.getElementById('d' + id) || document.getElementById(id); if (leftover) leftover.remove(); }
    }
    if (!svg) { pre.remove(); continue; }
    const wrap = document.createElement('div');
    wrap.className = 'ss-diagram';
    wrap.innerHTML = svg;
    const bar = document.createElement('div');
    bar.className = 'ss-diagram-bar'; bar.setAttribute('data-nodl', '1');
    [['svg', 'Download SVG'], ['png', 'Download PNG']].forEach(([k, label]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ss-mini-btn';
      b.innerHTML = '<i class="ti ti-download"></i> ' + label; b.addEventListener('click', () => ssDownloadDiagram(wrap, k));
      bar.appendChild(b);
    });
    wrap.appendChild(bar);
    pre.replaceWith(wrap);
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
      generator: 'search', gsrnamespace: '6', gsrlimit: '15',
      gsrsearch: `${q} filetype:bitmap|drawing`,
      prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '900'
    });
    const res = await fetch('https://commons.wikimedia.org/w/api.php?' + params.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const items = ssParseCommonsResults(await res.json(), 4);
    container.textContent = '';
    if (!items.length) return 0;

    const title = document.createElement('h4');
    title.innerHTML = '<i class="ti ti-photo"></i> Labelled diagrams from the web';
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
      const dl = document.createElement('button'); dl.type = 'button'; dl.className = 'ss-mini-btn'; dl.setAttribute('data-nodl', '1');
      dl.innerHTML = '<i class="ti ti-download"></i> Save image';
      dl.addEventListener('click', async () => {
        try { const r = await fetch(it.thumb); if (!r.ok) throw 0; ssSaveBlob(await r.blob(), (it.title || 'diagram').replace(/[^\w-]+/g, '-').slice(0, 50) + '.' + (/\.svg/i.test(it.thumb) ? 'png' : (it.thumb.split('.').pop().split('?')[0] || 'png'))); }
        catch (e) { window.open(it.page, '_blank', 'noopener'); }
      });
      fig.append(link, cap, dl);
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
  module.exports = { ssEscapeHTML, ssSplitDiagramQuery, ssSimpleMarkdown, ssParseCommonsResults, ssTexToUnicode, ssProtectMath, ssRestoreMath, ssFixMermaid };
}
