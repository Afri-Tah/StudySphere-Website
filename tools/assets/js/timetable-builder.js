// ══ 15. TIMETABLE BUILDER ══
let ttData = JSON.parse(localStorage.getItem('ss_timetable') || '{}');
const TT_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SUBJECT_COLORS = ['#fdf0e8','#e8f5ee','#e8eeff','#fff3cd','#fde8e8','#e8f5ff','#f5e8ff'];
function buildTimetable() {
  const start = parseInt(document.getElementById('ttStartHour').value); const end = parseInt(document.getElementById('ttEndHour').value);
  const slots = []; for (let h = start; h < end; h++) slots.push(`${String(h).padStart(2,'0')}:00–${String(h+1).padStart(2,'0')}:00`);
  let html = `<thead><tr><th>Time</th>${TT_DAYS.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>`;
  slots.forEach(slot => {
    html += `<tr><td style="font-size:0.68rem;font-weight:700;color:var(--muted);white-space:nowrap;padding:4px 6px">${slot}</td>`;
    TT_DAYS.forEach(day => {
      const key = `${day}||${slot}`; const cell = ttData[key];
      if (cell) { const colorIdx = (cell.name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) % SUBJECT_COLORS.length; html += `<td><div class="tt-cell" style="background:${SUBJECT_COLORS[colorIdx]}" onclick="editTTCell('${encodeURIComponent(key)}')">${cell.name}<span class="tt-room">${cell.room||''}</span></div></td>`; }
      else { html += `<td><div class="tt-cell empty-cell" onclick="editTTCell('${encodeURIComponent(key)}')">+</div></td>`; }
    }); html += '</tr>';
  });
  html += '</tbody>'; document.getElementById('ttGrid').innerHTML = html; localStorage.setItem('ss_timetable', JSON.stringify(ttData));
}
function editTTCell(encKey) {
  const key = decodeURIComponent(encKey); const existing = ttData[key] || {}; const [day, slot] = key.split('||');
  const modal = document.createElement('div'); modal.className = 'tt-add-modal';
  modal.innerHTML = `<div class="tt-modal-inner"><h3>🗓️ ${day} · ${slot}</h3><input type="text" id="ttSubjectName" placeholder="Subject name" value="${existing.name||''}"><input type="text" id="ttRoom" placeholder="Room / link" value="${existing.room||''}"><div class="edit-cell-btns"><button class="btn btn-outline btn-sm" style="width:auto" onclick="closeTTModal()">Cancel</button>${existing.name?`<button class="btn btn-sm btn-red" style="width:auto" onclick="clearTTCell('${encodeURIComponent(key)}')">✕ Clear</button>`:''}<button class="btn btn-sm" style="width:auto" onclick="saveTTCell('${encodeURIComponent(key)}')">Save ✓</button></div></div>`;
  document.body.appendChild(modal);
}
function closeTTModal() { const m = document.querySelector('.tt-add-modal'); if (m) m.remove(); }
function saveTTCell(encKey) {
  const key = decodeURIComponent(encKey); const name = document.getElementById('ttSubjectName').value.trim(); const room = document.getElementById('ttRoom').value.trim();
  if (!name) { clearTTCell(encKey); return; }
  ttData[key] = { name, room }; closeTTModal(); buildTimetable();
}
function clearTTCell(encKey) { const key = decodeURIComponent(encKey); delete ttData[key]; closeTTModal(); buildTimetable(); }
function clearTimetable() { if (!confirm('Clear the entire timetable?')) return; ttData = {}; localStorage.setItem('ss_timetable', JSON.stringify(ttData)); buildTimetable(); }
function exportTimetableWA() {
  if (!Object.keys(ttData).length) { alert('Add some classes first!'); return; }
  let msg = `🗓️ *My StudySphere Timetable*\n\n`;
  TT_DAYS.forEach(day => {
    const dayCells = Object.entries(ttData).filter(([k]) => k.startsWith(day + '||')).sort((a,b) => a[0].localeCompare(b[0]));
    if (dayCells.length) { msg += `*${day}*\n`; dayCells.forEach(([k,v]) => { const slot = k.split('||')[1]; msg += `  ${slot}: ${v.name}${v.room?' ('+v.room+')':''}\n`; }); msg += '\n'; }
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
buildTimetable();

