// ══ 8. WEEKLY STUDY PLANNER — builds a schedule, then shows it in a planner style you choose ══
let tasks = [], restDays = [], lastPlan = null;
const PL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PL_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const PL_INITIAL = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S' };
const PL_TEMPLATES = [
  { id: 'journal', name: 'Weekly Journal' },
  { id: 'bold',    name: 'Bold Planner' },
  { id: 'table',   name: 'Time Blocks' }
];
let plTpl = 'journal';
try { const t = localStorage.getItem('ss_planner_tpl'); if (t && PL_TEMPLATES.some(x => x.id === t)) plTpl = t; } catch (e) {}
let plMarks = { chk: {}, txt: {}, stars: {} };
try { const m = JSON.parse(localStorage.getItem('ss_planner_marks') || 'null'); if (m && m.chk) plMarks = m; } catch (e) {}

function plEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function plSaveMarks() { try { localStorage.setItem('ss_planner_marks', JSON.stringify(plMarks)); } catch (e) {} }
function plHrs(h) { return (Math.round(h * 10) / 10) + 'h'; }

function addTask() {
  const text = document.getElementById('taskInput').value.trim(); const priority = document.getElementById('taskPriority').value; const hours = parseFloat(document.getElementById('taskHours').value) || 2;
  if (!text) { alert('Enter a task!'); return; }
  tasks.push({ text, priority, hours });
  document.getElementById('taskInput').value = '';
  renderTaskList();
}
function removeTask(i) { tasks.splice(i, 1); renderTaskList(); }
function renderTaskList() {
  document.getElementById('taskList').innerHTML = tasks.map((t, i) => `<span class="task-badge ${t.priority}">${plEsc(t.text)} (${t.hours}h/wk) <button onclick="removeTask(${i})"><i class="ti ti-x"></i></button></span>`).join('');
}
function toggleRest(btn) { const day = btn.dataset.day; if (restDays.includes(day)) { restDays = restDays.filter(d => d !== day); btn.classList.remove('rest-active'); } else { restDays.push(day); btn.classList.add('rest-active'); } if (lastPlan) { lastPlan = null; } }

// ── schedule maths (unchanged logic) ──
function buildPlan() {
  const activeDays = PL_DAYS.filter(d => !restDays.includes(d));
  const startH = parseInt(document.getElementById('studyStart').value.split(':')[0]) || 9;
  const endH = parseInt(document.getElementById('studyEnd').value.split(':')[0]) || 21;
  const hoursPerDay = endH - startH;
  const totalWeekHours = activeDays.length * hoursPerDay;
  const totalTaskHours = tasks.reduce((a, t) => a + t.hours, 0);
  const scaleFactor = Math.min(1, totalWeekHours / totalTaskHours);
  const schedule = {};
  activeDays.forEach(d => {
    schedule[d] = []; let remaining = hoursPerDay;
    tasks.forEach(t => { if (remaining <= 0) return; const alloc = Math.min(t.hours * scaleFactor / activeDays.length, remaining); if (alloc >= 0.5) { schedule[d].push({ text: t.text, hours: alloc, priority: t.priority }); remaining -= alloc; } });
  });
  return { schedule, startH, endH, rest: restDays.slice(), tasks: tasks.map(t => Object.assign({}, t)) };
}

// ── editable bits ──
function plTxt(k, def, cls) {
  const v = Object.prototype.hasOwnProperty.call(plMarks.txt, k) ? plMarks.txt[k] : def;
  return `<span class="pl-txt${cls ? ' ' + cls : ''}" contenteditable="true" data-k="${k}" spellcheck="false">${plEsc(v)}</span>`;
}
function plChk(k) { return `<span class="pl-chk${plMarks.chk[k] ? ' on' : ''}" data-chk="${k}" role="checkbox" aria-checked="${plMarks.chk[k] ? 'true' : 'false'}"></span>`; }
function plDots(prefix, plan) {
  return '<div class="pl-dots">' + PL_DAYS.map(d => {
    const k = prefix + '-' + d;
    return `<span class="pl-dot${plMarks.chk[k] ? ' on' : ''}${plan && plan.rest.includes(d) ? ' rest' : ''}" data-chk="${k}" title="${PL_FULL[d]}">${PL_INITIAL[d]}</span>`;
  }).join('') + '</div>';
}
function plStars(k) {
  const v = plMarks.stars[k] || 0;
  return `<div class="pl-stars" data-stars="${k}">` + [1, 2, 3, 4, 5].map(n => `<span class="pl-star${n <= v ? ' on' : ''}" data-star="${n}">★</span>`).join('') + '</div>';
}

// ── template 1: Weekly Journal ──
function plJournal(plan) {
  const habits = ['Study session', 'Revise notes', 'Water', 'Sleep 8 hours'];
  const todo = plan.tasks.slice(0, 5).map(t => `${t.text} (${plHrs(t.hours)}/wk)`);
  while (todo.length < 5) todo.push('');
  return `<div class="pl-page pl-j">
    <h3 class="pl-j-title">Weekly <em>Journal</em></h3>
    <div class="pl-j-box">${plTxt('j-motto', 'Listen to Yourself This Week')}</div>
    <div class="pl-j-h">Daily Checklist</div>
    ${habits.map((h, i) => `<div class="pl-j-row">${plTxt('j-habit' + i, h)}${plDots('j-h' + i, plan)}</div>`).join('')}
    <hr class="pl-j-hr">
    <div class="pl-two">
      <div><div class="pl-j-h">Weekly Rating</div>
        ${['Focus', 'Sleep', 'Mood'].map((r, i) => `<div class="pl-j-row">${plTxt('j-rate' + i, r)}${plStars('j-star' + i)}</div>`).join('')}</div>
      <div><div class="pl-j-h">To Do:</div>${todo.map((t, i) => `<div class="pl-todo-line">${plTxt('j-todo' + i, t)}</div>`).join('')}</div>
    </div>
    <div class="pl-note"><b>Note:</b> ${plTxt('j-note', '')}</div>
  </div>`;
}

// ── template 2: Bold weekly planner ──
function plBold(plan) {
  const dayBox = d => {
    const rest = plan.rest.includes(d), items = rest ? [] : (plan.schedule[d] || []);
    const n = Math.max(2, Math.min(4, items.length));
    let lines = '';
    for (let i = 0; i < n; i++) {
      const it = items[i];
      lines += `<div class="pl-line">${plChk('b-' + d + i)}${plTxt('b-' + d + i, rest ? (i === 0 ? 'Rest day ☾' : '') : (it ? `${it.text} · ${plHrs(it.hours)}` : ''))}</div>`;
    }
    return `<div class="pl-box${rest ? ' rest' : ''}"><h4>${PL_FULL[d]}</h4>${lines}</div>`;
  };
  const todo = plan.tasks.slice(0, 4).map(t => t.text); while (todo.length < 4) todo.push('');
  return `<div class="pl-page pl-r">
    <h3 class="pl-r-title">Weekly Planner</h3>
    ${plTxt('b-sub', 'Think Positive', 'pl-r-sub')}
    <div class="pl-r-grid">
      <div class="pl-col">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(dayBox).join('')}</div>
      <div class="pl-col">
        <div class="pl-box"><h4>To do list:</h4>${todo.map((t, i) => `<div class="pl-line">${plChk('b-todo' + i)}${plTxt('b-todo' + i, t)}</div>`).join('')}</div>
        <div class="pl-box"><h4>Goal tracker</h4>${[0, 1, 2].map(i => `<div class="pl-goal">${plTxt('b-goal' + i, i === 0 && plan.tasks[0] ? plan.tasks[0].text : '')}${plDots('b-g' + i, plan)}</div>`).join('')}</div>
        ${dayBox('Sat')}${dayBox('Sun')}
      </div>
    </div></div>`;
}

// ── template 3: time-block table (original look) ──
function plTable(plan) {
  const { schedule, startH, endH } = plan;
  let html = `<table class="planner-table"><thead><tr><th>Time</th>${PL_DAYS.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>`;
  for (let slotH = startH; slotH < endH; slotH++) {
    html += `<tr><td style="font-size:0.68rem;font-weight:700;color:var(--muted);white-space:nowrap">${String(slotH).padStart(2, '0')}:00</td>`;
    PL_DAYS.forEach(day => {
      if (plan.rest.includes(day)) { html += `<td class="rest-cell"><i class="ti ti-moon"></i> Rest</td>`; return; }
      const cumH = slotH - startH; let cumulated = 0, found = null;
      for (const t of (schedule[day] || [])) { if (cumH >= cumulated && cumH < cumulated + t.hours) { found = t; break; } cumulated += t.hours; }
      if (found) html += `<td class="${found.priority === 'high' ? 'high-task' : found.priority === 'low' ? 'low-task' : 'has-task'}">${plEsc(found.text.substring(0, 15))}${found.text.length > 15 ? '…' : ''}</td>`;
      else html += `<td>—</td>`;
    });
    html += '</tr>';
  }
  return html + '</tbody></table>';
}

function plRenderPage(id, plan) { return id === 'journal' ? plJournal(plan) : id === 'bold' ? plBold(plan) : plTable(plan); }

// ── picker + output ──
const PL_SAMPLE = { schedule: {}, rest: [], tasks: [], startH: 9, endH: 21 };
function renderPlannerPicker() {
  const box = document.getElementById('plTemplates'); if (!box) return;
  const saved = plMarks; plMarks = { chk: {}, txt: {}, stars: {} }; // thumbnails never show the user's marks
  box.innerHTML = PL_TEMPLATES.map(t => {
    const thumb = t.id === 'table'
      ? '<div class="pl-thumb-table">' + '<i class="h"></i>'.repeat(7) + '<i></i>'.repeat(49) + '</div>'
      : plRenderPage(t.id, PL_SAMPLE).replace(/contenteditable="true"/g, 'contenteditable="false"').replace(/ data-(k|chk)="[^"]*"/g, '');
    return `<button type="button" class="pl-tpl-btn${t.id === plTpl ? ' selected' : ''}" onclick="choosePlanner('${t.id}')" aria-label="${plEsc(t.name)} style"><div class="pl-thumb">${thumb}</div><span>${plEsc(t.name)}</span></button>`;
  }).join('');
  plMarks = saved;
}
function choosePlanner(id) {
  plTpl = id; try { localStorage.setItem('ss_planner_tpl', id); } catch (e) {}
  renderPlannerPicker(); if (lastPlan) renderPlannerOutput();
}
function renderPlannerOutput() {
  const out = document.getElementById('plannerOutput'); if (!out || !lastPlan) return;
  const editable = plTpl !== 'table';
  out.innerHTML = (editable ? '<p class="pl-hint">Tap the circles and stars to tick them off. Tap any text to edit it. Your ticks are saved on this device.</p>' : '') +
    `<div id="plPageHost">${plRenderPage(plTpl, lastPlan)}</div>` +
    `<div class="pl-toolbar"><button class="btn btn-sm btn-outline" onclick="printPlanner()"><i class="ti ti-printer"></i> Print / PDF</button>` +
    (editable ? `<button class="btn btn-sm btn-outline" onclick="resetPlannerMarks()"><i class="ti ti-refresh"></i> Clear ticks</button>` : '') + `</div>`;
}
function generatePlan() {
  if (!tasks.length) { alert('Add some tasks first!'); return; }
  if (PL_DAYS.every(d => restDays.includes(d))) { alert('You need at least one active study day!'); return; }
  lastPlan = buildPlan();
  plMarks = { chk: {}, txt: {}, stars: {} }; plSaveMarks();   // a new plan starts with a clean page
  renderPlannerOutput();
  addPoints(5, 'Generated weekly plan');
}
function resetPlannerMarks() { plMarks = { chk: {}, txt: {}, stars: {} }; plSaveMarks(); renderPlannerOutput(); }

function printPlanner() {
  const host = document.getElementById('plPageHost'); if (!host) return;
  const base = (f) => new URL(f, location.href).href;
  const w = window.open('', '_blank'); if (!w) { alert('Please allow pop-ups to print or save as PDF.'); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Weekly Planner</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Great+Vibes&family=Anton&display=swap" rel="stylesheet">' +
    '<link rel="stylesheet" href="' + base('assets/tools-shared.css') + '"><link rel="stylesheet" href="' + base('assets/weekly-planner.css') + '">' +
    '<style>body{margin:0;padding:16px;background:#fff!important}@page{margin:8mm}</style></head><body>' + host.innerHTML + '</body></html>');
  w.document.close(); w.focus();
  setTimeout(function () { try { w.print(); } catch (e) {} }, 800);
}

// ── interaction (delegated) ──
document.addEventListener('click', function (e) {
  const out = document.getElementById('plannerOutput'); if (!out || !out.contains(e.target)) return;
  const c = e.target.closest('[data-chk]');
  if (c) { const k = c.dataset.chk; plMarks.chk[k] = !plMarks.chk[k]; c.classList.toggle('on', !!plMarks.chk[k]); c.setAttribute('aria-checked', plMarks.chk[k] ? 'true' : 'false'); plSaveMarks(); return; }
  const s = e.target.closest('[data-star]');
  if (s) {
    const wrap = s.closest('[data-stars]'), k = wrap.dataset.stars, n = parseInt(s.dataset.star, 10);
    plMarks.stars[k] = plMarks.stars[k] === n ? 0 : n;
    wrap.querySelectorAll('.pl-star').forEach(el => el.classList.toggle('on', parseInt(el.dataset.star, 10) <= plMarks.stars[k]));
    plSaveMarks();
  }
});
document.addEventListener('input', function (e) {
  const t = e.target.closest && e.target.closest('.pl-txt[data-k]'); if (!t) return;
  plMarks.txt[t.dataset.k] = t.textContent; plSaveMarks();
});
document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.closest && e.target.closest('.pl-txt')) { e.preventDefault(); e.target.blur(); } });
document.addEventListener('paste', function (e) {
  if (!(e.target.closest && e.target.closest('.pl-txt'))) return;
  e.preventDefault(); const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\s+/g, ' ');
  document.execCommand('insertText', false, text);
});

renderPlannerPicker();
