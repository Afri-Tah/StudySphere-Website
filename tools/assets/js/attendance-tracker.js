// ══ 12. ATTENDANCE TRACKER ══
let attStudents = JSON.parse(localStorage.getItem('ss_students') || '[]');
let attDates = JSON.parse(localStorage.getItem('ss_attDates') || '[]');
let attData = JSON.parse(localStorage.getItem('ss_attData') || '{}');
let selectedAttDate = null;
function saveAtt() { localStorage.setItem('ss_students', JSON.stringify(attStudents)); localStorage.setItem('ss_attDates', JSON.stringify(attDates)); localStorage.setItem('ss_attData', JSON.stringify(attData)); }
function addAttStudent() {
  const name = document.getElementById('newStudentName').value.trim(); if (!name) return;
  if (attStudents.includes(name)) { alert('Student already added!'); return; }
  attStudents.push(name); document.getElementById('newStudentName').value = ''; saveAtt(); renderAttTable();
}
function addAttDate() {
  const dateVal = document.getElementById('attDateInput').value; const label = document.getElementById('attSessionLabel').value.trim();
  if (!dateVal) { alert('Pick a date!'); return; }
  const display = label ? `${dateVal} (${label})` : dateVal;
  if (attDates.includes(display)) { alert('Session already added!'); return; }
  attDates.push(display); selectedAttDate = display;
  document.getElementById('attDateInput').value = ''; document.getElementById('attSessionLabel').value = '';
  saveAtt(); renderAttDateBar(); renderAttTable();
}
function renderAttDateBar() {
  document.getElementById('attDateBar').innerHTML = attDates.map(d => `<span class="att-date-chip" onclick="selectedAttDate='${encodeURIComponent(d)}'" title="${d}">${d.split('(')[1] ? d.split('(')[1].replace(')','') : d.slice(5)}</span>`).join('');
}
function renderAttTable() {
  const head = document.getElementById('attHead'); const body = document.getElementById('attBody'); const recentDates = attDates.slice(-7);
  head.innerHTML = `<tr><th>Student</th>${recentDates.map(d => `<th style="font-size:0.68rem;max-width:50px">${d.split('(')[1] ? d.split('(')[1].replace(')','') : d.slice(5)}</th>`).join('')}<th>%</th><th>✕</th></tr>`;
  if (!attStudents.length) { body.innerHTML = `<tr><td colspan="${recentDates.length+3}" style="text-align:center;color:var(--muted);padding:18px">Add students above</td></tr>`; renderAttSummary(); return; }
  body.innerHTML = attStudents.map(student => {
    const cells = recentDates.map(d => {
      const key = `${student}||${d}`; const status = attData[key] || 'unmarked'; const icons = { present:'✓', absent:'✗', late:'~', unmarked:'·' };
      return `<td><button class="att-btn ${status}" onclick="cycleAtt('${encodeURIComponent(student)}','${encodeURIComponent(d)}')">${icons[status]}</button></td>`;
    }).join('');
    const total = attDates.length; const present = attDates.filter(d => attData[`${student}||${d}`]==='present').length; const late = attDates.filter(d => attData[`${student}||${d}`]==='late').length;
    const pct = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    const pctClass = pct >= 80 ? 'good' : pct >= 60 ? 'warn' : 'bad';
    return `<tr><td><strong>${student}</strong></td>${cells}<td><span class="att-pct ${pctClass}">${pct}%</span></td><td><button onclick="removeAttStudent('${encodeURIComponent(student)}')" style="background:none;border:none;color:#e74c3c;cursor:pointer">✕</button></td></tr>`;
  }).join('');
  renderAttSummary();
}
function cycleAtt(encStudent, encDate) {
  const student = decodeURIComponent(encStudent); const d = decodeURIComponent(encDate); const key = `${student}||${d}`;
  const cycle = { unmarked:'present', present:'absent', absent:'late', late:'unmarked' };
  attData[key] = cycle[attData[key] || 'unmarked']; saveAtt(); renderAttTable();
}
function removeAttStudent(enc) { const s = decodeURIComponent(enc); if (!confirm(`Remove ${s}?`)) return; attStudents = attStudents.filter(x => x !== s); saveAtt(); renderAttTable(); }
function bulkMark(status) {
  if (!selectedAttDate) { alert('Select a session first!'); return; }
  const dateKey = decodeURIComponent(selectedAttDate);
  attStudents.forEach(s => attData[`${s}||${dateKey}`] = status); saveAtt(); renderAttTable();
}
function renderAttSummary() {
  if (!attStudents.length || !attDates.length) { document.getElementById('attSummaryBar').innerHTML = ''; return; }
  const presentCount = Object.values(attData).filter(v => v==='present').length; const absentCount = Object.values(attData).filter(v => v==='absent').length; const lateCount = Object.values(attData).filter(v => v==='late').length;
  document.getElementById('attSummaryBar').innerHTML = `<div class="att-stat"><strong>${attStudents.length}</strong><span>Students</span></div><div class="att-stat"><strong>${attDates.length}</strong><span>Sessions</span></div><div class="att-stat" style="border-color:#2ecc71"><strong style="color:#1a7a40">${presentCount}</strong><span>Present</span></div><div class="att-stat" style="border-color:#e74c3c"><strong style="color:#765F4C">${absentCount}</strong><span>Absent</span></div><div class="att-stat" style="border-color:#f39c12"><strong style="color:#856404">${lateCount}</strong><span>Late</span></div>`;
}
function exportAttWA() {
  if (!attStudents.length) { alert('No data!'); return; }
  let msg = `📋 *StudySphere Attendance Report*\n\n`;
  attStudents.forEach(s => {
    const total = attDates.length; const present = attDates.filter(d => attData[`${s}||${d}`]==='present').length; const late = attDates.filter(d => attData[`${s}||${d}`]==='late').length; const absent = attDates.filter(d => attData[`${s}||${d}`]==='absent').length;
    const pct = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    msg += `👤 *${s}*: ${pct}% (✓${present} ~${late} ✗${absent})\n`;
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
function exportAttCSV() {
  let csv = 'Student,' + attDates.join(',') + ',Attendance %\n';
  attStudents.forEach(s => {
    const total = attDates.length; const present = attDates.filter(d => attData[`${s}||${d}`]==='present').length; const late = attDates.filter(d => attData[`${s}||${d}`]==='late').length;
    const pct = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    csv += `"${s}",` + attDates.map(d => attData[`${s}||${d}`]||'unmarked').join(',') + `,${pct}%\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'studysphere_attendance.csv'; a.click();
}
renderAttDateBar(); renderAttTable();

