// ══ 2. EXAM COUNTDOWN ══
let exams = JSON.parse(localStorage.getItem('ss_exams') || '[]');
function saveExams() { localStorage.setItem('ss_exams', JSON.stringify(exams)); }
function addCountdown() {
  const name = document.getElementById('examName').value.trim(); const dateVal = document.getElementById('examDate').value;
  if (!name || !dateVal) { alert('Enter exam name and date!'); return; }
  exams.push({ name, date: dateVal }); saveExams();
  document.getElementById('examName').value = ''; document.getElementById('examDate').value = '';
  renderExams(); addPoints(5, 'Added exam to countdown');
}
function renderExams() {
  const list = document.getElementById('savedExams');
  if (!exams.length) { list.innerHTML = ''; document.getElementById('countdownDisplay').style.display = 'none'; return; }
  list.innerHTML = exams.map((e, i) => {
    const diff = Math.ceil((new Date(e.date) - new Date()) / 86400000);
    return `<div class="saved-exam-item" onclick="showCountdown(${i})"><div><strong>${e.name}</strong><br><span style="font-size:0.75rem;color:var(--muted)">${e.date}</span></div><div style="display:flex;align-items:center;gap:8px"><span class="days-left">${Math.max(0,diff)}d</span><button onclick="event.stopPropagation();removeExam(${i})">✕</button></div></div>`;
  }).join('');
  if (exams.length) showCountdown(0);
}
function showCountdown(i) {
  const e = exams[i]; const days = Math.max(0, Math.ceil((new Date(e.date) - new Date()) / 86400000));
  document.getElementById('cdDays').textContent = days; document.getElementById('cdName').textContent = e.name;
  document.getElementById('cdDateStr').textContent = new Date(e.date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const pct = Math.max(0, 1 - days / 365); const circ = 364.4;
  document.getElementById('cdRing').style.strokeDashoffset = circ * (1 - pct);
  document.getElementById('countdownDisplay').style.display = 'block';
}
function removeExam(i) { exams.splice(i, 1); saveExams(); renderExams(); }
renderExams();

