// ══ 13. STICKY NOTES ══
let notes = JSON.parse(localStorage.getItem('ss_notes') || '[]'); let selectedNoteColor = '#ffd6a5';
function selectNoteColor(dot) { document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected')); dot.classList.add('selected'); selectedNoteColor = dot.dataset.color; }
function addNote() {
  const text = document.getElementById('noteInput').value.trim(); if (!text) return;
  notes.unshift({ text, color: selectedNoteColor, time: new Date().toLocaleString('en-GB', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) });
  localStorage.setItem('ss_notes', JSON.stringify(notes)); document.getElementById('noteInput').value = ''; renderNotes();
}
function deleteNote(i) { notes.splice(i, 1); localStorage.setItem('ss_notes', JSON.stringify(notes)); renderNotes(); }
function clearAllNotes() { if (!confirm('Clear all notes?')) return; notes = []; localStorage.setItem('ss_notes', JSON.stringify(notes)); renderNotes(); }
function renderNotes() {
  const grid = document.getElementById('notesGrid'); document.getElementById('notesCount').textContent = `${notes.length} note${notes.length!==1?'s':''} saved`;
  if (!notes.length) { grid.innerHTML = `<div class="notes-empty">Your notes will appear here ✏️</div>`; return; }
  grid.innerHTML = notes.map((n, i) => `<div class="sticky-note" style="background:${n.color}"><button class="note-delete" onclick="deleteNote(${i})">✕</button>${n.text}<span class="note-time">${n.time}</span></div>`).join('');
}
renderNotes();

