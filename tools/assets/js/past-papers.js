// ══ 10. PAST PAPERS HUB ══
const CAIE_SUBJECTS = [
  { name: 'Mathematics', code: '0580', icon:'<i class=\'ti ti-123\'></i>' },
  { name: 'Add. Mathematics', code: '0606', icon:'<i class=\'ti ti-ruler-2\'></i>' },
  { name: 'Physics', code: '0625', icon:'<i class=\'ti ti-bolt\'></i>' },
  { name: 'Chemistry', code: '0620', icon:'<i class=\'ti ti-test-pipe\'></i>' },
  { name: 'Biology', code: '0610', icon:'<i class=\'ti ti-dna-2\'></i>' },
  { name: 'English Language', code: '0500', icon:'<i class=\'ti ti-book\'></i>' },
  { name: 'English Literature', code: '0475', icon:'<i class=\'ti ti-books\'></i>' },
  { name: 'History', code: '0470', icon:'<i class=\'ti ti-building-bank\'></i>' },
  { name: 'Geography', code: '0460', icon:'<i class=\'ti ti-world\'></i>' },
  { name: 'Economics', code: '0455', icon:'<i class=\'ti ti-chart-line\'></i>' },
  { name: 'Business Studies', code: '0450', icon:'<i class=\'ti ti-briefcase\'></i>' },
  { name: 'Accounting', code: '0452', icon:'<i class=\'ti ti-calculator\'></i>' },
  { name: 'Computer Science', code: '0478', icon:'<i class=\'ti ti-device-laptop\'></i>' },
  { name: 'Sociology', code: '0495', icon:'<i class=\'ti ti-users\'></i>' },
];
const EDEX_SUBJECTS = [
  { name: 'Mathematics A', code: '4MA1', icon:'<i class=\'ti ti-123\'></i>' },
  { name: 'Mathematics B', code: '4MB1', icon:'<i class=\'ti ti-ruler-2\'></i>' },
  { name: 'Physics', code: '4PH1', icon:'<i class=\'ti ti-bolt\'></i>' },
  { name: 'Chemistry', code: '4CH1', icon:'<i class=\'ti ti-test-pipe\'></i>' },
  { name: 'Biology', code: '4BI1', icon:'<i class=\'ti ti-dna-2\'></i>' },
  { name: 'English Language A', code: '4EA1', icon:'<i class=\'ti ti-book\'></i>' },
  { name: 'History', code: '4HI1', icon:'<i class=\'ti ti-building-bank\'></i>' },
  { name: 'Geography', code: '4GE1', icon:'<i class=\'ti ti-world\'></i>' },
  { name: 'Economics', code: '4EC1', icon:'<i class=\'ti ti-chart-line\'></i>' },
  { name: 'Business', code: '4BS1', icon:'<i class=\'ti ti-briefcase\'></i>' },
  { name: 'Accounting', code: '4AC1', icon:'<i class=\'ti ti-calculator\'></i>' },
  { name: 'Computer Science', code: '4IT1', icon:'<i class=\'ti ti-device-laptop\'></i>' },
  { name: 'Further Pure Maths', code: '4PM1', icon:'<i class=\'ti ti-microscope\'></i>' },
];
const CAIE_SITES = [
  { name: 'PapaCambridge', icon:'<i class=\'ti ti-book\'></i>', desc: 'Largest CAIE past papers collection — all subjects, all years', url: 'https://pastpapers.papacambridge.com/', color: '#e8f0fd' },
  { name: 'Dilan Papers', icon:'<i class=\'ti ti-folder\'></i>', desc: 'Well-organised Cambridge past papers and mark schemes', url: 'https://dilanpapers.com/', color: '#EEEBFF' },
  { name: 'SaveMyExams', icon:'<i class=\'ti ti-book\'></i>', desc: 'Topic questions, past papers & revision notes for CAIE', url: 'https://www.savemyexams.com/', color: '#e8f5ee' },
  { name: 'XtremePapers', icon:'<i class=\'ti ti-notebook\'></i>', desc: 'Community forum with IGCSE/A Level papers & discussion', url: 'https://community.xtremepapers.com/', color: '#fde8e8' },
  { name: 'Cambridge Official', icon:'<i class=\'ti ti-circle-filled\'></i>', desc: 'Official past papers direct from CAIE', url: 'https://www.cambridgeinternational.org/exam-administration/exam-resources/past-papers/', color: '#e8eeff' },
  { name: 'Smart Exam Resources', icon:'<i class=\'ti ti-circle-filled\'></i>', desc: 'Topical questions organised by chapter', url: 'https://www.smartexamresources.com/', color: '#e8f5ee' },
  { name: 'Physics & Maths Tutor', icon:'<i class=\'ti ti-ruler-2\'></i>', desc: 'IGCSE & A Level topic questions and past papers', url: 'https://www.physicsandmathstutor.com/', color: '#fff3cd' },
  { name: 'ZNotes', icon:'<i class=\'ti ti-book\'></i>', desc: 'Free concise notes + past paper links for all CAIE subjects', url: 'https://znotes.org/', color: '#f5e8ff' },
];
const EDEX_SITES = [
  { name: 'Edexcel Official', icon:'<i class=\'ti ti-circle-filled\'></i>', desc: 'Official Edexcel past papers & mark schemes from Pearson', url: 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', color: '#fde8e8' },
  { name: 'PapaCambridge', icon:'<i class=\'ti ti-book\'></i>', desc: 'Large collection of Edexcel IGCSE & IAL past papers', url: 'https://pastpapers.papacambridge.com/', color: '#e8f0fd' },
  { name: 'SaveMyExams', icon:'<i class=\'ti ti-book\'></i>', desc: 'Edexcel topic questions, past papers & model answers', url: 'https://www.savemyexams.com/', color: '#e8f5ee' },
  { name: 'Physics & Maths Tutor', icon:'<i class=\'ti ti-ruler-2\'></i>', desc: 'Edexcel IGCSE & A Level past papers and topic questions', url: 'https://www.physicsandmathstutor.com/', color: '#fff3cd' },
  { name: 'Maths Made Easy', icon:'<i class=\'ti ti-123\'></i>', desc: 'Edexcel IGCSE maths past papers with solutions', url: 'https://mathsmadeeasy.co.uk/', color: '#e8f5ee' },
  { name: 'Revisely', icon:'<i class=\'ti ti-circle-check\'></i>', desc: 'Edexcel IGCSE & A Level revision notes and past papers', url: 'https://www.revisely.co.uk/', color: '#EEEBFF' },
  { name: 'Smart Exam Resources', icon:'<i class=\'ti ti-circle-filled\'></i>', desc: 'Topical practice for Edexcel IGCSE subjects', url: 'https://www.smartexamresources.com/', color: '#e8f5ee' },
  { name: 'Pearson Active Learn', icon:'<i class=\'ti ti-circle-filled\'></i>', desc: 'Official Edexcel digital resources and practice', url: 'https://www.pearsonactivelearn.com/', color: '#E0DCFF' },
];
const SERIES_KEYS = {
  '2025': ['jun_2025','oct_2025'],
  '2024': ['jun_2024','oct_2024'],
  '2023': ['jun_2023','oct_2023'],
  '2022': ['jun_2022','oct_2022'],
  'older': ['jun_2021','oct_2021','jun_2020','oct_2019','jun_2019'],
  'all': ['jun_2025','oct_2025','jun_2024','oct_2024','jun_2023','oct_2023','jun_2022','oct_2022','jun_2021','oct_2021'],
};
function getSeriesLabel(s) { const map = { jun:'June', oct:'Oct/Nov' }; const [session, year] = s.split('_'); return `${map[session]||session} ${year}`; }
let ppBoard = 'caie', ppCaieSelIdx = null, ppEdexSelIdx = null, ppCaieFilter = 'all', ppEdexFilter = 'all';
function initPPHub() {
  document.getElementById('ppCaieSubjects').innerHTML = CAIE_SUBJECTS.map((s,i) => `<div class="pp-subject-card" id="ppCaieSubj${i}" onclick="selectPPSubject('caie',${i})"><div class="pp-subj-icon">${s.icon}</div><div class="pp-subj-name">${s.name}</div><div class="pp-subj-code">${s.code}</div></div>`).join('');
  document.getElementById('ppEdexcelSubjects').innerHTML = EDEX_SUBJECTS.map((s,i) => `<div class="pp-subject-card" id="ppEdexSubj${i}" onclick="selectPPSubject('edexcel',${i})"><div class="pp-subj-icon">${s.icon}</div><div class="pp-subj-name">${s.name}</div><div class="pp-subj-code">${s.code}</div></div>`).join('');
  document.getElementById('ppCaieSiteGrid').innerHTML = CAIE_SITES.map(s => `<div class="pp-site-card" style="background:${s.color}"><div class="pp-site-icon">${s.icon}</div><div class="pp-site-name">${s.name}</div><div class="pp-site-desc">${s.desc}</div><a href="${s.url}" target="_blank"><button class="btn btn-sm btn-outline" style="margin-top:8px;width:100%">Open <i class="ti ti-external-link"></i></button></a></div>`).join('');
  document.getElementById('ppEdexcelSiteGrid').innerHTML = EDEX_SITES.map(s => `<div class="pp-site-card" style="background:${s.color}"><div class="pp-site-icon">${s.icon}</div><div class="pp-site-name">${s.name}</div><div class="pp-site-desc">${s.desc}</div><a href="${s.url}" target="_blank"><button class="btn btn-sm btn-outline" style="margin-top:8px;width:100%">Open <i class="ti ti-external-link"></i></button></a></div>`).join('');
}
function selectPPBoard(board) {
  ppBoard = board;
  document.getElementById('ppTabCaie').classList.toggle('active', board === 'caie');
  document.getElementById('ppTabEdexcel').classList.toggle('active', board === 'edexcel');
  document.getElementById('ppCaiePanel').style.display = board === 'caie' ? 'block' : 'none';
  document.getElementById('ppEdexcelPanel').style.display = board === 'edexcel' ? 'block' : 'none';
}
function selectPPSubject(board, idx) {
  const subjects = board === 'caie' ? CAIE_SUBJECTS : EDEX_SUBJECTS;
  const prefix = board === 'caie' ? 'ppCaieSubj' : 'ppEdexSubj';
  subjects.forEach((_, i) => { const el = document.getElementById(`${prefix}${i}`); if (el) el.classList.remove('selected'); });
  document.getElementById(`${prefix}${idx}`).classList.add('selected');
  if (board === 'caie') { ppCaieSelIdx = idx; document.getElementById('ppCaieFilters').style.display = 'flex'; }
  else { ppEdexSelIdx = idx; document.getElementById('ppEdexcelFilters').style.display = 'flex'; }
  renderPPResults(board); addPoints(1, 'Browsed past papers');
}
function setPPFilter(btn, board) {
  const filterId = board === 'caie' ? 'ppCaieFilters' : 'ppEdexcelFilters';
  document.getElementById(filterId).querySelectorAll('.pp-filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  if (board === 'caie') ppCaieFilter = btn.dataset.series;
  else ppEdexFilter = btn.dataset.series;
  renderPPResults(board);
}
function renderPPResults(board) {
  const subjIdx = board === 'caie' ? ppCaieSelIdx : ppEdexSelIdx;
  const filter = board === 'caie' ? ppCaieFilter : ppEdexFilter;
  const subjects = board === 'caie' ? CAIE_SUBJECTS : EDEX_SUBJECTS;
  const resultsEl = document.getElementById(board === 'caie' ? 'ppCaieResults' : 'ppEdexcelResults');
  if (subjIdx === null) return;
  const subj = subjects[subjIdx];
  const seriesKeys = SERIES_KEYS[filter] || SERIES_KEYS['all'];
  const papers = [];
  seriesKeys.forEach(series => {
    const sl = getSeriesLabel(series); const [sess, yr] = series.split('_');
    const paperNums = subj.code.startsWith('4') ? ['1','2'] : ['1','2','3','4'];
    if (board === 'caie') {
      const code = subj.code;
      paperNums.forEach(p => {
        papers.push({ title: `${subj.name} — Paper ${p} — ${sl}`, meta: `Cambridge IGCSE ${code} · ${sl} · Paper ${p}`,
          links: [
            { label: 'PapaCambridge <i class=\'ti ti-external-link\'></i>', url: `https://pastpapers.papacambridge.com/papers/caie/igcse-${code.toLowerCase()}-${sess}-${yr}/`, cls: '' },
            { label: 'Dilan Papers <i class=\'ti ti-external-link\'></i>', url: `https://dilanpapers.com/?s=${encodeURIComponent(subj.name)}+${sl}+paper+${p}`, cls: 'ms' },
            { label: 'SaveMyExams <i class=\'ti ti-external-link\'></i>', url: `https://www.savemyexams.com/igcse/${subj.name.toLowerCase().replace(/ /g,'-')}/`, cls: 'er' },
          ] });
      });
    } else {
      const code = subj.code;
      paperNums.slice(0,2).forEach(p => {
        papers.push({ title: `${subj.name} — Paper ${p} — ${sl}`, meta: `Edexcel IGCSE ${code} · ${sl} · Paper ${p}`,
          links: [
            { label: 'Edexcel Official <i class=\'ti ti-external-link\'></i>', url: `https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html`, cls: '' },
            { label: 'PapaCambridge <i class=\'ti ti-external-link\'></i>', url: `https://pastpapers.papacambridge.com/papers/edexcel/igcse-${code.toLowerCase()}-${sess}-${yr}/`, cls: 'ms' },
            { label: 'SaveMyExams <i class=\'ti ti-external-link\'></i>', url: `https://www.savemyexams.com/igcse/${subj.name.toLowerCase().replace(/ /g,'-')}-edexcel/`, cls: 'er' },
          ] });
      });
    }
  });
  if (!papers.length) { resultsEl.innerHTML = '<div class="pp-empty">No papers found for this filter.</div>'; return; }
  resultsEl.innerHTML = papers.slice(0, 20).map(p => `
    <div class="pp-paper-item">
      <div class="pp-paper-info"><div class="pp-paper-title">${p.title}</div><div class="pp-paper-meta">${p.meta}</div></div>
      <div class="pp-paper-links">${p.links.map(l => `<a href="${l.url}" target="_blank" class="pp-link-btn ${l.cls}">${l.label}</a>`).join('')}</div>
    </div>`).join('');
}
initPPHub();

