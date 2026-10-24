// ══════════════════════════════════════════════════════
//  DOWNLOAD MENU — shared by the AI Study Tutor and the Notes Generator
// ══════════════════════════════════════════════════════
// Adds one "Download" button with many formats, all made in the browser
// (nothing is uploaded anywhere):
//   PDF · Word (.docx, diagrams included) · Web page (.html) · Markdown (.md)
//   · Plain text (.txt) · Image (.png) · Copy to clipboard
// Needs rich-output.js (loaded first) for the maths/diagram helpers.

const SS_DL_LIBS = {
  jszip: ['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'],
  h2c:   ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js']
};

const SS_EXPORT_CSS = `
  body{font-family:'Nunito','Segoe UI',Arial,sans-serif;color:#1d1b2e;line-height:1.6;max-width:820px;margin:0 auto;padding:28px;font-size:14.5px}
  h1{font-size:1.7rem;color:#4338CA;margin:0 0 4px} h2{font-size:1.25rem;color:#4338CA;margin:22px 0 6px;border-bottom:2px solid #E0DCFF;padding-bottom:3px}
  h3,h4{font-size:1.05rem;color:#4338CA;margin:16px 0 4px} p{margin:0 0 9px} ul,ol{padding-left:22px;margin:4px 0 10px} li{margin-bottom:3px}
  table{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:.92em} th,td{border:1px solid #c9c4ee;padding:6px 9px;text-align:left;vertical-align:top} th{background:#EEEBFF}
  pre,code{background:#f4f2ff;border-radius:5px;font-family:Consolas,monospace;font-size:.9em} pre{padding:10px;overflow:auto} code{padding:1px 4px}
  blockquote{margin:8px 0;padding:4px 12px;border-left:3px solid #4338CA;color:#555}
  .ss-diagram{text-align:center;margin:12px 0;page-break-inside:avoid} .ss-diagram svg{max-width:100%;height:auto}
  .ss-figures{display:grid;grid-template-columns:repeat(2,1fr);gap:10px} .ss-figures figure{margin:0;border:1px solid #ddd;border-radius:8px;padding:6px;page-break-inside:avoid} .ss-figures img{width:100%;height:auto;max-height:260px;object-fit:contain}
  .ss-figures figcaption{font-size:.72rem;color:#666} .ss-math-fb{font-family:'Cambria Math','Segoe UI Symbol',serif} div.ss-math-fb{text-align:center;margin:8px 0}
  .ss-meta{color:#777;font-size:.8rem;margin-bottom:14px} .katex-display{margin:.8em 0;overflow-x:auto;overflow-y:hidden}
  @page{margin:14mm}
`;

function _ssDlLoad(urls) { return ssLoadScript(urls); }
function _ssSlug(s) { return String(s || 'notes').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'notes'; }
function _ssToast(msg) { if (typeof showPtsToast === 'function') showPtsToast(msg); }

// A copy of the rendered content with all buttons and controls removed.
function ssCleanClone(root) {
  const c = root.cloneNode(true);
  c.querySelectorAll('[data-nodl], .ss-diagram-bar, button, .tutor-msg-actions, script').forEach(n => n.remove());
  c.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
  return c;
}

function ssFullHTML(title, root) {
  const clone = ssCleanClone(root);
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + ssEscapeHTML(title) + '</title>' +
    '<link rel="stylesheet" href="' + SS_KATEX_CSS + '">' +
    '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&display=swap" rel="stylesheet">' +
    '<style>' + SS_EXPORT_CSS + '</style></head><body><h1>' + ssEscapeHTML(title) + '</h1>' +
    '<p class="ss-meta">Made with StudySphere · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</p>' +
    clone.innerHTML + '</body></html>';
}

// ── DOM → simple blocks (shared by Word and plain-text export) ──
function _ssMathText(el) {
  const ann = el.querySelector && el.querySelector('annotation[encoding="application/x-tex"]');
  return ann ? ssTexToUnicode(ann.textContent) : (el.textContent || '');
}
function _ssRuns(node, fmt, out) {
  fmt = fmt || {}; out = out || [];
  node.childNodes.forEach(ch => {
    if (ch.nodeType === 3) { const t = ch.nodeValue.replace(/\s+/g, ' '); if (t) out.push(Object.assign({ text: t }, fmt)); return; }
    if (ch.nodeType !== 1) return;
    const tag = ch.tagName;
    if (ch.classList.contains('katex-display') || ch.classList.contains('katex')) {
      const el = ch.classList.contains('katex-display') ? ch.querySelector('.katex') || ch : ch;
      out.push(Object.assign({ text: ' ' + _ssMathText(el) + ' ' }, fmt, { i: true })); return;
    }
    if (ch.classList.contains('ss-math-fb')) { out.push(Object.assign({ text: ch.textContent }, fmt, { i: true })); return; }
    if (tag === 'BR') { out.push({ text: '\n', br: true }); return; }
    if (tag === 'UL' || tag === 'OL') return;
    const f = Object.assign({}, fmt);
    if (tag === 'STRONG' || tag === 'B') f.b = true;
    if (tag === 'EM' || tag === 'I') f.i = true;
    if (tag === 'CODE') f.code = true;
    _ssRuns(ch, f, out);
  });
  return out;
}
async function ssDomToBlocks(root, withImages) {
  const blocks = [];
  const walk = async (el, listCtx) => {
    for (const ch of Array.from(el.children)) {
      const tag = ch.tagName;
      if (/^H[1-6]$/.test(tag)) blocks.push({ t: 'h', level: Math.min(+tag[1], 4), runs: _ssRuns(ch) });
      else if (tag === 'P') { const r = _ssRuns(ch); if (r.some(x => x.text.trim())) blocks.push({ t: 'p', runs: r }); }
      else if (tag === 'UL' || tag === 'OL') {
        const ordered = tag === 'OL', level = listCtx ? listCtx.level + 1 : 0;
        const listId = blocks.length + '_' + level;
        for (const li of Array.from(ch.children)) {
          if (li.tagName !== 'LI') continue;
          blocks.push({ t: 'li', ordered, level, listId, runs: _ssRuns(li) });
          await walk(li, { level });
        }
      }
      else if (tag === 'TABLE') {
        const rows = Array.from(ch.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(td => ({ head: td.tagName === 'TH', runs: _ssRuns(td) })));
        if (rows.length) blocks.push({ t: 'table', rows });
      }
      else if (tag === 'PRE') blocks.push({ t: 'code', text: ch.textContent.replace(/\n$/, '') });
      else if (tag === 'BLOCKQUOTE') blocks.push({ t: 'quote', runs: _ssRuns(ch) });
      else if (ch.classList.contains('ss-diagram')) {
        const svg = ch.querySelector('svg');
        if (withImages && svg && typeof _ssSvgToCanvas === 'function') {
          try {
            const canvas = await _ssSvgToCanvas(svg, 2);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
            blocks.push({ t: 'img', data: new Uint8Array(await blob.arrayBuffer()), w: canvas.width / 2, h: canvas.height / 2 });
          } catch (e) { blocks.push({ t: 'p', runs: [{ text: '[Diagram — see the PDF or web page version]', i: true }] }); }
        }
      }
      else if (ch.classList.contains('katex-display')) blocks.push({ t: 'p', center: true, runs: [{ text: _ssMathText(ch), i: true }] });
      else if (ch.classList.contains('ss-math-fb') && tag === 'DIV') blocks.push({ t: 'p', center: true, runs: [{ text: ch.textContent, i: true }] });
      else if (ch.classList.contains('ss-figures')) {
        ch.querySelectorAll('figcaption strong').forEach(s => blocks.push({ t: 'p', runs: [{ text: 'Diagram on the web: ' + s.textContent, i: true }] }));
      }
      else if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE') await walk(ch, listCtx);
    }
  };
  await walk(root, null);
  return blocks;
}
function ssBlocksToText(blocks, title) {
  const rt = runs => runs.map(r => r.text).join('').replace(/[ \t]+/g, ' ').trim();
  const out = [String(title || '').toUpperCase(), '='.repeat(Math.min(60, String(title || '').length)), ''];
  const counters = {};
  blocks.forEach(b => {
    if (b.t === 'h') out.push('', b.runs.length ? rt(b.runs).toUpperCase() : '', '-'.repeat(Math.min(40, rt(b.runs).length)));
    else if (b.t === 'p' || b.t === 'quote') out.push(rt(b.runs), '');
    else if (b.t === 'li') {
      const pad = '  '.repeat(b.level);
      if (b.ordered) { counters[b.listId] = (counters[b.listId] || 0) + 1; out.push(pad + counters[b.listId] + '. ' + rt(b.runs)); }
      else out.push(pad + '• ' + rt(b.runs));
    }
    else if (b.t === 'table') { b.rows.forEach(r => out.push(r.map(c => rt(c.runs)).join('  |  '))); out.push(''); }
    else if (b.t === 'code') out.push(b.text, '');
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ── Word (.docx) ──
const _x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
function _docxRuns(runs, extra) {
  return runs.map(r => {
    if (r.br) return '<w:r><w:br/></w:r>';
    const pr = (r.b || extra && extra.b ? '<w:b/>' : '') + (r.i ? '<w:i/>' : '') + (r.code ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:shd w:val="clear" w:color="auto" w:fill="F4F2FF"/>' : '') + (extra && extra.color ? '<w:color w:val="' + extra.color + '"/>' : '');
    return '<w:r>' + (pr ? '<w:rPr>' + pr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + _x(r.text) + '</w:t></w:r>';
  }).join('');
}
async function ssBuildDocx(blocks, title, JSZipCtor) {
  const zip = new JSZipCtor();
  const rels = [], media = [];
  let body = '', numIds = 2, listNum = {}, imgN = 0;
  const numXml = [];
  const para = (inner, ppr) => '<w:p>' + (ppr ? '<w:pPr>' + ppr + '</w:pPr>' : '') + inner + '</w:p>';
  body += para(_docxRuns([{ text: title }]), '<w:pStyle w:val="Title"/>');
  body += para(_docxRuns([{ text: 'Made with StudySphere · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), i: true }], { color: '777777' }));
  blocks.forEach(b => {
    if (b.t === 'h') body += para(_docxRuns(b.runs), '<w:pStyle w:val="Heading' + Math.min(b.level, 3) + '"/>');
    else if (b.t === 'p') body += para(_docxRuns(b.runs), b.center ? '<w:jc w:val="center"/>' : '<w:spacing w:after="120"/>');
    else if (b.t === 'quote') body += para(_docxRuns(b.runs), '<w:ind w:left="500"/><w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="4338CA"/></w:pBdr>');
    else if (b.t === 'li') {
      let id = 1;
      if (b.ordered) { if (!listNum[b.listId]) { listNum[b.listId] = ++numIds; numXml.push('<w:num w:numId="' + numIds + '"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>'); } id = listNum[b.listId]; }
      body += para(_docxRuns(b.runs), '<w:numPr><w:ilvl w:val="' + Math.min(b.level, 3) + '"/><w:numId w:val="' + id + '"/></w:numPr><w:spacing w:after="40"/>');
    }
    else if (b.t === 'code') body += b.text.split('\n').map(l => para('<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/></w:rPr><w:t xml:space="preserve">' + _x(l) + '</w:t></w:r>', '<w:shd w:val="clear" w:color="auto" w:fill="F4F2FF"/><w:spacing w:after="0"/>')).join('');
    else if (b.t === 'table') {
      const cols = Math.max(...b.rows.map(r => r.length)), w = Math.floor(9000 / cols);
      body += '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => '<w:' + s + ' w:val="single" w:sz="4" w:space="0" w:color="B8B2E8"/>').join('') + '</w:tblBorders><w:tblCellMar><w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + ('<w:gridCol w:w="' + w + '"/>').repeat(cols) + '</w:tblGrid>' +
        b.rows.map(r => '<w:tr>' + r.map(c => '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (c.head ? '<w:shd w:val="clear" w:color="auto" w:fill="EEEBFF"/>' : '') + '</w:tcPr>' + para(_docxRuns(c.runs, { b: c.head }), '<w:spacing w:after="0"/>') + '</w:tc>').join('') + '</w:tr>').join('') + '</w:tbl>' + para('');
    }
    else if (b.t === 'img') {
      imgN++; const name = 'image' + imgN + '.png', rid = 'rIdImg' + imgN;
      media.push([name, b.data]); rels.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + name + '"/>');
      const maxW = 600, k = Math.min(1, maxW / b.w), cx = Math.round(b.w * k * 9525), cy = Math.round(b.h * k * 9525);
      body += para('<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + imgN + '" name="Diagram ' + imgN + '"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + imgN + '" name="' + name + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>', '<w:jc w:val="center"/><w:spacing w:before="120" w:after="160"/>');
    }
  });
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
  const bullet = lvl => '<w:lvl w:ilvl="' + lvl + '"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="' + ['•', '◦', '▪', '•'][lvl] + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + (500 + lvl * 360) + '" w:hanging="260"/></w:pPr></w:lvl>';
  const dec = lvl => '<w:lvl w:ilvl="' + lvl + '"><w:start w:val="1"/><w:numFmt w:val="' + (lvl % 2 ? 'lowerLetter' : 'decimal') + '"/><w:lvlText w:val="%' + (lvl + 1) + '."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + (500 + lvl * 360) + '" w:hanging="320"/></w:pPr></w:lvl>';
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdSt" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdNum" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>' + rels.join('') + '</Relationships>');
  zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>');
  zip.file('word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:b/><w:color w:val="4338CA"/><w:sz w:val="44"/></w:rPr></w:style>' +
    [[1, 32, 280], [2, 26, 220], [3, 23, 160]].map(h => '<w:style w:type="paragraph" w:styleId="Heading' + h[0] + '"><w:name w:val="heading ' + h[0] + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="' + h[2] + '" w:after="80"/><w:outlineLvl w:val="' + (h[0] - 1) + '"/></w:pPr><w:rPr><w:b/><w:color w:val="4338CA"/><w:sz w:val="' + h[1] + '"/></w:rPr></w:style>').join('') + '</w:styles>');
  zip.file('word/numbering.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' + [0, 1, 2, 3].map(bullet).join('') + '</w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>' + [0, 1, 2, 3].map(dec).join('') + '</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>' + numXml.join('') + '</w:numbering>');
  media.forEach(([n, d]) => zip.file('word/media/' + n, d));
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// ── The menu ──
// opts: { getRoot(): Element with the rendered content, getMarkdown(): string, title: string|(()=>string) }
function ssMakeDownloadMenu(opts) {
  const wrap = document.createElement('div');
  wrap.className = 'ss-dl'; wrap.setAttribute('data-nodl', '1');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn btn-sm ss-dl-btn';
  btn.innerHTML = '<i class="ti ti-download"></i> Download <i class="ti ti-chevron-down"></i>';
  const menu = document.createElement('div');
  menu.className = 'ss-dl-menu'; menu.hidden = true;
  const items = [
    ['pdf', 'ti-file-type-pdf', 'PDF', 'Opens print — choose “Save as PDF”'],
    ['docx', 'ti-file-type-docx', 'Word (.docx)', 'Editable, with diagrams'],
    ['html', 'ti-file-type-html', 'Web page (.html)', 'Opens in any browser'],
    ['md', 'ti-markdown', 'Markdown (.md)', 'For Notion, Obsidian, GitHub'],
    ['txt', 'ti-file-text', 'Plain text (.txt)', 'Simple, works everywhere'],
    ['png', 'ti-photo-down', 'Image (.png)', 'One picture, easy to share'],
    ['copy', 'ti-copy', 'Copy as text', 'Paste into WhatsApp or email']
  ];
  menu.innerHTML = items.map(i => '<button type="button" data-fmt="' + i[0] + '"><i class="ti ' + i[1] + '"></i><span><b>' + i[2] + '</b><small>' + i[3] + '</small></span></button>').join('');
  wrap.append(btn, menu);

  const title = () => (typeof opts.title === 'function' ? opts.title() : opts.title) || 'StudySphere notes';
  const stem = () => 'studysphere-' + _ssSlug(title());
  const root = () => opts.getRoot();

  async function run(fmt) {
    const el = root(); if (!el) return;
    try {
      if (fmt === 'md') {
        const md = ssSplitDiagramQuery(opts.getMarkdown ? opts.getMarkdown() : el.textContent).body;
        ssSaveBlob(new Blob(['# ' + title() + '\n\n' + md + '\n'], { type: 'text/markdown;charset=utf-8' }), stem() + '.md');
      } else if (fmt === 'html') {
        ssSaveBlob(new Blob([ssFullHTML(title(), el)], { type: 'text/html;charset=utf-8' }), stem() + '.html');
      } else if (fmt === 'txt' || fmt === 'copy') {
        const text = ssBlocksToText(await ssDomToBlocks(ssCleanClone(el), false), title());
        if (fmt === 'copy') {
          try { await navigator.clipboard.writeText(text); _ssToast('Copied ✓'); }
          catch (e) { ssSaveBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), stem() + '.txt'); }
        } else ssSaveBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), stem() + '.txt');
      } else if (fmt === 'docx') {
        _ssToast('Making your Word file…');
        await _ssDlLoad(SS_DL_LIBS.jszip);
        const blocks = await ssDomToBlocks(el, true);   // diagrams need the live (not cloned) SVG sizes
        ssSaveBlob(await ssBuildDocx(blocks, title(), window.JSZip), stem() + '.docx');
      } else if (fmt === 'pdf') {
        const w = window.open('', '_blank');
        if (!w) { alert('Please allow pop-ups so the PDF window can open.'); return; }
        w.document.write(ssFullHTML(title(), el)); w.document.close(); w.focus();
        setTimeout(() => { try { w.print(); } catch (e) {} }, 1200);
      } else if (fmt === 'png') {
        _ssToast('Making your image…');
        await _ssDlLoad(SS_DL_LIBS.h2c);
        const stage = document.createElement('div');
        stage.style.cssText = 'position:fixed;left:-10000px;top:0;width:820px;background:#fff;color:#1d1b2e;padding:26px;font-family:Nunito,Arial,sans-serif';
        stage.innerHTML = '<style>' + SS_EXPORT_CSS.replace(/body\{[^}]*\}/, '') + '</style><h1>' + ssEscapeHTML(title()) + '</h1>' + ssCleanClone(el).innerHTML;
        document.body.appendChild(stage);
        try {
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          const canvas = await window.html2canvas(stage, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
          const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
          if (!blob) throw new Error('empty'); ssSaveBlob(blob, stem() + '.png');
        } finally { stage.remove(); }
      }
    } catch (err) {
      console.warn('[StudySphere] download failed:', err);
      alert('Sorry, that format could not be made here. Try PDF or Web page instead.');
    }
  }

  btn.addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  menu.addEventListener('click', e => { const b = e.target.closest('[data-fmt]'); if (!b) return; menu.hidden = true; run(b.dataset.fmt); });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) menu.hidden = true; });
  return wrap;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { ssBuildDocx, ssBlocksToText };
