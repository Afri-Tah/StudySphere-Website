// ══ QUICK NOTES — choose a page template, write, save (stored only in this browser) ══
const QN_TEMPLATES = [
  { id: 'gingham-pink',  name: 'Pink Gingham',  cls: 'tpl-gingham', vars: '--g:244,143,170;--accent:#d93a53', title: 'NOTES' },
  { id: 'gingham-blue',  name: 'Blue Gingham',  cls: 'tpl-gingham', vars: '--g:120,170,230;--accent:#3f7fd0;--line:#cfdcef', title: 'NOTES' },
  { id: 'gingham-sage',  name: 'Sage Gingham',  cls: 'tpl-gingham', vars: '--g:140,190,150;--accent:#3f9b63;--line:#d2e6d6', title: 'NOTES' },
  { id: 'bow-pink',      name: 'Pink Bow',      cls: 'tpl-bow',     vars: '--accent:#ec8fb0', title: 'Notes', bow: true },
  { id: 'bow-lilac',     name: 'Lilac Bow',     cls: 'tpl-bow',     vars: '--accent:#a58be0', title: 'Notes', bow: true },
  { id: 'lined',         name: 'Lined Paper',   cls: 'tpl-lined',   vars: '', title: 'Notes' },
  { id: 'dots',          name: 'Dot Grid',      cls: 'tpl-dots',    vars: '', title: 'Notes' },
  { id: 'grid',          name: 'Square Grid',   cls: 'tpl-grid',    vars: '', title: 'Notes' },
  { id: 'cornell',       name: 'Cornell',       cls: 'tpl-cornell', vars: '', title: 'Notes', cornell: true },
  { id: 'sticky',        name: 'Sticky Note',   cls: 'tpl-sticky',  vars: '', title: '', sticky: true }
];
const QN_COLORS = ['#ffd6a5', '#caffbf', '#9bf6ff', '#ffc6ff', '#ffadad', '#fdffb6'];
const QN_BOW = '<svg class="qn-bow" viewBox="0 0 130 64" aria-hidden="true"><g fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' +
  '<path d="M65 30C44 4 10 1 8 22c-1 19 33 21 57 8Z"/><path d="M65 30c21-26 55-29 57-8 1 19-33 21-57 8Z"/>' +
  '<path d="M61 37 42 60l14-3 9-17Z"/><path d="M69 37l19 23-14-3-9-17Z"/><ellipse cx="65" cy="30" rx="8" ry="9" fill-opacity=".55"/></g></svg>';

let notes = [];
try { notes = JSON.parse(localStorage.getItem('ss_notes') || '[]'); if (!Array.isArray(notes)) notes = []; } catch (e) { notes = []; }
let qnTpl = 'gingham-pink', qnColor = QN_COLORS[0], qnEditing = -1;
try { const t = localStorage.getItem('ss_notes_tpl'); if (t && QN_TEMPLATES.some(x => x.id === t)) qnTpl = t; } catch (e) {}
let qnDraft = { title: '', date: qnToday(), text: '', cue: '', summary: '' };

function qnEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function qnToday() { return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
function qnTplById(id) { return QN_TEMPLATES.find(t => t.id === id) || QN_TEMPLATES[QN_TEMPLATES.length - 1]; }
function qnSave() { try { localStorage.setItem('ss_notes', JSON.stringify(notes)); } catch (e) {} }

// Build one page. mode 'edit' → inputs, 'view' → plain text. note carries title/date/text/cue/summary/color.
function qnPageHTML(tpl, n, mode) {
  const edit = mode === 'edit';
  const style = (tpl.vars || '') + (tpl.sticky ? ';--sticky:' + (n.color || QN_COLORS[0]) : '');
  const title = n.title != null && n.title !== '' ? n.title : tpl.title;
  const field = (cls, id, val, ph) => edit
    ? `<textarea class="${cls}" id="${id}" placeholder="${ph}" spellcheck="true">${qnEsc(val)}</textarea>`
    : `<div class="${cls}">${qnEsc(val)}</div>`;
  const head = tpl.sticky ? '' : `<div class="qn-head">` +
    (edit ? `<input class="qn-title" id="qnTitle" value="${qnEsc(title)}" maxlength="40" aria-label="Title">`
          : `<div class="qn-title-view">${qnEsc(title)}</div>`) +
    `<label class="qn-date">DATE ` + (edit ? `<input id="qnDate" value="${qnEsc(n.date)}" maxlength="30" aria-label="Date">` : `<span class="qn-date-view">${qnEsc(n.date)}</span>`) + `</label></div>`;
  let body;
  if (tpl.cornell) {
    body = `<div class="qn-cornell-label">Cues / Questions &nbsp;·&nbsp; Notes</div><div class="qn-cornell-grid">` +
      field('qn-cue', 'qnCue', n.cue, 'Keywords…') + field('qn-body', 'qnText', n.text, 'Write your notes…') + `</div>` +
      `<div class="qn-cornell-label">Summary</div>` + field('qn-sum', 'qnSum', n.summary, 'Summarise in a sentence or two…');
  } else {
    body = field('qn-body', 'qnText', n.text, tpl.sticky ? 'Write a quick note…' : 'Start writing…');
  }
  const stamp = tpl.sticky && !edit && n.time ? `<div class="qn-stamp">${qnEsc(n.time)}</div>` : '';
  return `<div class="qn-page ${tpl.cls}" style="${style}">${tpl.bow ? QN_BOW : ''}<div class="qn-sheet">${head}${body}${stamp}</div></div>`;
}

function renderTemplatePicker() {
  const box = document.getElementById('qnTemplates'); if (!box) return;
  box.innerHTML = QN_TEMPLATES.map(t =>
    `<button type="button" class="qn-tpl-btn${t.id === qnTpl ? ' selected' : ''}" onclick="chooseTemplate('${t.id}')" aria-label="${qnEsc(t.name)} template">` +
    `<div class="qn-thumb">${qnPageHTML(t, { title: t.title, date: 'DD MMM', text: '', cue: '', summary: '', color: qnColor }, 'view')}</div><span>${qnEsc(t.name)}</span></button>`).join('');
}

function renderColors() {
  const box = document.getElementById('qnColors'); if (!box) return;
  box.classList.toggle('show', !!qnTplById(qnTpl).sticky);
  box.innerHTML = QN_COLORS.map(c => `<div class="color-dot${c === qnColor ? ' selected' : ''}" style="background:${c}" data-color="${c}" onclick="selectNoteColor(this)"></div>`).join('');
}

function syncDraft() {
  const g = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const t = g('qnTitle'), d = g('qnDate'), x = g('qnText'), c = g('qnCue'), s = g('qnSum');
  if (t !== null) qnDraft.title = t; if (d !== null) qnDraft.date = d;
  if (x !== null) qnDraft.text = x; if (c !== null) qnDraft.cue = c; if (s !== null) qnDraft.summary = s;
}

function renderEditor() {
  const host = document.getElementById('qnEditor'); if (!host) return;
  const tpl = qnTplById(qnTpl);
  host.innerHTML = qnPageHTML(tpl, Object.assign({}, qnDraft, { color: qnColor, title: qnDraft.title }), 'edit');
  const btn = document.getElementById('qnSaveBtn'), cancel = document.getElementById('qnCancelBtn');
  if (btn) btn.innerHTML = qnEditing >= 0 ? '<i class="ti ti-check"></i> Update note' : '<i class="ti ti-device-floppy"></i> Save note';
  if (cancel) cancel.style.display = qnEditing >= 0 ? '' : 'none';
}

function chooseTemplate(id) {
  syncDraft();
  // keep a custom title only if the user typed one; otherwise let the new template's own heading show
  const prev = qnTplById(qnTpl);
  if (qnDraft.title === prev.title) qnDraft.title = '';
  qnTpl = id;
  try { localStorage.setItem('ss_notes_tpl', id); } catch (e) {}
  renderTemplatePicker(); renderColors(); renderEditor();
}

function selectNoteColor(dot) { syncDraft(); qnColor = dot.dataset.color; renderColors(); renderEditor(); }

function qnClearDraft() { qnDraft = { title: '', date: qnToday(), text: '', cue: '', summary: '' }; qnEditing = -1; }

function addNote() {
  syncDraft();
  const tpl = qnTplById(qnTpl);
  if (!(qnDraft.text || '').trim() && !(qnDraft.cue || '').trim() && !(qnDraft.summary || '').trim()) {
    const ta = document.getElementById('qnText'); if (ta) ta.focus(); return;
  }
  const rec = {
    tpl: tpl.id, title: qnDraft.title, date: qnDraft.date || qnToday(), text: qnDraft.text.trim(),
    cue: qnDraft.cue, summary: qnDraft.summary, color: qnColor,
    time: new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  if (qnEditing >= 0 && notes[qnEditing]) notes[qnEditing] = rec; else notes.unshift(rec);
  qnSave(); qnClearDraft(); renderEditor(); renderNotes();
}

function editNote(i) {
  const n = notes[i]; if (!n) return;
  const tpl = qnTplById(n.tpl || 'sticky');
  qnTpl = tpl.id; qnColor = n.color || QN_COLORS[0]; qnEditing = i;
  qnDraft = { title: n.title || '', date: n.date || qnToday(), text: n.text || '', cue: n.cue || '', summary: n.summary || '' };
  renderTemplatePicker(); renderColors(); renderEditor();
  const host = document.getElementById('qnEditor'); if (host && host.scrollIntoView) host.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function cancelEdit() { qnClearDraft(); renderEditor(); }

function deleteNote(i) {
  notes.splice(i, 1); qnSave();
  if (qnEditing === i) qnClearDraft(); else if (qnEditing > i) qnEditing--;
  renderEditor(); renderNotes();
}
function clearAllNotes() {
  if (notes.length && !confirm('Delete all saved notes? This cannot be undone.')) return;
  notes = []; qnSave(); qnClearDraft(); renderEditor(); renderNotes();
}

function printNote(i) {
  const n = notes[i]; if (!n) return;
  const tpl = qnTplById(n.tpl || 'sticky');
  const css = new URL('assets/quick-notes.css', location.href).href;
  const w = window.open('', '_blank'); if (!w) { alert('Please allow pop-ups to print or save as PDF.'); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + qnEsc(n.title || 'Note') + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800;900&display=swap" rel="stylesheet">' +
    '<link rel="stylesheet" href="' + css + '"><style>body{margin:0;padding:24px;background:#fff}.qn-page{max-width:640px;min-height:900px;margin:0 auto}.qn-body{min-height:620px}@page{margin:10mm}</style></head><body>' +
    qnPageHTML(tpl, n, 'view') + '</body></html>');
  w.document.close(); w.focus();
  setTimeout(function () { try { w.print(); } catch (e) {} }, 700);
}

function renderNotes() {
  const grid = document.getElementById('notesGrid'); if (!grid) return;
  const count = document.getElementById('notesCount');
  if (count) count.textContent = notes.length + (notes.length === 1 ? ' note saved' : ' notes saved');
  if (!notes.length) { grid.innerHTML = '<div class="qn-empty">Your saved notes will appear here <i class="ti ti-pencil"></i></div>'; return; }
  grid.innerHTML = notes.map(function (n, i) {
    const tpl = qnTplById(n.tpl || 'sticky');
    return '<div class="qn-card">' + qnPageHTML(tpl, n, 'view') +
      '<div class="qn-card-actions"><button type="button" onclick="editNote(' + i + ')"><i class="ti ti-edit"></i> Edit</button>' +
      '<button type="button" onclick="printNote(' + i + ')"><i class="ti ti-printer"></i> Print / PDF</button>' +
      '<button type="button" class="danger" onclick="deleteNote(' + i + ')"><i class="ti ti-trash"></i> Delete</button></div></div>';
  }).join('');
}

renderTemplatePicker(); renderColors(); renderEditor(); renderNotes();
