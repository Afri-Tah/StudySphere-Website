// ══ 8. WEEKLY STUDY PLANNER — builds a schedule, shows it as a planner page you choose, lets you save / download it ══
let tasks = [], restDays = [], lastPlan = null;
const PL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PL_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const PL_INITIAL = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S' };
const PL_ICS_DAY = { Mon: 'MO', Tue: 'TU', Wed: 'WE', Thu: 'TH', Fri: 'FR', Sat: 'SA', Sun: 'SU' };
const PL_JS_DAY = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
const PL_TEMPLATES = [
  { id: 'journal', name: 'Weekly Journal' },
  { id: 'bold',    name: 'Bold Planner' },
  { id: 'clean',   name: 'Day by Day' },
  { id: 'tracker', name: 'Task Tracker' }
];
let plTpl = 'journal';
try { const t = localStorage.getItem('ss_planner_tpl'); if (t && PL_TEMPLATES.some(x => x.id === t)) plTpl = t; } catch (e) {}
let plMarks = { chk: {}, txt: {}, stars: {} };
try { const m = JSON.parse(localStorage.getItem('ss_planner_marks') || 'null'); if (m && m.chk) plMarks = m; } catch (e) {}
let plSaved = [];
try { const s = JSON.parse(localStorage.getItem('ss_planner_saved') || '[]'); if (Array.isArray(s)) plSaved = s; } catch (e) {}

function plEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function plSaveMarks() { try { localStorage.setItem('ss_planner_marks', JSON.stringify(plMarks)); } catch (e) {} }
function plSaveLast() { try { localStorage.setItem('ss_planner_last', JSON.stringify(lastPlan)); } catch (e) {} }
function plHrs(h) { return (Math.round(h * 10) / 10) + 'h'; }
function plTime(mins) { mins = Math.round(mins); return String(Math.floor(mins / 60) % 24).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'); }
function plEmptyMarks() { return { chk: {}, txt: {}, stars: {} }; }
// start/end clock times of each block in a day, laid end to end from the study-window start
function plBlocks(plan, d) {
  let t = plan.startH * 60;
  return (plan.schedule[d] || []).map(it => { const s = t, e = t + it.hours * 60; t = e; return { text: it.text, hours: it.hours, priority: it.priority, from: plTime(s), to: plTime(e) }; });
}

// ══ Planner builder (inputs) — the page styles/templates below are unchanged ══
const PB_SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT', 'Economics', 'Business', 'Accounting', 'Past papers', 'Homework', 'Revision'];
const PB_PRESETS = {
  exam:     { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], max: 5, tasks: [['Maths', 'high', 5], ['Physics', 'high', 4], ['Chemistry', 'high', 4], ['Biology', 'medium', 3], ['English', 'medium', 2], ['Past papers', 'high', 4]] },
  balanced: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], max: 3, tasks: [['Maths', 'medium', 3], ['Science', 'medium', 3], ['English', 'medium', 2], ['Homework', 'medium', 3], ['Revision', 'low', 2]] },
  light:    { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], max: 2, tasks: [['Maths', 'medium', 2], ['English', 'low', 1.5], ['Revision', 'low', 2]] }
};
const PB_DAYSETS = { weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'weekdays-sat': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], all: PL_DAYS };
let pbMax = 4, pbTimer = null;
restDays = ['Sat', 'Sun'];

function pbSave() { try { localStorage.setItem('ss_planner_inputs', JSON.stringify({ tasks, restDays, start: document.getElementById('studyStart').value, end: document.getElementById('studyEnd').value, max: pbMax })); } catch (e) {} }
function pbLoad() {
  try {
    const d = JSON.parse(localStorage.getItem('ss_planner_inputs') || 'null'); if (!d) return;
    if (Array.isArray(d.tasks)) tasks = d.tasks.filter(t => t && t.text && t.hours > 0).slice(0, 30);
    if (Array.isArray(d.restDays)) restDays = d.restDays.filter(x => PL_DAYS.includes(x));
    if (/^\d\d:\d\d$/.test(d.start)) document.getElementById('studyStart').value = d.start;
    if (/^\d\d:\d\d$/.test(d.end)) document.getElementById('studyEnd').value = d.end;
    if (d.max >= 1 && d.max <= 12) pbMax = d.max;
  } catch (e) {}
}
function plMins(id, def) { const v = (document.getElementById(id).value || '').split(':'); const m = parseInt(v[0], 10) * 60 + (parseInt(v[1], 10) || 0); return isNaN(m) ? def : m; }
function plWindow() { const s = plMins('studyStart', 960), e = plMins('studyEnd', 1260); return { s, e: e > s ? e : s + 60 }; }
function plCapacity() { const w = plWindow(); const perDay = Math.min((w.e - w.s) / 60, pbMax); const days = PL_DAYS.filter(d => !restDays.includes(d)).length; return { perDay, days, total: perDay * days }; }

function pbAddTask(text, priority, hours) {
  text = String(text || '').trim().slice(0, 60); if (!text) return;
  const ex = tasks.find(t => t.text.toLowerCase() === text.toLowerCase());
  if (ex) ex.hours = Math.min(20, ex.hours + 1); else tasks.push({ text, priority: priority || 'medium', hours: hours || 2 });
  pbChanged();
}
function addTask() { const el = document.getElementById('taskInput'); pbAddTask(el.value, 'medium', 2); el.value = ''; el.focus(); }
function removeTask(i) { tasks.splice(i, 1); pbChanged(); }
function pbStep(i, d) { const t = tasks[i]; if (!t) return; t.hours = Math.max(0.5, Math.min(20, Math.round((t.hours + d) * 2) / 2)); pbChanged(); }
function pbPriority(i, p) { if (tasks[i]) { tasks[i].priority = p; pbChanged(); } }
function pbDayToggle(d) { restDays = restDays.includes(d) ? restDays.filter(x => x !== d) : restDays.concat(d); pbChanged(); }
function pbApplyPreset(k) {
  if (k === 'clear') { tasks = []; pbChanged(); return; }
  const p = PB_PRESETS[k]; if (!p) return;
  tasks = p.tasks.map(t => ({ text: t[0], priority: t[1], hours: t[2] }));
  restDays = PL_DAYS.filter(d => !p.days.includes(d)); pbMax = p.max; pbChanged();
}

function renderTaskList() {
  const box = document.getElementById('taskList');
  box.innerHTML = tasks.length ? tasks.map((t, i) => `<div class="pb-task ${t.priority}">
      <span class="pb-task-name">${plEsc(t.text)}</span>
      <span class="pb-prio" role="group" aria-label="Priority for ${plEsc(t.text)}">${['high', 'medium', 'low'].map(p => `<button type="button" class="${p}${t.priority === p ? ' on' : ''}" onclick="pbPriority(${i},'${p}')" aria-pressed="${t.priority === p}">${p === 'medium' ? 'Med' : p[0].toUpperCase() + p.slice(1)}</button>`).join('')}</span>
      <span class="pb-step"><button type="button" onclick="pbStep(${i},-0.5)" aria-label="Less time for ${plEsc(t.text)}">−</button><b>${plHrs(t.hours)}<small>/wk</small></b><button type="button" onclick="pbStep(${i},0.5)" aria-label="More time for ${plEsc(t.text)}">+</button></span>
      <button type="button" class="pb-x" onclick="removeTask(${i})" aria-label="Remove ${plEsc(t.text)}"><i class="ti ti-x"></i></button>
    </div>`).join('') : '<p class="pb-empty">Nothing added yet — tap a subject above, or pick a Quick start.</p>';
  const have = new Set(tasks.map(t => t.text.toLowerCase()));
  document.getElementById('pbChips').innerHTML = PB_SUBJECTS.map(s => `<button type="button" class="pb-chip${have.has(s.toLowerCase()) ? ' added' : ''}" data-subj="${plEsc(s)}">${have.has(s.toLowerCase()) ? '<i class="ti ti-check"></i>' : '<i class="ti ti-plus"></i>'} ${plEsc(s)}</button>`).join('');
}
function renderDays() {
  document.getElementById('pbDays').innerHTML = PL_DAYS.map(d => `<button type="button" class="pb-day${restDays.includes(d) ? '' : ' on'}" onclick="pbDayToggle('${d}')" aria-pressed="${!restDays.includes(d)}"><b>${d}</b><small>${restDays.includes(d) ? 'rest' : 'study'}</small></button>`).join('');
  document.getElementById('pbMaxVal').textContent = pbMax + 'h';
}
function renderSummary() {
  const el = document.getElementById('pbSummary'); const cap = plCapacity();
  const total = tasks.reduce((a, t) => a + t.hours, 0);
  if (!tasks.length) { el.className = 'pb-summary'; el.innerHTML = '<i class="ti ti-info-circle"></i> Add a subject to see how your week fits together.'; return; }
  if (!cap.days) { el.className = 'pb-summary warn'; el.innerHTML = '<i class="ti ti-alert-triangle"></i> Switch on at least one study day.'; return; }
  const pct = Math.min(100, Math.round(total / cap.total * 100));
  let msg, cls;
  if (total > cap.total + 0.01) { cls = 'warn'; msg = `<b>${plHrs(total)}</b> planned but only <b>${plHrs(cap.total)}</b> fit your week, so each subject will be trimmed by about ${Math.round((1 - cap.total / total) * 100)}%. Add a study day, allow more hours a day, or lower some hours.`; }
  else if (total > cap.total * 0.9) { cls = 'tight'; msg = `<b>${plHrs(total)}</b> across ${cap.days} days — your week is nearly full.`; }
  else { cls = 'ok'; msg = `<b>${plHrs(total)}</b> across ${cap.days} days (about ${plHrs(total / cap.days)} a day). You still have room for ${plHrs(cap.total - total)} more.`; }
  el.className = 'pb-summary ' + cls;
  el.innerHTML = `<div>${msg}</div><div class="pb-bar"><span style="width:${pct}%"></span></div>`;
}
function toggleRest(btn) { pbDayToggle(btn.dataset.day); }   // kept for older saved pages

function plHasMarks() { return Object.values(plMarks.chk).some(Boolean) || Object.keys(plMarks.txt).length > 0 || Object.values(plMarks.stars).some(Boolean); }
function pbChanged() {
  renderTaskList(); renderDays(); renderSummary(); pbSave();
  const btn = document.getElementById('pbBuildBtn');
  clearTimeout(pbTimer);
  if (!tasks.length) { btn.innerHTML = '<i class="ti ti-calendar-week"></i> Build my plan'; return; }
  if (!plHasMarks() && PL_DAYS.some(d => !restDays.includes(d))) { pbTimer = setTimeout(() => generatePlan(false), 350); }
  else if (lastPlan) btn.innerHTML = '<i class="ti ti-refresh"></i> Update plan <small>(clears your ticks)</small>';
}
function pbInit() {
  pbLoad();
  document.getElementById('pbChips').addEventListener('click', e => { const b = e.target.closest('[data-subj]'); if (b) pbAddTask(b.dataset.subj, 'medium', 2); });
  document.querySelector('.pb-presets').addEventListener('click', e => { const b = e.target.closest('[data-preset]'); if (b) pbApplyPreset(b.dataset.preset); });
  document.querySelector('.pb-day-presets').addEventListener('click', e => { const b = e.target.closest('[data-days]'); if (b) { restDays = PL_DAYS.filter(d => !PB_DAYSETS[b.dataset.days].includes(d)); pbChanged(); } });
  document.getElementById('pbAddBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } });
  ['studyStart', 'studyEnd'].forEach(id => document.getElementById(id).addEventListener('change', pbChanged));
  document.getElementById('pbMaxUp').addEventListener('click', () => { pbMax = Math.min(12, pbMax + 1); pbChanged(); });
  document.getElementById('pbMaxDown').addEventListener('click', () => { pbMax = Math.max(1, pbMax - 1); pbChanged(); });
  renderTaskList(); renderDays(); renderSummary();
}

// ── schedule maths ──
// Spreads each subject over the study days in blocks of about an hour (1.5h for big
// subjects), puts the heaviest priority first in each day, never exceeds the daily
// limit, and scales everything down fairly if the week is over-booked.
function buildPlan() {
  const active = PL_DAYS.filter(d => !restDays.includes(d));
  const w = plWindow(), cap = plCapacity();
  const total = tasks.reduce((a, t) => a + t.hours, 0);
  const scale = total > cap.total ? cap.total / total : 1;
  const rank = { high: 0, medium: 1, low: 2 };
  const order = tasks.map((t, i) => ({ t, i })).sort((x, y) => rank[x.t.priority] - rank[y.t.priority] || x.i - y.i);
  const load = {}, items = {}; active.forEach(d => { load[d] = 0; items[d] = []; });
  order.forEach(({ t }, ti) => {
    const h = Math.max(0.5, Math.floor(t.hours * scale * 2 + 1e-9) / 2);
    const block = h / active.length >= 1.25 ? 1.5 : 1;
    const units = Math.round(h * 2), n = Math.min(Math.max(1, Math.round(h / block)), units);
    const sizes = []; for (let j = 0; j < n; j++) sizes.push((Math.floor(units / n) + (j < units % n ? 1 : 0)) / 2);
    for (let j = 0; j < n; j++) {
      const size = sizes[j];
      const ideal = Math.floor((j * active.length) / n + ti) % active.length;
      const cands = active.map((d, di) => ({ d, di, has: items[d].some(x => x.text === t.text), dist: Math.min((di - ideal + active.length) % active.length, (ideal - di + active.length) % active.length) }))
        .filter(c => load[c.d] + size <= cap.perDay + 1e-9)
        .sort((a, b) => a.has - b.has || load[a.d] - load[b.d] || a.dist - b.dist);
      if (!cands.length) break;
      const d = cands[0].d;
      const ex = items[d].find(x => x.text === t.text);
      if (ex) ex.hours += size; else items[d].push({ text: t.text, hours: size, priority: t.priority });
      load[d] += size;
    }
  });
  const schedule = {};
  active.forEach(d => { schedule[d] = items[d].sort((a, b) => rank[a.priority] - rank[b.priority]); });
  return { schedule, startH: w.s / 60, endH: w.e / 60, rest: restDays.slice(), tasks: tasks.map(t => Object.assign({}, t)), made: new Date().toISOString() };
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
    const rest = plan.rest.includes(d), items = rest ? [] : plBlocks(plan, d);
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

// ── template 3: Day by Day (clock times for every block) ──
function plClean(plan) {
  const rows = PL_DAYS.map(d => {
    const rest = plan.rest.includes(d), blocks = rest ? [] : plBlocks(plan, d);
    let body = '';
    if (rest) body = `<div class="pl-c-item">${plTxt('c-' + d + 'r', 'Rest day ☾ — recharge')}</div>`;
    else {
      body = blocks.map((b, i) => `<div class="pl-c-item pl-p-${b.priority}">${plChk('c-' + d + i)}<span class="pl-c-time">${b.from}–${b.to}</span>${plTxt('c-' + d + i, b.text)}</div>`).join('');
      body += `<div class="pl-c-item">${plChk('c-' + d + 'x')}<span class="pl-c-time">+</span>${plTxt('c-' + d + 'x', '')}</div>`;
    }
    return `<div class="pl-c-day${rest ? ' rest' : ''}"><div class="pl-c-name"><b>${d}</b><small>${PL_FULL[d]}</small></div><div class="pl-c-list">${body}</div></div>`;
  }).join('');
  return `<div class="pl-page pl-c">
    <h3 class="pl-c-title">This Week</h3>
    ${plTxt('c-sub', 'Plan it. Do it. Tick it.', 'pl-c-sub')}
    ${rows}
    <div class="pl-c-foot"><b>Goal for the week:</b> ${plTxt('c-goal', '')}</div>
  </div>`;
}

// ── template 4: Task Tracker (one row per task, tick the days you did it) ──
function plTracker(plan) {
  const head = '<div class="pl-t-head"><span></span><div class="pl-dots">' + PL_DAYS.map(d => `<span class="pl-dot pl-dot-h">${PL_INITIAL[d]}</span>`).join('') + '</div></div>';
  const rows = plan.tasks.map((t, i) => `<div class="pl-t-row"><div class="pl-t-name"><span class="pl-t-pri pl-p-${t.priority}"></span>${plTxt('t-name' + i, t.text)}<small>${plHrs(t.hours)}/wk</small></div>${plDots('t-r' + i, plan)}</div>`).join('');
  const spare = '<div class="pl-t-row"><div class="pl-t-name"><span class="pl-t-pri"></span>' + plTxt('t-extra', '') + '</div>' + plDots('t-rx', plan) + '</div>';
  return `<div class="pl-page pl-t">
    <h3 class="pl-t-title">Task Tracker</h3>
    ${plTxt('t-sub', 'Small steps every day', 'pl-t-sub')}
    ${head}${rows}${spare}
    <div class="pl-two" style="margin-top:20px">
      <div class="pl-t-box"><b>Wins this week</b>${plTxt('t-wins', '', 'pl-t-area')}</div>
      <div class="pl-t-box"><b>Next week I will…</b>${plTxt('t-next', '', 'pl-t-area')}</div>
    </div>
    <div class="pl-t-mood"><b>Energy</b>${plStars('t-star')}</div>
  </div>`;
}

function plRenderPage(id, plan) { return id === 'journal' ? plJournal(plan) : id === 'bold' ? plBold(plan) : id === 'clean' ? plClean(plan) : plTracker(plan); }

// ── picker + output ──
const PL_SAMPLE = { schedule: { Mon: [{ text: 'Maths', hours: 1, priority: 'high' }, { text: 'Biology', hours: 1, priority: 'medium' }], Tue: [{ text: 'Chemistry', hours: 1, priority: 'low' }] }, rest: ['Sun'], tasks: [{ text: 'Maths', hours: 4, priority: 'high' }, { text: 'Biology', hours: 3, priority: 'medium' }, { text: 'Chemistry', hours: 2, priority: 'low' }], startH: 9, endH: 21 };
function renderPlannerPicker() {
  const box = document.getElementById('plTemplates'); if (!box) return;
  const saved = plMarks; plMarks = plEmptyMarks(); // thumbnails never show the user's marks
  box.innerHTML = PL_TEMPLATES.map(t => {
    const thumb = plRenderPage(t.id, PL_SAMPLE).replace(/contenteditable="true"/g, 'contenteditable="false"').replace(/ data-(k|chk)="[^"]*"/g, '');
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
  out.innerHTML = '<p class="pl-hint">Tap the circles and stars to tick them off. Tap any text to edit it. Your ticks are saved on this device.</p>' +
    `<div id="plPageHost">${plRenderPage(plTpl, lastPlan)}</div>` +
    `<div class="pl-toolbar">
      <button class="btn btn-sm btn-peach" onclick="savePlanner()"><i class="ti ti-device-floppy"></i> Save plan</button>
      <button class="btn btn-sm btn-outline" onclick="downloadPlannerPNG()"><i class="ti ti-photo-down"></i> Download image</button>
      <button class="btn btn-sm btn-outline" onclick="printPlanner()"><i class="ti ti-file-type-pdf"></i> Print / PDF</button>
      <button class="btn btn-sm btn-outline" onclick="downloadPlannerICS()"><i class="ti ti-calendar-plus"></i> Add to calendar</button>
      <button class="btn btn-sm btn-outline" onclick="copyPlannerText()"><i class="ti ti-copy"></i> Copy as text</button>
      <button class="btn btn-sm btn-outline" onclick="resetPlannerMarks()"><i class="ti ti-refresh"></i> Clear ticks</button>
    </div>
    <label class="pl-repeat"><input type="checkbox" id="plRepeat" style="width:auto;margin:0"> Repeat the calendar events every week</label>
    <p class="pl-status" id="plStatus" aria-live="polite"></p>`;
}
function plStatus(msg) { const el = document.getElementById('plStatus'); if (el) { el.textContent = msg; clearTimeout(plStatus._t); plStatus._t = setTimeout(() => { el.textContent = ''; }, 5000); } }

function generatePlan(explicit) {
  if (!tasks.length) { if (explicit) alert('Add a subject first — tap one of the chips above.'); return; }
  if (PL_DAYS.every(d => restDays.includes(d))) { if (explicit) alert('Switch on at least one study day.'); return; }
  lastPlan = buildPlan();
  plMarks = plEmptyMarks(); plSaveMarks(); plSaveLast();   // a new plan starts with a clean page
  renderPlannerOutput();
  document.getElementById('pbBuildBtn').innerHTML = '<i class="ti ti-calendar-week"></i> Build my plan';
  if (explicit) { addPoints(5, 'Generated weekly plan'); const o = document.getElementById('plannerOutput'); if (o && o.scrollIntoView) o.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
function resetPlannerMarks() { plMarks = plEmptyMarks(); plSaveMarks(); renderPlannerOutput(); }

// ── saving: a small library kept in this browser ──
function plSaveLibrary() { try { localStorage.setItem('ss_planner_saved', JSON.stringify(plSaved)); } catch (e) { plStatus('Could not save: browser storage is full or blocked.'); } }
function savePlanner() {
  if (!lastPlan) return;
  const def = 'Week of ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const name = (prompt('Name this plan:', def) || '').trim(); if (!name) return;
  plSaved.unshift({ id: Date.now(), name: name.slice(0, 50), when: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), tpl: plTpl, plan: lastPlan, marks: JSON.parse(JSON.stringify(plMarks)) });
  plSaved = plSaved.slice(0, 30); plSaveLibrary(); renderSavedPlans(); plStatus('Saved as “' + name + '”. Find it under My saved plans.');
}
function openSavedPlan(id) {
  const s = plSaved.find(x => x.id === id); if (!s) return;
  lastPlan = s.plan; plMarks = s.marks || plEmptyMarks();
  plTpl = PL_TEMPLATES.some(t => t.id === s.tpl) ? s.tpl : 'journal';
  plSaveMarks(); plSaveLast(); try { localStorage.setItem('ss_planner_tpl', plTpl); } catch (e) {}
  renderPlannerPicker(); renderPlannerOutput();
  const host = document.getElementById('plannerOutput'); if (host && host.scrollIntoView) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function deleteSavedPlan(id) { if (!confirm('Delete this saved plan?')) return; plSaved = plSaved.filter(x => x.id !== id); plSaveLibrary(); renderSavedPlans(); }
function renderSavedPlans() {
  const box = document.getElementById('plSaved'); if (!box) return;
  const names = { journal: 'Weekly Journal', bold: 'Bold Planner', clean: 'Day by Day', tracker: 'Task Tracker' };
  box.innerHTML = '<p class="pl-picker-label">My saved plans</p>' + (plSaved.length
    ? '<div class="pl-saved-grid">' + plSaved.map(s => `<div class="pl-saved"><div><b>${plEsc(s.name)}</b><small>${plEsc(s.when)} · ${plEsc(names[s.tpl] || '')}</small></div><div class="pl-saved-act"><button type="button" onclick="openSavedPlan(${s.id})">Open</button><button type="button" class="danger" onclick="deleteSavedPlan(${s.id})" aria-label="Delete ${plEsc(s.name)}"><i class="ti ti-trash"></i></button></div></div>`).join('') + '</div>'
    : '<p class="pl-empty">Plans you save will be listed here, so you can reopen them next week.</p>');
}

// ── downloads ──
function plDownload(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function plLoadScript(urls) {
  return new Promise((resolve, reject) => {
    const list = urls.slice();
    (function next() {
      if (!list.length) { reject(new Error('script')); return; }
      const s = document.createElement('script'); s.src = list.shift(); s.onload = resolve; s.onerror = () => { s.remove(); next(); }; document.head.appendChild(s);
    })();
  });
}
async function downloadPlannerPNG() {
  const host = document.getElementById('plPageHost'); const page = host && host.firstElementChild; if (!page) return;
  plStatus('Making your image…');
  try {
    if (!window.html2canvas) await plLoadScript(['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js']);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const canvas = await window.html2canvas(page, { scale: 2, backgroundColor: null, useCORS: true, onclone: d => { d.querySelectorAll('.pl-txt:focus').forEach(el => el.blur()); } });
    canvas.toBlob(b => { if (!b) { plStatus('Could not make the image. Try Print / PDF instead.'); return; } plDownload(b, 'studysphere-weekly-plan.png'); plStatus('Image downloaded.'); }, 'image/png');
  } catch (e) { plStatus('Could not make the image here. Use Print / PDF and choose “Save as PDF” instead.'); }
}
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
// Calendar file (.ics): opens in Google Calendar, Apple Calendar and Outlook
function plIcsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
function plBuildICS(plan, repeat, now) {
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StudySphere//Weekly Planner//EN', 'CALSCALE:GREGORIAN'];
  let count = 0;
  PL_DAYS.forEach(d => {
    if (plan.rest.includes(d)) return;
    const diff = (PL_JS_DAY[d] - now.getDay() + 7) % 7;
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    let t = plan.startH * 60;
    (plan.schedule[d] || []).forEach((it, i) => {
      const dur = Math.round(it.hours * 60);
      const s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, t, 0), e = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, t + dur, 0);
      t += dur; count++;
      L.push('BEGIN:VEVENT', `UID:${stamp}-${d}-${i}@studysphere`, `DTSTAMP:${stamp}`, `DTSTART:${fmt(s)}`, `DTEND:${fmt(e)}`,
        `SUMMARY:${plIcsText('Study: ' + it.text)}`, `DESCRIPTION:${plIcsText('Planned with StudySphere (' + it.priority + ' priority)')}`);
      if (repeat) L.push(`RRULE:FREQ=WEEKLY;BYDAY=${PL_ICS_DAY[d]}`);
      L.push('END:VEVENT');
    });
  });
  L.push('END:VCALENDAR');
  return { text: L.join('\r\n') + '\r\n', count };
}
function downloadPlannerICS() {
  if (!lastPlan) return;
  const rep = document.getElementById('plRepeat'); const r = plBuildICS(lastPlan, !!(rep && rep.checked), new Date());
  if (!r.count) { plStatus('There are no study blocks to add yet.'); return; }
  plDownload(new Blob([r.text], { type: 'text/calendar;charset=utf-8' }), 'studysphere-weekly-plan.ics');
  plStatus(r.count + ' study blocks saved. Open the file to add them to your calendar.');
}
function plPlainText(plan) {
  const out = ['MY WEEKLY STUDY PLAN', ''];
  PL_DAYS.forEach(d => {
    out.push(PL_FULL[d].toUpperCase());
    if (plan.rest.includes(d)) out.push('  Rest day');
    else { const b = plBlocks(plan, d); if (!b.length) out.push('  —'); b.forEach(x => out.push(`  ${x.from}–${x.to}  ${x.text} (${plHrs(x.hours)})`)); }
    out.push('');
  });
  return out.join('\n');
}
function copyPlannerText() {
  if (!lastPlan) return; const text = plPlainText(lastPlan);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => plStatus('Plan copied. Paste it into Notes, WhatsApp or email.'), () => plDownload(new Blob([text], { type: 'text/plain' }), 'studysphere-weekly-plan.txt'));
  else plDownload(new Blob([text], { type: 'text/plain' }), 'studysphere-weekly-plan.txt');
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

// bring back the last plan (and its ticks) after a refresh
try { const l = JSON.parse(localStorage.getItem('ss_planner_last') || 'null'); if (l && l.schedule && l.tasks && l.rest) lastPlan = l; } catch (e) {}
pbInit(); renderPlannerPicker(); renderSavedPlans();
if (lastPlan) renderPlannerOutput(); else if (tasks.length) generatePlan(false);
