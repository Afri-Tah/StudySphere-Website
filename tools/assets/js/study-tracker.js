// ══ 5. STUDY TRACKER ══
let studyData = JSON.parse(localStorage.getItem('ss_study') || '{}');
let currentSessions = [], calYear = new Date().getFullYear(), calMonth = new Date().getMonth();
let selectedDay = new Date().toISOString().split('T')[0];
function saveStudy() { localStorage.setItem('ss_study', JSON.stringify(studyData)); }
function addSession() {
  const subj = document.getElementById('sessionSubject').value.trim(); const hrs = parseFloat(document.getElementById('sessionHours').value) || 0; const mins = parseInt(document.getElementById('sessionMins').value) || 0;
  if (!subj) { alert('Enter a subject!'); return; }
  const total = hrs + mins / 60; if (total <= 0) { alert('Enter some time!'); return; }
  currentSessions.push({ subject: subj, hours: total });
  document.getElementById('sessionSubject').value = ''; document.getElementById('sessionHours').value = ''; document.getElementById('sessionMins').value = '';
  renderSessionList();
}
function renderSessionList() {
  document.getElementById('sessionList').innerHTML = currentSessions.map((s, i) => `<div class="session-item"><div><strong>${s.subject}</strong> — ${s.hours < 1 ? Math.round(s.hours * 60) + 'm' : s.hours.toFixed(1) + 'h'}</div><button onclick="removeSession(${i})">✕</button></div>`).join('');
}
function removeSession(i) { currentSessions.splice(i, 1); renderSessionList(); }
function saveDay() {
  if (!currentSessions.length) { alert('Add at least one session!'); return; }
  studyData[selectedDay] = { sessions: [...currentSessions] }; saveStudy(); currentSessions = []; renderSessionList(); renderCalendar(); updateStreaks();
  addPoints(10, `Logged study session`); alert('✅ Saved!');
}
function calPrev() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); }
function calNext() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); }
function renderCalendar() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calTitle').textContent = `${months[calMonth]} ${calYear}`;
  document.getElementById('logDateLabel').textContent = selectedDay;
  const first = new Date(calYear, calMonth, 1).getDay(); const days = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < first; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= days; d++) {
    const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const data = studyData[key]; const totalH = data ? data.sessions.reduce((a,s)=>a+s.hours,0) : 0;
    const intensity = totalH >= 4 ? '' : totalH >= 2 ? 'medium' : totalH > 0 ? 'light' : '';
    html += `<div class="cal-day ${data ? 'has-data ' + intensity : ''} ${key === today ? 'today' : ''}" onclick="selectCalDay('${key}')">${d}${data ? `<span class="cal-hrs">${totalH.toFixed(1)}h</span>` : ''}</div>`;
  }
  document.getElementById('calGrid').innerHTML = html; renderDayDetail();
}
function selectCalDay(key) { selectedDay = key; document.getElementById('logDateLabel').textContent = key; currentSessions = (studyData[key] ? [...studyData[key].sessions] : []); renderSessionList(); renderDayDetail(); renderCalendar(); }
function renderDayDetail() {
  const data = studyData[selectedDay]; const detail = document.getElementById('dayDetail');
  if (!data) { detail.style.display = 'none'; return; }
  detail.style.display = 'block'; document.getElementById('dayDetailTitle').textContent = `📅 ${selectedDay}`;
  const total = data.sessions.reduce((a,s)=>a+s.hours,0);
  document.getElementById('dayDetailContent').innerHTML = data.sessions.map(s => `<div class="session-item"><strong>${s.subject}</strong> — ${s.hours < 1 ? Math.round(s.hours*60)+'m' : s.hours.toFixed(1)+'h'}</div>`).join('') + `<div style="font-size:0.82rem;color:var(--primary);font-weight:700;margin-top:6px">Total: ${total.toFixed(1)} hours</div>`;
}
function updateStreaks() {
  let streak = 0, d = new Date();
  while (true) { const key = d.toISOString().split('T')[0]; if (!studyData[key]) break; streak++; d.setDate(d.getDate() - 1); }
  document.getElementById('streakCount').textContent = streak;
  const monthKeys = Object.keys(studyData).filter(k => k.startsWith(`${calYear}-${String(calMonth+1).padStart(2,'0')}`));
  const monthHrs = monthKeys.reduce((a,k) => a + studyData[k].sessions.reduce((b,s)=>b+s.hours,0), 0);
  document.getElementById('monthHours').textContent = monthHrs.toFixed(0);
  document.getElementById('studyDays').textContent = monthKeys.length;
}
renderCalendar(); updateStreaks();

