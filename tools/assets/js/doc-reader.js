// Lets students put a document into the AI Tutor's notes box: upload or drag a PDF, Word (.docx),
// .txt or .md file, or paste a copied file. The text is read in the browser and never uploaded anywhere.
(function () {
  const MAX = 30000;                       // characters the tutor will use (kept in step with ai-tutor.js)
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const MAMMOTH = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

  const area = document.getElementById('tutNotes'), wrap = document.getElementById('tutNotesWrap');
  if (!area || !wrap) return;

  const loaded = {};
  const loadScript = src => loaded[src] || (loaded[src] = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok;
    s.onerror = () => no(new Error('Could not load the file reader. Check your internet connection and try again.')); document.head.appendChild(s);
  }));

  // ---- Interface (added above the text box) ----
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px';
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn'; btn.style.cssText = 'padding:8px 14px;font-size:.85rem';
  btn.textContent = 'Upload a file (PDF, Word, TXT)';
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.pdf,.docx,.txt,.md,.markdown,.csv,text/plain,application/pdf'; input.hidden = true;
  const status = document.createElement('span');
  status.style.cssText = 'font-size:.82rem;color:var(--muted,#888)'; status.setAttribute('aria-live', 'polite');
  status.textContent = 'or paste text below, or drop a file here';
  bar.append(btn, input, status);
  wrap.insertBefore(bar, area);
  const counter = document.createElement('div');
  counter.style.cssText = 'font-size:.75rem;color:var(--muted,#888);margin-top:4px;text-align:right';
  area.after(counter);
  const say = (t, bad) => { status.textContent = t; status.style.color = bad ? '#c0392b' : 'var(--muted,#888)'; };
  const count = () => {
    const n = area.value.length;
    counter.textContent = `${n.toLocaleString()} / ${MAX.toLocaleString()} characters` + (n > MAX ? ' - only the first part will be used' : '');
    counter.style.color = n > MAX ? '#c0392b' : 'var(--muted,#888)';
  };
  area.addEventListener('input', count); count();

  // ---- Readers ----
  async function readPDF(file) {
    await loadScript(PDFJS); window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let out = '';
    for (let p = 1; p <= pdf.numPages && out.length < MAX * 1.2; p++) {
      const tc = await (await pdf.getPage(p)).getTextContent();
      out += tc.items.map(i => i.str).join(' ') + '\n\n';
      say(`Reading page ${p} of ${pdf.numPages}...`);
    }
    return { text: out, pages: pdf.numPages };
  }
  async function readDOCX(file) {
    await loadScript(MAMMOTH);
    return { text: (await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value };
  }

  async function handleFile(file) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (file.size > 25 * 1024 * 1024) return say('That file is over 25 MB. Try a smaller one, or paste the part you need.', true);
    try {
      say('Reading ' + file.name + '...');
      let r;
      if (name.endsWith('.pdf') || file.type === 'application/pdf') r = await readPDF(file);
      else if (name.endsWith('.docx')) r = await readDOCX(file);
      else if (name.endsWith('.doc')) return say('Old .doc files cannot be read. Save it as .docx or PDF and try again.', true);
      else if (/\.(txt|md|markdown|csv)$/.test(name) || file.type.startsWith('text/')) r = { text: await file.text() };
      else return say('That file type is not supported. Use PDF, Word (.docx), TXT or MD.', true);
      const text = (r.text || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      if (text.length < 20) return say('No readable text found. If this is a scan or photo, paste the text instead.', true);
      area.value = area.value.trim() ? area.value.trim() + '\n\n' + text : text;
      area.dispatchEvent(new Event('input'));
      say(`Loaded ${file.name}: ${text.length.toLocaleString()} characters` + (text.length > MAX ? ' (the tutor will use the first ' + MAX.toLocaleString() + ')' : '') + '.');
    } catch (e) { say(e.message || 'Could not read that file.', true); }
  }

  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { handleFile(input.files[0]); input.value = ''; });
  // Pasting a copied file (e.g. from your computer or Drive) into the box
  area.addEventListener('paste', e => {
    const f = e.clipboardData && e.clipboardData.files && e.clipboardData.files[0];
    if (f) { e.preventDefault(); handleFile(f); }
  });
  // Dropping a file onto the notes area
  ['dragenter', 'dragover'].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.style.outline = '2px dashed var(--primary,#d98ba3)'; }));
  ['dragleave', 'drop'].forEach(ev => wrap.addEventListener(ev, e => { e.preventDefault(); wrap.style.outline = ''; }));
  wrap.addEventListener('drop', e => handleFile(e.dataTransfer && e.dataTransfer.files[0]));
})();
