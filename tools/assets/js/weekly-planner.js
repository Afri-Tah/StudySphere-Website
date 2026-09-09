// ══ 8. WEEKLY STUDY PLANNER ══
let tasks = [], restDays = [];
function addTask() {
  const text = document.getElementById('taskInput').value.trim(); const priority = document.getElementById('taskPriority').value; const hours = parseFloat(document.getElementById('taskHours').value) || 2;
  if (!text) { alert('Enter a task!'); return; }
  tasks.push({ text, priority, hours });
  document.getElementById('taskInput').value = '';
  renderTaskList();
}
function removeTask(i) { tasks.splice(i, 1); renderTaskList(); }
function renderTaskList() {
  document.getElementById('taskList').innerHTML = tasks.map((t, i) => `<span class="task-badge ${t.priority}">${t.text} (${t.hours}h/wk) <button onclick="removeTask(${i})">✕</button></span>`).join('');
}
function toggleRest(btn) { const day = btn.dataset.day; if (restDays.includes(day)) { restDays = restDays.filter(d => d !== day); btn.classList.remove('rest-active'); } else { restDays.push(day); btn.classList.add('rest-active'); } }
function generatePlan() {
  if (!tasks.length) { alert('Add some tasks first!'); return; }
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const activeDays = days.filter(d => !restDays.includes(d));
  if (!activeDays.length) { alert('You need at least one active study day!'); return; }
  const startH = parseInt(document.getElementById('studyStart').value.split(':')[0]) || 9;
  const endH = parseInt(document.getElementById('studyEnd').value.split(':')[0]) || 21;
  const hoursPerDay = endH - startH;
  const totalWeekHours = activeDays.length * hoursPerDay;
  const totalTaskHours = tasks.reduce((a, t) => a + t.hours, 0);
  const scaleFactor = Math.min(1, totalWeekHours / totalTaskHours);
  let schedule = {}; activeDays.forEach(d => { schedule[d] = []; let remaining = hoursPerDay; tasks.forEach(t => { if (remaining <= 0) return; const alloc = Math.min(t.hours * scaleFactor / activeDays.length, remaining); if (alloc >= 0.5) { schedule[d].push({ text: t.text, hours: alloc, priority: t.priority }); remaining -= alloc; } }); });
  let html = `<table class="planner-table"><thead><tr><th>Time</th>${days.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>`;
  let slotH = startH;
  while (slotH < endH) {
    html += `<tr><td style="font-size:0.68rem;font-weight:700;color:var(--muted);white-space:nowrap">${String(slotH).padStart(2,'0')}:00</td>`;
    days.forEach(day => {
      if (restDays.includes(day)) { html += `<td class="rest-cell">Rest 😴</td>`; return; }
      const cumH = slotH - startH;
      let cumulated = 0, found = null;
      for (const t of (schedule[day] || [])) { if (cumH >= cumulated && cumH < cumulated + t.hours) { found = t; break; } cumulated += t.hours; }
      if (found) html += `<td class="${found.priority === 'high' ? 'high-task' : found.priority === 'low' ? 'low-task' : 'has-task'}">${found.text.substring(0,15)}${found.text.length>15?'…':''}</td>`;
      else html += `<td>—</td>`;
    });
    html += '</tr>'; slotH++;
  }
  html += '</tbody></table>';
  document.getElementById('plannerOutput').innerHTML = html;
  addPoints(5, 'Generated weekly plan');
}

