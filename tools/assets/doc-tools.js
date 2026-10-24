// ══════════════════════════════════════════════════════
//  DOC TOOLS — shared by the AI Study Tutor and the Notes Generator
// ══════════════════════════════════════════════════════
// 1. Reads almost any study file IN THE BROWSER (nothing is uploaded):
//    PDF (scanned pages too, via OCR) · Word .docx (.doc best effort) · PowerPoint .pptx
//    · Excel .xlsx/.xls/.csv · OpenDocument .odt/.odp/.ods · .txt .md .html .rtf .json ...
//    · photos of notes (.jpg .png ... via OCR)
// 2. Keeps the WHOLE document, however long, and finds the parts that matter for each
//    question, so the AI always sees the right pages instead of a cut-off beginning.
// 3. Optional web lookup (Wikipedia) when the student asks to go beyond their notes.

const SS_DOC_LIBS = {
  pdfjs:   'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfWork: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  mammoth: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  jszip:   'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  xlsx:    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  tess:    'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
};
const SS_DOC_ACCEPT = '.pdf,.docx,.doc,.pptx,.xlsx,.xls,.csv,.tsv,.odt,.odp,.ods,.txt,.md,.markdown,.html,.htm,.rtf,.json,.xml,.tex,.png,.jpg,.jpeg,.webp,.bmp,.gif';
const SS_DOC_MAX_BYTES = 40 * 1024 * 1024;
const SS_OCR_MAX_PAGES = 40;

const _ssDocScripts = {};
function _ssDocLoad(src) {
  return _ssDocScripts[src] || (_ssDocScripts[src] = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = ok; s.onerror = () => { delete _ssDocScripts[src]; no(new Error('Could not load the file reader. Check your internet connection and try again.')); };
    document.head.appendChild(s);
  }));
}
const _decodeXml = s => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');
const _ext = name => (String(name).toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || '';

// ── OCR (photos and scanned pages) ──
async function ssOCR(image, say, label) {
  await _ssDocLoad(SS_DOC_LIBS.tess);
  const res = await window.Tesseract.recognize(image, 'eng', {
    logger: m => { if (say && m.status === 'recognizing text') say('Reading ' + label + ' … ' + Math.round(m.progress * 100) + '%'); else if (say && /load|init/.test(m.status || '')) say('Getting the text reader ready…'); }
  });
  return (res.data && res.data.text) || '';
}

// ── Readers: each returns { sections:[{label,text}], warn? } ──
async function _readPDF(file, say) {
  await _ssDocLoad(SS_DOC_LIBS.pdfjs); window.pdfjsLib.GlobalWorkerOptions.workerSrc = SS_DOC_LIBS.pdfWork;
  const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const sections = [], blank = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    say('Reading page ' + p + ' of ' + pdf.numPages + '…');
    const page = await pdf.getPage(p), tc = await page.getTextContent();
    let text = '', lastY = null;
    tc.items.forEach(it => {
      const y = it.transform ? it.transform[5] : 0;
      if (lastY !== null && Math.abs(y - lastY) > 3) text += '\n'; else if (text && !/\s$/.test(text)) text += ' ';
      text += it.str; lastY = y;
    });
    text = text.replace(/[ \t]+\n/g, '\n').trim();
    if (text.length < 25) blank.push(p); else sections.push({ label: 'Page ' + p, text });
  }
  let warn = '';
  if (blank.length) {
    const todo = blank.slice(0, SS_OCR_MAX_PAGES);
    try {
      for (const p of todo) {
        const page = await pdf.getPage(p), vp = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas'); canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
        const text = (await ssOCR(canvas, say, 'scanned page ' + p)).trim();
        if (text.length >= 15) sections.push({ label: 'Page ' + p + ' (scanned)', text });
      }
      sections.sort((a, b) => parseInt(a.label.replace(/\D/g, '')) - parseInt(b.label.replace(/\D/g, '')));
      warn = 'Some pages were scans, so their text was read by OCR — equations and diagrams may be imperfect.';
      if (blank.length > todo.length) warn += ' Only the first ' + SS_OCR_MAX_PAGES + ' scanned pages were read.';
    } catch (e) { warn = blank.length + ' scanned page(s) could not be read (OCR unavailable).'; }
  }
  return { sections, warn, pages: pdf.numPages };
}
async function _readDOCX(file) {
  await _ssDocLoad(SS_DOC_LIBS.mammoth);
  const buf = await file.arrayBuffer();
  let text = '';
  try { text = (await window.mammoth.convertToMarkdown({ arrayBuffer: buf })).value.replace(/\\([\\`*_{}\[\]()#+\-.!>|])/g, '$1').replace(/__/g, ''); }
  catch (e) { text = (await window.mammoth.extractRawText({ arrayBuffer: buf })).value; }
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  return { sections: [{ label: file.name, text }] };
}
async function _readPPTX(file, say) {
  await _ssDocLoad(SS_DOC_LIBS.jszip);
  const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
  const num = n => parseInt((n.match(/(\d+)\.xml$/) || [0, 0])[1], 10);
  const slideFiles = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => num(a) - num(b));
  const paras = xml => xml.split('</a:p>').map(p => (p.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || []).map(t => _decodeXml(t.replace(/<[^>]+>/g, ''))).join('')).filter(Boolean).join('\n');
  const sections = [];
  for (const f of slideFiles) {
    say('Reading slide ' + num(f) + ' of ' + slideFiles.length + '…');
    let text = paras(await zip.file(f).async('string'));
    const notes = zip.file('ppt/notesSlides/notesSlide' + num(f) + '.xml');
    if (notes) { const n = paras(await notes.async('string')); if (n) text += '\n[Speaker notes] ' + n; }
    if (text.trim()) sections.push({ label: 'Slide ' + num(f), text });
  }
  return { sections, pages: slideFiles.length };
}
async function _readSheet(file) {
  await _ssDocLoad(SS_DOC_LIBS.xlsx);
  const wb = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
  return { sections: wb.SheetNames.map(n => ({ label: 'Sheet: ' + n, text: window.XLSX.utils.sheet_to_csv(wb.Sheets[n]) })).filter(s => s.text.trim()) };
}
async function _readODF(file) {
  await _ssDocLoad(SS_DOC_LIBS.jszip);
  const zip = await window.JSZip.loadAsync(await file.arrayBuffer());
  const f = zip.file('content.xml'); if (!f) throw new Error('That file could not be read.');
  const xml = (await f.async('string')).replace(/<\/text:(p|h)>/g, '\n').replace(/<text:tab\/>/g, '\t').replace(/<text:line-break\/>/g, '\n').replace(/<[^>]+>/g, '');
  return { sections: [{ label: file.name, text: _decodeXml(xml) }] };
}
async function _readHTML(file) {
  const doc = new DOMParser().parseFromString(await file.text(), 'text/html');
  doc.querySelectorAll('script,style,nav,header,footer,noscript').forEach(n => n.remove());
  doc.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6,tr,br,section').forEach(n => n.append('\n'));
  return { sections: [{ label: file.name, text: (doc.body ? doc.body.textContent : '') }] };
}
async function _readRTF(file) {
  const t = (await file.text()).replace(/\{\\\*[^{}]*\}/g, '').replace(/\\par[d]?/g, '\n').replace(/\\'([0-9a-f]{2})/gi, (m, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\[a-z]+-?\d* ?/gi, '').replace(/[{}]/g, '');
  return { sections: [{ label: file.name, text: t }] };
}
async function _readLegacyDOC(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const grab = dec => (dec.match(/[A-Za-z0-9][^\u0000-\u0008\u000E-\u001F\uFFFD]{7,}/g) || []).filter(s => /[a-z]{3}/i.test(s) && /\s/.test(s)).join('\n');
  const a = grab(new TextDecoder('utf-16le').decode(bytes)), b = grab(new TextDecoder('latin1').decode(bytes));
  const text = a.length > b.length ? a : b;
  return { sections: [{ label: file.name, text }], warn: 'Old .doc files lose formatting and may include stray text. For best results, save it as .docx or PDF in Word and upload that.' };
}
async function _readImage(file, say) {
  const text = await ssOCR(file, say, 'your photo');
  return { sections: [{ label: file.name + ' (photo)', text }], warn: 'Text was read from the photo by OCR — check equations and symbols.' };
}

async function ssReadFile(file, say) {
  const ext = _ext(file.name), type = file.type || '';
  if (file.size > SS_DOC_MAX_BYTES) throw new Error('That file is over 40 MB. Try a smaller file or split it.');
  let r;
  if (ext === 'pdf' || type === 'application/pdf') r = await _readPDF(file, say);
  else if (ext === 'docx') r = await _readDOCX(file);
  else if (ext === 'doc') r = await _readLegacyDOC(file);
  else if (ext === 'pptx') r = await _readPPTX(file, say);
  else if (ext === 'ppt') throw new Error('Old .ppt files cannot be read. Save it as .pptx or PDF in PowerPoint and upload that.');
  else if (['xlsx', 'xls'].includes(ext)) r = await _readSheet(file);
  else if (['odt', 'odp', 'ods'].includes(ext)) r = await _readODF(file);
  else if (['html', 'htm'].includes(ext)) r = await _readHTML(file);
  else if (ext === 'rtf') r = await _readRTF(file);
  else if (/^image\//.test(type) || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext)) r = await _readImage(file, say);
  else {
    const t = await file.text();
    const printable = (t.match(/[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g) || []).length / Math.max(1, t.length);
    if (printable < 0.9) throw new Error('That file type is not supported. Try PDF, Word, PowerPoint, Excel, a photo, or a text file.');
    r = { sections: [{ label: file.name, text: t }] };
  }
  r.sections = r.sections.map(s => ({ label: s.label, text: s.text.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() })).filter(s => s.text.length > 0);
  const chars = r.sections.reduce((a, s) => a + s.text.length, 0);
  if (chars < 20) throw new Error('No readable text found in that file. If it is a scan or photo, try a clearer picture or paste the text.');
  return { name: file.name, size: file.size, kind: ext || 'file', sections: r.sections, chars, warn: r.warn || '', pages: r.pages || r.sections.length };
}

// ── Search over the whole document (BM25) ──
const _SS_STOP = new Set('a an the and or but if of to in on at by for with from as is are was were be been being it its this that these those i you he she we they me my your our their them what which who whom how why when where do does did can could should would will shall may might must not no so than then there here about into over under again also just very more most some any each other such only own same too up down out off please tell explain show give want need like know'.split(' '));
function _ssTok(s) {
  return (String(s).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(w => w.length > 1 && !_SS_STOP.has(w)).map(w => w.length > 5 ? w.replace(/(ing|ed|es)$/, '') : w.length > 3 ? w.replace(/s$/, '') : w);
}
function _ssSplitText(text, max) {
  const out = []; let cur = '';
  const pieces = text.split(/\n{2,}/).flatMap(p => p.length > max ? p.replace(/([.!?])\s+/g, '$1\u0001').split(/\u0001|\n/).reduce((a, s) => { if (s.length > max) { for (let i = 0; i < s.length; i += max) a.push(s.slice(i, i + max)); } else a.push(s); return a; }, []) : [p]);
  pieces.forEach(p => { if (cur && (cur.length + p.length + 2) > max) { out.push(cur); cur = ''; } cur += (cur ? '\n\n' : '') + p; });
  if (cur) out.push(cur);
  return out;
}
function ssCreateDocStore() {
  const files = []; let pasted = ''; let chunks = null, idf = null, avg = 1;
  const ALL = () => (pasted.trim() ? files.concat([{ id: 'pasted', name: 'Pasted notes', kind: 'text', sections: [{ label: 'Pasted notes', text: pasted.trim() }], chars: pasted.trim().length, warn: '' }]) : files.slice());
  function build() {
    chunks = [];
    ALL().forEach(d => d.sections.forEach(s => _ssSplitText(s.text, 1100).forEach(t => {
      const tf = new Map(); const toks = _ssTok(t); toks.forEach(w => tf.set(w, (tf.get(w) || 0) + 1));
      chunks.push({ i: chunks.length, doc: d.name, label: s.label, text: t, tf, len: toks.length || 1 });
    })));
    idf = new Map(); chunks.forEach(c => c.tf.forEach((v, w) => idf.set(w, (idf.get(w) || 0) + 1)));
    const N = chunks.length || 1; idf.forEach((df, w) => idf.set(w, Math.log(1 + (N - df + 0.5) / (df + 0.5))));
    avg = chunks.reduce((a, c) => a + c.len, 0) / N || 1;
  }
  const store = {
    docs: ALL,
    count: () => ALL().length,
    totalChars: () => ALL().reduce((a, d) => a + d.chars, 0),
    setPasted(t) { pasted = t || ''; chunks = null; },
    remove(id) { const i = files.findIndex(f => f.id === id); if (i >= 0) files.splice(i, 1); chunks = null; },
    clear() { files.length = 0; pasted = ''; chunks = null; },
    async addFiles(list, say, onEach) {
      const problems = [];
      for (const f of Array.from(list)) {
        try {
          const d = await ssReadFile(f, m => say && say(m));
          d.id = 'f' + Date.now() + Math.random().toString(36).slice(2, 6); files.push(d); chunks = null;
          if (onEach) onEach(d);
        } catch (e) { problems.push(f.name + ': ' + (e.message || 'could not be read')); }
      }
      return problems;
    },
    chunks() { if (!chunks) build(); return chunks; },
    // Best-matching excerpts for a question, returned in reading order.
    retrieve(query, opts) {
      opts = opts || {}; const k = opts.k || 6, budget = opts.budget || 7000;
      const cs = store.chunks(); if (!cs.length) return [];
      const q = _ssTok(query); if (!q.length) return [];
      const scored = cs.map(c => {
        let s = 0; q.forEach(w => { const f = c.tf.get(w); if (f) s += (idf.get(w) || 0) * (f * 2.5) / (f + 1.5 * (0.25 + 0.75 * c.len / avg)); });
        return { c, s };
      }).filter(x => x.s > 0 && !(opts.exclude && opts.exclude.has(x.c.i))).sort((a, b) => b.s - a.s);
      const pick = []; let used = 0;
      for (const x of scored) { if (pick.length >= k || used + x.c.text.length > budget) continue; pick.push(x.c); used += x.c.text.length; }
      return pick.sort((a, b) => a.i - b.i);
    },
    // The next excerpts in reading order, starting at chunk index `from`.
    sequence(from, budget) {
      const cs = store.chunks(), out = []; let used = 0;
      for (let i = Math.max(0, from); i < cs.length && used + cs[i].text.length <= (budget || 3500); i++) { out.push(cs[i]); used += cs[i].text.length; }
      return out;
    },
    // A short table of contents: headings found in the files (or page/slide labels).
    outline(max) {
      max = max || 40; const lines = [];
      ALL().forEach(d => {
        const found = [];
        d.sections.forEach(s => s.text.split('\n').forEach(l => {
          const t = l.trim().replace(/^#{1,4}\s*/, '');
          if (t.length < 4 || t.length > 80) return;
          const md = /^#{1,4}\s/.test(l.trim()), num = /^(\d+(\.\d+){0,2}|[A-Z]|[IVX]+)[.)]?\s+[A-Z\u0980-\u09FF]/.test(t), caps = /^[A-Z0-9][A-Z0-9 ,:&\-()/']{5,}$/.test(t) && /[A-Z]{3}/.test(t), kw = /^(chapter|unit|topic|section|lesson|module|part)\s+\w+/i.test(t);
          if (md || num || caps || kw) found.push('- ' + t.replace(/\s+/g, ' ') + ' (' + s.label.replace(/ \(scanned\)| \(photo\)/, '') + ')');
        }));
        const uniq = Array.from(new Set(found));
        if (uniq.length) { lines.push(d.name + ':'); lines.push(...uniq.slice(0, Math.ceil(max / ALL().length))); }
        else lines.push(d.name + ': ' + d.sections.length + ' part(s), ' + d.chars.toLocaleString() + ' characters');
      });
      return lines.join('\n').slice(0, 2500);
    }
  };
  return store;
}

// ── Web lookup (Wikipedia: free, no key, works from any website) ──
async function ssWebLookup(query, n) {
  const q = String(query || '').replace(/\s+/g, ' ').trim().slice(0, 200); if (!q) return [];
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const params = new URLSearchParams({ action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: q, gsrlimit: String(n || 3), prop: 'extracts|info', exintro: '1', explaintext: '1', exchars: '1100', inprop: 'url' });
    const res = await fetch('https://en.wikipedia.org/w/api.php?' + params.toString(), { signal: ctl.signal });
    clearTimeout(timer); if (!res.ok) return [];
    const pages = Object.values(((await res.json()).query || {}).pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
    return pages.filter(p => p.extract).map(p => ({ title: p.title, url: p.fullurl, text: p.extract }));
  } catch (e) { clearTimeout(timer); return []; }
}

// ── Uploader widget (drop zone + file list + paste box) ──
// host: element to fill. store: from ssCreateDocStore(). opts.onChange: called after any change.
function ssMountUploader(host, store, opts) {
  opts = opts || {};
  host.classList.add('ss-up');
  host.innerHTML = `
    <div class="ss-up-drop" tabindex="0" role="button" aria-label="Upload your notes">
      <i class="ti ti-cloud-upload"></i>
      <div><b>Upload your notes</b> — drop files here or <u>choose files</u></div>
      <small>PDF · Word · PowerPoint · Excel · photos of notes · text files. The whole file is used, not just the start. Files stay in your browser.</small>
    </div>
    <input type="file" class="ss-up-input" multiple hidden accept="${SS_DOC_ACCEPT}">
    <div class="ss-up-status" aria-live="polite"></div>
    <div class="ss-up-files"></div>
    <details class="ss-up-paste"><summary>Or paste text instead</summary><textarea rows="5" placeholder="Paste a textbook excerpt, lecture notes or slide text here…"></textarea></details>`;
  const drop = host.querySelector('.ss-up-drop'), input = host.querySelector('.ss-up-input'), status = host.querySelector('.ss-up-status'), list = host.querySelector('.ss-up-files'), area = host.querySelector('textarea');
  const say = (t, bad) => { status.textContent = t || ''; status.classList.toggle('bad', !!bad); };
  const fmt = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
  function render() {
    list.innerHTML = store.docs().filter(d => d.id !== 'pasted').map(d => `<div class="ss-up-chip"><i class="ti ti-file-text"></i><span class="nm" title="${ssEscapeHTML(d.name)}">${ssEscapeHTML(d.name)}</span><small>${d.pages && d.pages > 1 ? d.pages + (d.kind === 'pptx' ? ' slides · ' : ' pages · ') : ''}${d.chars.toLocaleString()} characters</small><button type="button" data-rm="${d.id}" aria-label="Remove ${ssEscapeHTML(d.name)}"><i class="ti ti-x"></i></button>${d.warn ? `<em>${ssEscapeHTML(d.warn)}</em>` : ''}</div>`).join('');
    if (opts.onChange) opts.onChange(store);
  }
  async function take(fileList) {
    if (!fileList || !fileList.length) return;
    drop.classList.add('busy');
    const problems = await store.addFiles(fileList, m => say(m));
    drop.classList.remove('busy');
    if (problems.length) say(problems.join('  ·  '), true);
    else say('Loaded. The tutor/notes will use all of it.');
    render();
  }
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { take(input.files); input.value = ''; });
  list.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { store.remove(b.dataset.rm); say(''); render(); } });
  area.addEventListener('input', () => { store.setPasted(area.value); if (opts.onChange) opts.onChange(store); });
  area.addEventListener('paste', e => { const fs = e.clipboardData && e.clipboardData.files; if (fs && fs.length) { e.preventDefault(); take(fs); } });
  ['dragenter', 'dragover'].forEach(ev => host.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => host.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  host.addEventListener('drop', e => take(e.dataTransfer && e.dataTransfer.files));
  return { render, say, reset() { store.clear(); area.value = ''; say(''); render(); } };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { ssCreateDocStore, ssReadFile };
