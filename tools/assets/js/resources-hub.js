// ══ 11. NOTES & RESOURCES HUB ══
const ONLINE_NOTE_SITES = [
  { name: 'SaveMyExams', icon: '📗', desc: 'High-quality IGCSE & A Level notes, topic questions & past papers for Cambridge & Edexcel', url: 'https://www.savemyexams.com/', tag: 'freemium' },
  { name: 'ZNotes', icon: '📘', desc: 'Free condensed notes for Cambridge IGCSE & A Level — all major subjects', url: 'https://www.znotes.org/', tag: 'free' },
  { name: 'Physics & Maths Tutor', icon: '📐', desc: 'Notes, topic questions and model answers for Cambridge & Edexcel IGCSE/A Level', url: 'https://www.physicsandmathstutor.com/', tag: 'free' },
  { name: 'Chemrevise', icon: '🧪', desc: 'Free A Level Chemistry notes by topic for Cambridge & Edexcel', url: 'https://chemrevise.org/', tag: 'free' },
  { name: 'Isaac Physics', icon: '⚡', desc: 'Free problem-solving practice and notes for Physics & Maths A Level', url: 'https://isaacphysics.org/', tag: 'free' },
  { name: 'Tutor2U', icon: '📊', desc: 'Economics, Business & Sociology notes, quizzes and exam practice', url: 'https://www.tutor2u.net/', tag: 'freemium' },
  { name: 'Revisely', icon: '✅', desc: 'GCSE & A Level revision notes, flashcards and past papers', url: 'https://www.revisely.co.uk/', tag: 'free' },
  { name: 'Exam Solutions', icon: '🎯', desc: 'Video tutorials and worked solutions for Maths & Sciences', url: 'https://www.examsolutions.net/', tag: 'free' },
  { name: 'GradePod', icon: '🌱', desc: 'Concise subject summaries and flashcards for IGCSE students', url: 'https://www.gradepod.com/', tag: 'free' },
  { name: 'A Level Biology', icon: '🧬', desc: 'Comprehensive free A Level Biology notes and revision resources', url: 'https://alevelbiology.co.uk/', tag: 'free' },
  { name: 'Revision World', icon: '🌍', desc: 'Free revision notes and past papers across all subjects', url: 'https://revisionworld.com/', tag: 'free' },
  { name: 'Mr. Bruff (YT)', icon: '📝', desc: 'Excellent free English Language & Literature revision on YouTube', url: 'https://www.youtube.com/@mrbruff', tag: 'free' },
];
const VIDEO_SITES = [
  { name: 'Khan Academy', icon: '🎓', desc: 'Completely free video lessons & practice for Maths, Sciences and more — excellent for IGCSE', url: 'https://khanacademy.org', tag: 'free' },
  { name: 'YouTube (StudySpace)', icon: '▶️', desc: 'Search "[subject] IGCSE revision" — tons of free teacher-made video lessons', url: 'https://youtube.com', tag: 'free' },
  { name: 'Cognito', icon: '💡', desc: 'Free animated GCSE & A Level Science and Maths videos on YouTube', url: 'https://www.youtube.com/@CognitoEdu', tag: 'free' },
  { name: 'Exam Solutions', icon: '📐', desc: 'Free maths video solutions and past paper walkthroughs', url: 'https://www.examsolutions.net/', tag: 'free' },
  { name: 'Science and Maths by Primrose', icon: '🌸', desc: 'Clear and free A Level Biology, Chemistry and Maths videos', url: 'https://www.youtube.com/@PrimroseKitten', tag: 'free' },
  { name: 'Crash Course', icon: '🚀', desc: 'Free entertaining educational videos covering Biology, Chemistry, Physics, History and more', url: 'https://www.youtube.com/@crashcourse', tag: 'free' },
  { name: 'Fuse School', icon: '⚗️', desc: 'Free animated videos for GCSE & A Level Sciences and Maths', url: 'https://www.youtube.com/@FuseSchoolGlobalEducation', tag: 'free' },
  { name: 'Coursera', icon: '🏫', desc: 'University-level courses — many free to audit. Great for advanced learners.', url: 'https://coursera.org', tag: 'freemium' },
  { name: 'edX', icon: '🎒', desc: 'Free university courses from Harvard, MIT and more — audit for free', url: 'https://edx.org', tag: 'freemium' },
  { name: 'Seneca Learning', icon: '🦉', desc: 'Free AI-powered revision platform for IGCSE subjects with video + questions', url: 'https://senecalearning.com', tag: 'free' },
];

let nhTab = 'generate', nhDonateFile = null;
let communityNotes = JSON.parse(localStorage.getItem('ss_communityNotes') || '[]');
function selectNHTab(tab) {
  nhTab = tab;
  ['generate','online','videos','donate'].forEach(t => {
    const btn = document.getElementById(`nhTab${t.charAt(0).toUpperCase()+t.slice(1)}`);
    const panel = document.getElementById(`nh${t.charAt(0).toUpperCase()+t.slice(1)}Panel`);
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'online') renderOnlineNotes();
  if (tab === 'videos') renderVideoSites();
  if (tab === 'donate') renderCommunityNotes();
}
function renderOnlineNotes() {
  document.getElementById('nhOnlineGrid').innerHTML = ONLINE_NOTE_SITES.map(s => {
    const tagCls = s.tag === 'free' ? 'tag-free' : s.tag === 'freemium' ? 'tag-freemium' : 'tag-paid';
    const tagLabel = s.tag === 'free' ? 'FREE' : s.tag === 'freemium' ? 'FREEMIUM' : 'PAID';
    return `<div class="nh-online-card"><div class="nhoc-icon">${s.icon}</div><div class="nhoc-name">${s.name} <span class="resource-free-tag ${tagCls}">${tagLabel}</span></div><div class="nhoc-desc">${s.desc}</div><a href="${s.url}" target="_blank"><button class="btn btn-sm btn-outline" style="margin-top:8px;width:100%">Open ↗</button></a></div>`;
  }).join('');
}
function renderVideoSites() {
  document.getElementById('nhVideosGrid').innerHTML = VIDEO_SITES.map(s => {
    const tagCls = s.tag === 'free' ? 'tag-free' : s.tag === 'freemium' ? 'tag-freemium' : 'tag-paid';
    const tagLabel = s.tag === 'free' ? 'FREE' : s.tag === 'freemium' ? 'FREEMIUM' : 'PAID';
    return `<div class="nh-online-card"><div class="nhoc-icon">${s.icon}</div><div class="nhoc-name">${s.name} <span class="resource-free-tag ${tagCls}">${tagLabel}</span></div><div class="nhoc-desc">${s.desc}</div><a href="${s.url}" target="_blank"><button class="btn btn-sm btn-outline" style="margin-top:8px;width:100%">Open ↗</button></a></div>`;
  }).join('');
}
function handleNHDonateDrop(e) { e.preventDefault(); document.getElementById('nhDonateZone').classList.remove('dragover'); const file = e.dataTransfer.files[0]; if (file) processNHDonate(file); }
function handleNHDonateSelect(e) { const file = e.target.files[0]; if (file) processNHDonate(file); }
function processNHDonate(file) {
  nhDonateFile = file;
  document.getElementById('nhDonateBadge').style.display = 'block';
  document.getElementById('nhDonateBadge').innerHTML = `<div class="file-badge">📁 ${file.name}<button onclick="nhDonateFile=null;document.getElementById('nhDonateBadge').style.display='none';document.getElementById('nhDonateZone').style.display='block'">✕</button></div>`;
  document.getElementById('nhDonateZone').style.display = 'none';
}
function donateNotes() {
  const board = document.getElementById('nhDonateBoard').value; const subject = document.getElementById('nhDonateSubject').value; const topic = document.getElementById('nhDonateTopic').value.trim();
  if (!board || !subject || !topic) { alert('Please fill in all fields!'); return; }
  if (!nhDonateFile) { alert('Please upload your notes file!'); return; }
  const note = { id: Date.now(), board, subject, topic, fileName: nhDonateFile.name, uploader: 'Anonymous', date: new Date().toLocaleDateString('en-GB'), downloads: 0 };
  communityNotes.unshift(note); localStorage.setItem('ss_communityNotes', JSON.stringify(communityNotes));
  nhDonateFile = null; document.getElementById('nhDonateBadge').style.display = 'none'; document.getElementById('nhDonateZone').style.display = 'block';
  document.getElementById('nhDonateBoard').value = ''; document.getElementById('nhDonateSubject').value = ''; document.getElementById('nhDonateTopic').value = '';
  addPoints(50, `Donated notes: ${subject} — ${topic}`); renderCommunityNotes(); alert('🎉 Notes donated! You earned 50 ⭐ points!');
}
function renderCommunityNotes() {
  const list = document.getElementById('nhCommunityList');
  if (!communityNotes.length) { list.innerHTML = '<div class="pp-empty">No community notes yet — be the first to donate! 💝</div>'; return; }
  list.innerHTML = communityNotes.map(n => `
    <div class="pp-paper-item">
      <div class="pp-paper-info"><div class="pp-paper-title">📁 ${n.subject} — ${n.topic}</div><div class="pp-paper-meta">${n.board.replace('_',' ')} · by ${n.uploader} · ${n.date} · ${n.downloads} downloads</div></div>
      <div class="pp-paper-links"><button class="pp-link-btn" onclick="downloadCommunityNote(${n.id})">Download ↓</button></div>
    </div>`).join('');
}
function downloadCommunityNote(id) {
  const note = communityNotes.find(n => n.id === id); if (!note) return;
  note.downloads++; localStorage.setItem('ss_communityNotes', JSON.stringify(communityNotes));
  renderCommunityNotes(); addPoints(2, `Downloaded: ${note.subject}`); alert(`📁 "${note.fileName}" would download here in a live app.\n\n+2 ⭐ points!`);
}

