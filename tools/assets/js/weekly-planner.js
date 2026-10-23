// ══ 8. WEEKLY / DAILY PLANNER — pick a blank template, type or draw on it, save it, download it ══
const PL_W = 600, PL_H = 848;
const PL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PL_INITIAL = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S' };
const PL_TEMPLATES = [
  { id: 'cute',    name: 'Cute Daily',     prefix: 'cd-' },
  { id: 'paw',     name: 'Paw Daily',      prefix: 'pd-' },
  { id: 'peach',   name: 'Peach Weekly',   prefix: 'pw-' },
  { id: 'routine', name: 'Daily Routine',  prefix: 'dr-' },
  { id: 'journal', name: 'Weekly Journal', prefix: 'j-' },
  { id: 'bold',    name: 'Bold Planner',   prefix: 'b-' }
];
const PL_COLORS = ['#2f3e55', '#d1381f', '#2e7d5b', '#7a4fb3', '#e08a1e'];
let plTpl = 'cute', plMode = 'type', plColor = PL_COLORS[0], plSize = 3, plScale = 1;
try { const t = localStorage.getItem('ss_planner_tpl'); if (t && PL_TEMPLATES.some(x => x.id === t)) plTpl = t; } catch (e) {}
function plEmpty() { return { txt: {}, chk: {}, stars: {}, pick: {}, draw: {} }; }
let plMarks = plEmpty();
try { const m = JSON.parse(localStorage.getItem('ss_planner_v2') || 'null'); if (m && m.txt && m.chk) plMarks = Object.assign(plEmpty(), m); } catch (e) {}
let plSaved = [];
try { const s = JSON.parse(localStorage.getItem('ss_planner_saved_v2') || '[]'); if (Array.isArray(s)) plSaved = s; } catch (e) {}
let PL_PLAIN = 'true';
try { const d = document.createElement('div'); d.contentEditable = 'plaintext-only'; if (d.contentEditable === 'plaintext-only') PL_PLAIN = 'plaintext-only'; } catch (e) {}

function plEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
let plSaveTimer = null;
function plSaveMarks() { clearTimeout(plSaveTimer); plSaveTimer = setTimeout(() => { try { localStorage.setItem('ss_planner_v2', JSON.stringify(plMarks)); } catch (e) {} }, 250); }

// ── little original illustrations (inline SVG) ──
const ART = {
  bear: '<svg viewBox="0 0 80 80"><circle cx="17" cy="20" r="12" fill="#b9814f"/><circle cx="63" cy="20" r="12" fill="#b9814f"/><circle cx="17" cy="20" r="6" fill="#e9c6a0"/><circle cx="63" cy="20" r="6" fill="#e9c6a0"/><circle cx="40" cy="44" r="30" fill="#c98f5e"/><ellipse cx="40" cy="54" rx="14" ry="10" fill="#f0d3b0"/><circle cx="30" cy="40" r="3" fill="#4a3a36"/><circle cx="50" cy="40" r="3" fill="#4a3a36"/><ellipse cx="40" cy="49" rx="4.5" ry="3" fill="#4a3a36"/><path d="M40 52v3M35 57q5 4 10 0" stroke="#4a3a36" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  cat: c => `<svg viewBox="0 0 80 70"><polygon points="10,30 13,3 34,18" fill="${c}"/><polygon points="70,30 67,3 46,18" fill="${c}"/><ellipse cx="40" cy="42" rx="31" ry="26" fill="${c}"/><ellipse cx="40" cy="53" rx="16" ry="11" fill="#fff" opacity=".85"/><circle cx="29" cy="39" r="3.2" fill="#4a3a36"/><circle cx="51" cy="39" r="3.2" fill="#4a3a36"/><polygon points="36,47 44,47 40,52" fill="#f08a96"/><path d="M40 52v3M34 57q6 4 12 0" stroke="#4a3a36" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
  paw: c => `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="27" rx="10" ry="8.5" fill="${c}"/><circle cx="7" cy="16" r="5" fill="${c}"/><circle cx="15" cy="8" r="5" fill="${c}"/><circle cx="25" cy="8" r="5" fill="${c}"/><circle cx="33" cy="16" r="5" fill="${c}"/></svg>`,
  bunny: '<svg viewBox="0 0 80 90"><ellipse cx="27" cy="22" rx="9" ry="22" fill="#fff"/><ellipse cx="53" cy="22" rx="9" ry="22" fill="#fff"/><ellipse cx="27" cy="24" rx="4.5" ry="15" fill="#f6b9c4"/><ellipse cx="53" cy="24" rx="4.5" ry="15" fill="#f6b9c4"/><circle cx="40" cy="60" r="27" fill="#fff" stroke="#e9d3c6" stroke-width="2"/><circle cx="31" cy="57" r="3" fill="#4a3a36"/><circle cx="49" cy="57" r="3" fill="#4a3a36"/><circle cx="25" cy="66" r="5" fill="#f9c6cd"/><circle cx="55" cy="66" r="5" fill="#f9c6cd"/><ellipse cx="40" cy="64" rx="3" ry="2.2" fill="#e98a9a"/></svg>',
  cherry: '<svg viewBox="0 0 70 70"><path d="M30 6C28 22 22 34 18 44M34 6c4 14 12 26 22 36" stroke="#5c8a4d" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M34 6c10-4 18 0 20 6-10 2-17 0-20-6Z" fill="#7cb069"/><circle cx="18" cy="52" r="14" fill="#e5484d"/><circle cx="54" cy="50" r="14" fill="#e5484d"/><circle cx="13" cy="47" r="3.5" fill="#fff" opacity=".6"/><circle cx="49" cy="45" r="3.5" fill="#fff" opacity=".6"/></svg>',
  star: c => `<svg viewBox="0 0 40 40"><polygon points="20,3 25,15 38,16 28,25 31,38 20,31 9,38 12,25 2,16 15,15" fill="${c}" stroke="#6f6259" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  heart: c => `<svg viewBox="0 0 40 40"><path d="M20 35C6 25 3 16 8 10c4-4 10-3 12 2 2-5 8-6 12-2 5 6 2 15-12 25Z" fill="${c}" stroke="#6f6259" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  flower: '<svg viewBox="0 0 40 40"><g fill="#f5a6c3"><circle cx="20" cy="9" r="7"/><circle cx="31" cy="17" r="7"/><circle cx="27" cy="30" r="7"/><circle cx="13" cy="30" r="7"/><circle cx="9" cy="17" r="7"/></g><circle cx="20" cy="20" r="6" fill="#ffd966"/></svg>',
  bow: '<svg viewBox="0 0 60 40"><path d="M30 20C20 4 3 4 3 15s17 12 27 5ZM30 20c10-16 27-16 27-5S40 27 30 20Z" fill="#bfe3cf" stroke="#6f6259" stroke-width="1.6" stroke-linejoin="round"/><circle cx="30" cy="20" r="5" fill="#9fd1b8" stroke="#6f6259" stroke-width="1.6"/></svg>',
  clover: '<svg viewBox="0 0 40 40"><g fill="#7fc08a"><circle cx="14" cy="14" r="7"/><circle cx="26" cy="14" r="7"/><circle cx="14" cy="26" r="7"/><circle cx="26" cy="26" r="7"/></g><path d="M20 22q2 10 6 14" stroke="#5c9a68" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  face: n => {
    const fills = ['#ffe89a', '#bfe8c8', '#ffd2a0', '#c9d3ea', '#f4a6a0'];
    const mouths = ['M9 18q5 6 10 0', 'M10 18q4 3 8 0', 'M10 19h8', 'M10 21q4-4 8 0', 'M10 22q4-5 8 0'];
    const brows = n === 4 ? '<path d="M8 8l5 2M20 8l-5 2" stroke="#6f6259" stroke-width="1.6" fill="none" stroke-linecap="round"/>' : '';
    return `<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="${fills[n]}" stroke="#6f6259" stroke-width="1.6"/><circle cx="10" cy="12" r="1.5" fill="#6f6259"/><circle cx="18" cy="12" r="1.5" fill="#6f6259"/><path d="${mouths[n]}" stroke="#6f6259" stroke-width="1.6" fill="none" stroke-linecap="round"/>${brows}</svg>`;
  }
};
const plArt = (svg, style) => `<div class="pl-art" style="${style}">${svg}</div>`;

// ── editable pieces ──
function plVal(k, def) { return Object.prototype.hasOwnProperty.call(plMarks.txt, k) ? plMarks.txt[k] : (def || ''); }
function plLn(k, def, cls) { return `<span class="pl-txt pl-ln${cls ? ' ' + cls : ''}" contenteditable="true" data-k="${k}" spellcheck="false">${plEsc(plVal(k, def))}</span>`; }
function plTxt(k, def, cls) { return `<span class="pl-txt${cls ? ' ' + cls : ''}" contenteditable="true" data-k="${k}" spellcheck="false">${plEsc(plVal(k, def))}</span>`; }
function plArea(k, cls) { return `<div class="pl-txt pl-area${cls ? ' ' + cls : ''}" contenteditable="${PL_PLAIN}" data-k="${k}" data-multi="1" spellcheck="false">${plEsc(plVal(k))}</div>`; }
function plLines(p, n, cls) { let h = ''; for (let i = 0; i < n; i++) h += plLn(p + i, '', cls); return h; }
function plChk(k) { return `<span class="pl-chk${plMarks.chk[k] ? ' on' : ''}" data-chk="${k}" role="checkbox" aria-checked="${plMarks.chk[k] ? 'true' : 'false'}"></span>`; }
function plDots(prefix) { return '<div class="pl-dots">' + PL_DAYS.map(d => { const k = prefix + d; return `<span class="pl-dot${plMarks.chk[k] ? ' on' : ''}" data-chk="${k}">${PL_INITIAL[d]}</span>`; }).join('') + '</div>'; }
function plStars(k) {
  const v = plMarks.stars[k] || 0;
  return `<div class="pl-stars" data-stars="${k}">` + [1, 2, 3, 4, 5].map(n => `<span class="pl-star${n <= v ? ' on' : ''}" data-star="${n}">★</span>`).join('') + '</div>';
}
function plMoods(g) { return '<div class="pl-moods">' + [0, 1, 2, 3, 4].map(n => `<span class="pl-pick${plMarks.pick[g] === n ? ' on' : ''}" data-pick="${g}:${n}">${ART.face(n)}</span>`).join('') + '</div>'; }

// ── the six templates (all blank) ──
function tplCute() {
  return `<div class="pl-sheet pl-cd">
    <div class="pl-cd-head"><div class="pl-cd-title">DAILY<br>PLANNER</div>
      ${plArt(ART.flower, 'left:158px;top:8px;width:34px;height:34px')}
      <div class="pl-cd-date">Date : ${plTxt('cd-date', '')}</div></div>
    <div class="pl-cd-cols">
      <div class="pl-cd-col">
        <div class="pl-card" style="flex:1.15"><i class="pl-ring" style="left:26px"></i><i class="pl-ring" style="left:60px"></i><i class="pl-ring" style="left:94px"></i><i class="pl-ring" style="left:128px"></i><h4 style="top:20px">To Do</h4><div class="pl-card-clip" style="padding-top:18px">${plLines('cd-todo', 8)}</div>${plArt(ART.star('#a9c6dc'), 'right:10px;bottom:34px;width:52px;height:52px')}${plArt(ART.star('#d9cdea'), 'right:56px;bottom:84px;width:24px;height:24px')}</div>
        <div class="pl-card notes" style="flex:1;padding-top:40px"><h4>Notes</h4>${plArt(ART.bow, 'right:30px;top:-12px;width:56px;height:38px')}<div class="pl-card-clip">${plLines('cd-notes', 6)}</div>
          <i class="pl-tab" style="background:#bfe3cf;top:34px"></i><i class="pl-tab" style="background:#c9b8e8;top:104px"></i><i class="pl-tab" style="background:#bfe3cf;top:174px"></i></div>
      </div>
      <div class="pl-cd-col">
        <div class="pl-card prio" style="flex:1.9"><i class="pl-ring" style="left:60px"></i><i class="pl-ring" style="left:130px"></i><i class="pl-ring" style="left:200px"></i><h4 style="top:20px">Top Priorities</h4>${plArt(ART.bear, 'right:-10px;top:-46px;width:86px;height:86px;z-index:3')}<div class="pl-card-clip" style="padding-top:18px;padding-left:12px">${plLines('cd-prio', 12)}</div>${plArt(ART.cherry, 'left:14px;bottom:8px;width:46px;height:46px')}${plArt(ART.heart('#f5a6c3'), 'left:78px;bottom:12px;width:20px;height:20px')}${plArt(ART.cherry, 'left:106px;bottom:8px;width:46px;height:46px')}</div>
        <div class="pl-card remind" style="flex:1"><h4>Reminder</h4><div class="pl-card-clip" style="padding-left:8px">${plLines('cd-rem', 5)}</div>${plArt(ART.star('#c9b8e8'), 'right:10px;top:36px;width:22px;height:22px')}${plArt(ART.heart('#9ec5e0'), 'right:12px;bottom:10px;width:34px;height:34px')}</div>
      </div>
    </div>
    <div class="pl-cd-foot">Today's Mood : ${plMoods('cd-mood')}</div>
  </div>`;
}

function tplPaw() {
  let slots = '';
  for (let h = 7; h <= 22; h++) { const t = String(h).padStart(2, '0') + ':00'; slots += `<div class="pl-pd-slot"><b>${t}</b>${plLn('pd-s' + h, '')}</div>`; }
  const pawArt = (c, st) => plArt(ART.paw(c), st);
  return `<div class="pl-sheet pl-pd">
    <div class="pl-blob" style="left:-70px;top:-80px;width:250px;height:230px"></div>
    <div class="pl-blob" style="left:-60px;bottom:-70px;width:200px;height:170px"></div>
    <div class="pl-blob" style="right:-80px;bottom:-90px;width:300px;height:210px"></div>
    ${pawArt('#f2a35c', 'left:20px;top:22px;width:26px;height:26px;transform:rotate(-20deg);z-index:1')}
    ${pawArt('#f2a35c', 'right:10px;bottom:14px;width:34px;height:34px;transform:rotate(18deg);z-index:1')}
    ${pawArt('#f2a35c', 'left:14px;bottom:20px;width:30px;height:30px;transform:rotate(-10deg);z-index:1')}
    <div class="pl-pd-head"><div class="pl-pd-title" style="padding-top:18px">Daily<br>Planner</div>
      ${plArt(ART.cat('#f1c48b'), 'right:98px;top:20px;width:56px;height:50px')}${plArt(ART.cat('#e9a36b'), 'right:30px;top:6px;width:76px;height:66px')}
      <div class="pl-pd-date">Date: ${plTxt('pd-date', '')}</div></div>
    <div class="pl-pd-body">
      <div class="pl-pd-card pl-pd-sched"><h4>Schedule</h4>${slots}</div>
      <div class="pl-pd-colr">
        <div class="pl-pd-card todo"><h4>To Do List</h4>${[0, 1, 2, 3].map(i => `<div class="pl-pd-pill"><i></i>${plTxt('pd-t' + i, '')}</div>`).join('')}</div>
        <div class="pl-pd-card goals"><h4>Goals</h4>${plLines('pd-g', 6)}${plArt(ART.cat('#e7b06f'), 'left:92px;bottom:-4px;width:62px;height:54px')}${plArt(ART.cat('#cfcfd6'), 'left:34px;bottom:-6px;width:54px;height:48px')}${plArt(ART.cat('#8a8590'), 'left:158px;bottom:-6px;width:54px;height:48px')}</div>
        <div class="pl-pd-card notes"><h4>Notes</h4>${plLines('pd-n', 3)}</div>
      </div>
    </div></div>`;
}

function tplPeach() {
  const cell = (d, dark, wide) => `<div class="pl-pw-cell${dark ? ' dark' : ''}${wide ? ' wide' : ''}"><h4>${d}</h4>${plArea('pw-' + d)}</div>`;
  return `<div class="pl-sheet pl-pw"><div class="pl-pw-in">
    ${plArt(ART.bunny, 'left:6px;top:-6px;width:62px;height:70px;z-index:2')}
    <div class="pl-pw-head"><div class="pl-pw-title">Weekly<br>Planner</div>
      <div class="pl-pw-meta"><div>Month: ${plLn('pw-month', '')}</div><div>Week: ${plLn('pw-week', '')}</div></div></div>
    <div class="pl-pw-grid">
      ${cell('Sunday', true)}${cell('Monday')}${cell('Tuesday')}
      ${cell('Wednesday')}${cell('Thursday')}${cell('Friday', true)}
      ${cell('Saturday')}<div class="pl-pw-cell dark wide"><h4>Notes</h4>${plArea('pw-notes')}${plArt(ART.cherry, 'right:6px;bottom:2px;width:66px;height:66px;z-index:2')}</div>
    </div>
    ${plArt(ART.clover, 'right:2px;top:200px;width:26px;height:26px')}${plArt(ART.clover, 'left:-6px;top:330px;width:26px;height:26px')}
  </div></div>`;
}

function tplRoutine() {
  const sec = (name, p) => {
    let rows = '';
    for (let i = 1; i <= 5; i++) rows += `<div class="pl-dr-item">${i}. ${plLn(p + i, '')}</div>` + PL_DAYS.map(d => `<div class="pl-dr-c">${plChk(p + i + '-' + d)}</div>`).join('');
    return `<div class="pl-dr-sec"><div class="pl-dr-lbl">${name}</div>${PL_DAYS.map(d => `<div class="pl-dr-day">${d.toUpperCase()}</div>`).join('')}${rows}</div>`;
  };
  return `<div class="pl-sheet pl-dr">
    <div class="pl-dr-head"><div class="pl-dr-title">DAILY ROUTINE</div><div class="pl-dr-week">WEEK OF: ${plLn('dr-week', '')}</div></div>
    ${sec('Morning', 'dr-m')}${sec('Afternoon', 'dr-a')}${sec('Evening', 'dr-e')}
    <div class="pl-dr-notes"><div class="pl-dr-lbl">Notes</div>${plLines('dr-n', 3)}</div>
  </div>`;
}

function tplJournal() {
  const habits = ['Study session', 'Revise notes', 'Water', 'Exercise', 'Sleep 8 hours', 'Screen-free hour'];
  return `<div class="pl-sheet pl-j">
    <h3 class="pl-j-title">Weekly <em>Journal</em></h3>
    <div class="pl-j-box">${plTxt('j-motto', 'Listen to Yourself This Week')}</div>
    <div class="pl-j-h">Daily Checklist</div>
    ${habits.map((h, i) => `<div class="pl-j-row">${plTxt('j-habit' + i, h)}${plDots('j-h' + i + '-')}</div>`).join('')}
    <hr class="pl-j-hr">
    <div class="pl-j-two">
      <div><div class="pl-j-h">Weekly Rating</div>${['Focus', 'Sleep', 'Mood'].map((r, i) => `<div class="pl-j-row">${plTxt('j-rate' + i, r)}${plStars('j-star' + i)}</div>`).join('')}</div>
      <div><div class="pl-j-h">To Do:</div>${plLines('j-todo', 5)}</div>
    </div>
    <div class="pl-j-note"><b>Note:</b>${plArea('j-note')}</div>
  </div>`;
}

function tplBold() {
  const day = (d, full) => `<div class="pl-box"><h4>${full}</h4>${[0, 1, 2].map(i => `<div class="pl-row">${plChk('b-' + d + i)}${plLn('b-' + d + i, '')}</div>`).join('')}</div>`;
  return `<div class="pl-sheet pl-r">
    <h3 class="pl-r-title">Weekly Planner</h3>
    ${plTxt('b-sub', 'Think Positive', 'pl-r-sub')}
    <div class="pl-r-grid">
      <div class="pl-col">${day('Mon', 'Monday')}${day('Tue', 'Tuesday')}${day('Wed', 'Wednesday')}${day('Thu', 'Thursday')}${day('Fri', 'Friday')}</div>
      <div class="pl-col">
        <div class="pl-box" style="flex:1.3"><h4>To do list:</h4>${[0, 1, 2, 3].map(i => `<div class="pl-row">${plChk('b-todo' + i)}${plLn('b-todo' + i, '')}</div>`).join('')}</div>
        <div class="pl-box" style="flex:1.45"><h4>Goal tracker</h4>${[0, 1, 2].map(i => `<div class="pl-goal">${plLn('b-goal' + i, '')}${plDots('b-g' + i + '-')}</div>`).join('')}</div>
        ${day('Sat', 'Saturday')}${day('Sun', 'Sunday')}
      </div>
    </div></div>`;
}

function plSheetHTML(id) { return id === 'cute' ? tplCute() : id === 'paw' ? tplPaw() : id === 'peach' ? tplPeach() : id === 'routine' ? tplRoutine() : id === 'journal' ? tplJournal() : tplBold(); }

// ── picker ──
function renderPlannerPicker() {
  const box = document.getElementById('plTemplates'); if (!box) return;
  const keep = plMarks; plMarks = plEmpty(); // thumbnails always show the blank template
  box.innerHTML = PL_TEMPLATES.map(t => {
    const thumb = plSheetHTML(t.id).replace(/contenteditable="[^"]*"/g, 'contenteditable="false"').replace(/ data-(k|chk|pick|star|stars)="[^"]*"/g, '');
    return `<button type="button" class="pl-tpl-btn${t.id === plTpl ? ' selected' : ''}" onclick="choosePlanner('${t.id}')" aria-label="${plEsc(t.name)} template"><div class="pl-thumb">${thumb}</div><span>${plEsc(t.name)}</span></button>`;
  }).join('');
  plMarks = keep;
}
function choosePlanner(id) {
  plTpl = id; try { localStorage.setItem('ss_planner_tpl', id); } catch (e) {}
  renderPlannerPicker(); renderPlannerOutput();
}

// ── output: tools, page, actions ──
function renderPlannerOutput() {
  const out = document.getElementById('plannerOutput'); if (!out) return;
  const sw = PL_COLORS.map(c => `<button type="button" class="pl-swatch${c === plColor ? ' on' : ''}" style="background:${c}" onclick="plSetColor('${c}')" aria-label="Pen colour ${c}"></button>`).join('');
  out.innerHTML =
    `<div class="pl-tools">
      <button type="button" class="pl-tool${plMode === 'type' ? ' active' : ''}" onclick="plSetMode('type')"><i class="ti ti-keyboard"></i> Type</button>
      <button type="button" class="pl-tool${plMode === 'pen' ? ' active' : ''}" onclick="plSetMode('pen')"><i class="ti ti-pencil"></i> Pen</button>
      <button type="button" class="pl-tool${plMode === 'eraser' ? ' active' : ''}" onclick="plSetMode('eraser')"><i class="ti ti-eraser"></i> Eraser</button>
      <span class="pl-swatches">${sw}</span>
      <button type="button" class="pl-tool" onclick="plUndo()"><i class="ti ti-arrow-back-up"></i> Undo</button>
    </div>
    <p class="pl-hint">Type: tap any line to write, tap circles to tick. Pen: draw or handwrite with your finger or stylus.</p>
    <div class="pl-stage${plMode !== 'type' ? ' drawing' : ''}" id="plStage"><div class="pl-sheetwrap" id="plWrap">${plSheetHTML(plTpl)}<canvas class="pl-canvas" id="plCanvas" width="${PL_W * 2}" height="${PL_H * 2}"></canvas></div></div>
    <div class="pl-actions">
      <button class="btn btn-sm btn-peach" onclick="savePlanner()"><i class="ti ti-device-floppy"></i> Save</button>
      <button class="btn btn-sm btn-outline" onclick="downloadPlannerPNG()"><i class="ti ti-photo-down"></i> Download image</button>
      <button class="btn btn-sm btn-outline" onclick="printPlanner()"><i class="ti ti-file-type-pdf"></i> Print / PDF</button>
      <button class="btn btn-sm btn-outline" onclick="clearPlannerPage()"><i class="ti ti-refresh"></i> Clear page</button>
    </div>
    <p class="pl-status" id="plStatus" aria-live="polite"></p>`;
  plFit(); plRedraw();
}
function plStatus(msg) { const el = document.getElementById('plStatus'); if (el) { el.textContent = msg; clearTimeout(plStatus._t); plStatus._t = setTimeout(() => { el.textContent = ''; }, 6000); } }
function plFit(force) {
  const out = document.getElementById('plannerOutput'), stage = document.getElementById('plStage'), wrap = document.getElementById('plWrap'); if (!out || !stage || !wrap) return;
  const avail = Math.max(240, out.clientWidth - 4);
  plScale = force || Math.min(1.25, avail / PL_W);
  wrap.style.transform = 'scale(' + plScale + ')';
  stage.style.width = Math.round(PL_W * plScale) + 'px'; stage.style.height = Math.round(PL_H * plScale) + 'px';
}
window.addEventListener('resize', () => plFit());

function plSetMode(m) { plMode = m; renderPlannerOutput(); }
function plSetColor(c) { plColor = c; if (plMode === 'type') plMode = 'pen'; renderPlannerOutput(); }

// ── pen / eraser (strokes stored in page coordinates, so they scale with the page) ──
function plCtx() { const c = document.getElementById('plCanvas'); if (!c) return null; const x = c.getContext('2d'); x.setTransform(2, 0, 0, 2, 0, 0); return x; }
function plStrokeSeg(ctx, st, a, b) {
  ctx.save(); ctx.globalCompositeOperation = st.e ? 'destination-out' : 'source-over'; ctx.strokeStyle = st.c; ctx.lineWidth = st.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
}
function plRedraw() {
  const ctx = plCtx(); if (!ctx) return; ctx.clearRect(0, 0, PL_W, PL_H);
  (plMarks.draw[plTpl] || []).forEach(st => { const p = st.p; if (p.length === 1) plStrokeSeg(ctx, st, p[0], [p[0][0] + .01, p[0][1]]); for (let i = 1; i < p.length; i++) plStrokeSeg(ctx, st, p[i - 1], p[i]); });
}
function plUndo() { const a = plMarks.draw[plTpl]; if (a && a.length) { a.pop(); plSaveMarks(); plRedraw(); } }
let plCur = null;
function plPoint(e, c) { const r = c.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * PL_W / r.width * 10) / 10, Math.round((e.clientY - r.top) * PL_H / r.height * 10) / 10]; }
document.addEventListener('pointerdown', function (e) {
  const c = e.target.closest && e.target.closest('#plCanvas'); if (!c || plMode === 'type') return;
  e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (x) {}
  plCur = { c: plColor, w: plMode === 'eraser' ? 20 : plSize, e: plMode === 'eraser', p: [plPoint(e, c)] };
  (plMarks.draw[plTpl] = plMarks.draw[plTpl] || []).push(plCur);
  plStrokeSeg(plCtx(), plCur, plCur.p[0], [plCur.p[0][0] + .01, plCur.p[0][1]]);
});
document.addEventListener('pointermove', function (e) {
  if (!plCur) return; const c = document.getElementById('plCanvas'); if (!c) return;
  const pt = plPoint(e, c), last = plCur.p[plCur.p.length - 1]; if (Math.abs(pt[0] - last[0]) + Math.abs(pt[1] - last[1]) < .6) return;
  plCur.p.push(pt); plStrokeSeg(plCtx(), plCur, last, pt);
});
function plEndStroke() { if (plCur) { plCur = null; plSaveMarks(); } }
document.addEventListener('pointerup', plEndStroke); document.addEventListener('pointercancel', plEndStroke);

function clearPlannerPage() {
  if (!confirm('Clear everything on this page? This cannot be undone.')) return;
  const t = PL_TEMPLATES.find(x => x.id === plTpl);
  ['txt', 'chk', 'stars', 'pick'].forEach(g => Object.keys(plMarks[g]).forEach(k => { if (k.indexOf(t.prefix) === 0) delete plMarks[g][k]; }));
  delete plMarks.draw[plTpl]; plSaveMarks(); renderPlannerOutput();
}

// ── saved plans (kept in this browser) ──
function plSaveLibrary() { try { localStorage.setItem('ss_planner_saved_v2', JSON.stringify(plSaved)); return true; } catch (e) { plStatus('Could not save: browser storage is full or blocked.'); return false; } }
function savePlanner() {
  const def = 'Plan ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const name = (prompt('Name this plan:', def) || '').trim(); if (!name) return;
  const t = PL_TEMPLATES.find(x => x.id === plTpl), snap = plEmpty();
  ['txt', 'chk', 'stars', 'pick'].forEach(g => Object.keys(plMarks[g]).forEach(k => { if (k.indexOf(t.prefix) === 0) snap[g][k] = plMarks[g][k]; }));
  if (plMarks.draw[plTpl]) snap.draw[plTpl] = JSON.parse(JSON.stringify(plMarks.draw[plTpl]));
  plSaved.unshift({ id: Date.now(), name: name.slice(0, 50), when: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), tpl: plTpl, marks: snap });
  plSaved = plSaved.slice(0, 25);
  if (plSaveLibrary()) { renderSavedPlans(); plStatus('Saved as “' + name + '”. Find it under My saved plans.'); }
}
function openSavedPlan(id) {
  const s = plSaved.find(x => x.id === id); if (!s) return;
  const t = PL_TEMPLATES.find(x => x.id === s.tpl); if (!t) return;
  ['txt', 'chk', 'stars', 'pick'].forEach(g => { Object.keys(plMarks[g]).forEach(k => { if (k.indexOf(t.prefix) === 0) delete plMarks[g][k]; }); Object.assign(plMarks[g], (s.marks || {})[g] || {}); });
  plMarks.draw[s.tpl] = (s.marks && s.marks.draw && s.marks.draw[s.tpl]) ? JSON.parse(JSON.stringify(s.marks.draw[s.tpl])) : [];
  plTpl = s.tpl; try { localStorage.setItem('ss_planner_tpl', plTpl); } catch (e) {}
  plSaveMarks(); renderPlannerPicker(); renderPlannerOutput();
  const host = document.getElementById('plannerOutput'); if (host && host.scrollIntoView) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function deleteSavedPlan(id) { if (!confirm('Delete this saved plan?')) return; plSaved = plSaved.filter(x => x.id !== id); plSaveLibrary(); renderSavedPlans(); }
function renderSavedPlans() {
  const box = document.getElementById('plSaved'); if (!box) return;
  box.innerHTML = '<p class="pl-picker-label">My saved plans</p>' + (plSaved.length
    ? '<div class="pl-saved-grid">' + plSaved.map(s => { const t = PL_TEMPLATES.find(x => x.id === s.tpl); return `<div class="pl-saved"><div><b>${plEsc(s.name)}</b><small>${plEsc(s.when)} · ${plEsc(t ? t.name : '')}</small></div><div class="pl-saved-act"><button type="button" onclick="openSavedPlan(${s.id})">Open</button><button type="button" class="danger" onclick="deleteSavedPlan(${s.id})" aria-label="Delete ${plEsc(s.name)}">Delete</button></div></div>`; }).join('') + '</div>'
    : '<p class="pl-empty">Pages you save will be listed here, so you can reopen and keep filling them in.</p>');
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
  const sheet = document.querySelector('#plWrap .pl-sheet'); if (!sheet) return;
  plStatus('Making your image…');
  const wrap = document.getElementById('plWrap'), keep = plScale;
  try {
    if (!window.html2canvas) await plLoadScript(['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js']);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    plFit(1);                                           // capture at full size, then go back
    const page = await window.html2canvas(wrap, { scale: 2, backgroundColor: null, useCORS: true, width: PL_W, height: PL_H });
    plFit(keep);
    page.toBlob(b => { if (!b) { plStatus('Could not make the image. Try Print / PDF instead.'); return; } plDownload(b, 'studysphere-planner.png'); plStatus('Image downloaded.'); }, 'image/png');
  } catch (e) { plFit(keep); plStatus('Could not make the image here. Use Print / PDF and choose “Save as PDF” instead.'); }
}
function printPlanner() {
  const sheet = document.querySelector('#plWrap .pl-sheet'); if (!sheet) return;
  const clone = sheet.cloneNode(true);
  const cv = document.getElementById('plCanvas');
  const img = '<img src="' + cv.toDataURL('image/png') + '" style="position:absolute;left:0;top:0;width:600px;height:848px;z-index:20" alt="">';
  const base = f => new URL(f, location.href).href;
  const w = window.open('', '_blank'); if (!w) { alert('Please allow pop-ups to print or save as PDF.'); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Planner</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Fredoka:wght@500;600&family=Fraunces:wght@600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Great+Vibes&family=Anton&display=swap" rel="stylesheet">' +
    '<link rel="stylesheet" href="' + base('assets/weekly-planner.css') + '">' +
    '<style>html,body{margin:0;background:#fff}.box{width:720px;height:1018px;margin:0 auto;overflow:hidden}.in{width:600px;height:848px;transform:scale(1.2);transform-origin:top left;position:relative}@page{size:A4;margin:6mm}</style></head><body><div class="box"><div class="in">' +
    clone.outerHTML + img + '</div></div></body></html>');
  w.document.close(); w.focus();
  setTimeout(function () { try { w.print(); } catch (e) {} }, 900);
}

// ── interaction (delegated) ──
document.addEventListener('click', function (e) {
  const out = document.getElementById('plannerOutput'); if (!out || !out.contains(e.target) || plMode !== 'type') return;
  const c = e.target.closest('[data-chk]');
  if (c) { const k = c.dataset.chk; plMarks.chk[k] = !plMarks.chk[k]; c.classList.toggle('on', !!plMarks.chk[k]); c.setAttribute('aria-checked', plMarks.chk[k] ? 'true' : 'false'); plSaveMarks(); return; }
  const s = e.target.closest('[data-star]');
  if (s) {
    const wrap = s.closest('[data-stars]'), k = wrap.dataset.stars, n = parseInt(s.dataset.star, 10);
    plMarks.stars[k] = plMarks.stars[k] === n ? 0 : n;
    wrap.querySelectorAll('.pl-star').forEach(el => el.classList.toggle('on', parseInt(el.dataset.star, 10) <= plMarks.stars[k]));
    plSaveMarks(); return;
  }
  const p = e.target.closest('[data-pick]');
  if (p) {
    const parts = p.dataset.pick.split(':'), g = parts[0], v = parseInt(parts[1], 10);
    plMarks.pick[g] = plMarks.pick[g] === v ? -1 : v;
    document.querySelectorAll('#plannerOutput [data-pick^="' + g + ':"]').forEach(el => el.classList.toggle('on', el.dataset.pick === g + ':' + plMarks.pick[g]));
    plSaveMarks();
  }
});
document.addEventListener('input', function (e) {
  const t = e.target.closest && e.target.closest('.pl-txt[data-k]'); if (!t) return;
  plMarks.txt[t.dataset.k] = t.innerText.replace(/\n$/, ''); plSaveMarks();
});
document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.closest && e.target.closest('.pl-txt') && !e.target.closest('[data-multi]')) { e.preventDefault(); e.target.blur(); } });
document.addEventListener('paste', function (e) {
  if (!(e.target.closest && e.target.closest('.pl-txt'))) return;
  e.preventDefault(); const multi = !!e.target.closest('[data-multi]');
  let text = (e.clipboardData || window.clipboardData).getData('text'); if (!multi) text = text.replace(/\s+/g, ' ');
  document.execCommand('insertText', false, text);
});

renderPlannerPicker(); renderSavedPlans(); renderPlannerOutput();
