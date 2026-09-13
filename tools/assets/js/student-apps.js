// ══ 16. STUDENT APPS ══
// icon = emoji fallback (always works). slug = dashboardicons.com CDN name — real
// brand logos are tried first (icons.svg via jsDelivr); if a slug doesn't exist
// there (many niche edu sites won't), it silently falls back to the emoji, so
// nothing ever shows a broken image.
var STUDENT_APPS = [
  { name: 'Notion', icon:'<i class=\'ti ti-notebook\'></i>', slug: 'notion', cat: 'productivity', desc: 'All-in-one workspace for notes, tasks, and revision calendars.', url: 'https://notion.so/students', cost: 'free' },
  { name: 'Google Calendar', icon:'<i class=\'ti ti-calendar\'></i>', slug: 'google-calendar', cat: 'productivity', desc: 'Plan your study schedule, set exam reminders, and share timetables.', url: 'https://calendar.google.com', cost: 'free' },
  { name: 'Todoist', icon:'<i class=\'ti ti-circle-check\'></i>', slug: 'todoist', cat: 'productivity', desc: 'Smart task manager to track assignments and revision tasks.', url: 'https://todoist.com', cost: 'freemium' },
  { name: 'Trello', icon:'<i class=\'ti ti-folder\'></i>', slug: 'trello', cat: 'productivity', desc: 'Visual boards for organising revision topics and tracking progress.', url: 'https://trello.com', cost: 'freemium' },
  { name: 'My Study Life', icon:'<i class=\'ti ti-calendar\'></i>', slug: 'my-study-life', cat: 'productivity', desc: 'Free, ad-free planner built for students — classes, assignments, exams and revision tasks in one place.', url: 'https://mystudylife.com', cost: 'free' },
  { name: 'Google Keep', icon:'<i class=\'ti ti-circle-filled\'></i>', slug: 'google-keep', cat: 'notes', desc: 'Quick notes, checklists and reminders — completely free from Google.', url: 'https://keep.google.com', cost: 'free' },
  { name: 'OneNote', icon:'<i class=\'ti ti-circle-filled\'></i>', slug: 'onenote', cat: 'notes', desc: 'Microsoft free note-taking app — great for organising by subject.', url: 'https://onenote.com', cost: 'free' },
  { name: 'Obsidian', icon:'<i class=\'ti ti-diamond\'></i>', slug: 'obsidian', cat: 'notes', desc: 'Powerful linked notes app — great for connecting concepts across a whole semester.', url: 'https://obsidian.md', cost: 'free' },
  { name: 'Notability', icon:'<i class=\'ti ti-pencil\'></i>', slug: 'notability', cat: 'notes', desc: 'Handwriting + typing notes app — perfect for iPad study sessions.', url: 'https://notability.com', cost: 'paid' },
  { name: 'GoodNotes', icon:'<i class=\'ti ti-notebook\'></i>', slug: 'goodnotes', cat: 'notes', desc: 'Handwriting notes and PDF annotation for iPad — research shows handwritten notes aid retention over typing.', url: 'https://goodnotes.com', cost: 'paid' },
  { name: 'Forest', icon:'<i class=\'ti ti-tree\'></i>', slug: 'forest', cat: 'focus', desc: 'Stay focused by growing a virtual forest — leave the app and your tree dies.', url: 'https://www.forestapp.cc', cost: 'freemium' },
  { name: 'Cold Turkey', icon:'<i class=\'ti ti-lock\'></i>', slug: 'cold-turkey', cat: 'focus', desc: 'Blocks distracting sites and apps at the system level during study sessions — hard to disable once started.', url: 'https://getcoldturkey.com', cost: 'freemium' },
  { name: 'Freedom', icon:'<i class=\'ti ti-lock\'></i>', slug: 'freedom', cat: 'focus', desc: 'Block distractions across your laptop and phone at once with scheduled sessions that run automatically.', url: 'https://freedom.to', cost: 'paid' },
  { name: 'Focusmate', icon:'<i class=\'ti ti-users\'></i>', slug: 'focusmate', cat: 'focus', desc: 'Study with a virtual partner — body doubling boosts productivity.', url: 'https://focusmate.com', cost: 'freemium' },
  { name: 'Lofi.cafe', icon:'<i class=\'ti ti-music\'></i>', slug: 'lofi-cafe', cat: 'focus', desc: 'Free lofi music streams for focused studying — no account needed.', url: 'https://lofi.cafe', cost: 'free' },
  { name: 'Anki', icon:'<i class=\'ti ti-cards\'></i>', slug: 'anki', cat: 'revision', desc: 'Spaced repetition flashcards — schedules reviews right before you\'re about to forget. Free on desktop and Android.', url: 'https://apps.ankiweb.net', cost: 'free' },
  { name: 'Quizlet', icon:'<i class=\'ti ti-bolt\'></i>', slug: 'quizlet', cat: 'revision', desc: 'Create flashcards, practice tests, and play learning games — huge library of pre-made decks.', url: 'https://quizlet.com', cost: 'freemium' },
  { name: 'SaveMyExams', icon:'<i class=\'ti ti-book\'></i>', slug: 'savemyexams', cat: 'revision', desc: 'Topic-by-topic questions and model answers for Cambridge & Edexcel.', url: 'https://savemyexams.com', cost: 'freemium' },
  { name: 'Khan Academy', icon:'<i class=\'ti ti-school\'></i>', slug: 'khan-academy', cat: 'revision', desc: 'Free video lessons and practice exercises for Maths, Sciences, and more.', url: 'https://khanacademy.org', cost: 'free' },
  { name: 'ZNotes', icon:'<i class=\'ti ti-book\'></i>', slug: 'znotes', cat: 'revision', desc: 'Free condensed revision notes for all Cambridge IGCSE & A Level subjects.', url: 'https://znotes.org', cost: 'free' },
  { name: 'Seneca Learning', icon:'<i class=\'ti ti-brain\'></i>', slug: 'seneca-learning', cat: 'revision', desc: 'Free AI-powered revision for IGCSE — smart memory system included.', url: 'https://senecalearning.com', cost: 'free' },
  { name: 'Zotero', icon:'<i class=\'ti ti-paperclip\'></i>', slug: 'zotero', cat: 'research', desc: 'Free, open-source reference manager — save sources with one click and auto-generate bibliographies in any citation style.', url: 'https://zotero.org', cost: 'free' },
  { name: 'PDF Expert', icon:'<i class=\'ti ti-book\'></i>', slug: 'pdf-expert', cat: 'research', desc: 'Fast annotation and highlighting for lecture slides, textbooks and research papers.', url: 'https://pdfexpert.com', cost: 'paid' },
  { name: 'Claude (Anthropic)', icon:'<i class=\'ti ti-robot\'></i>', slug: 'claude', cat: 'ai', desc: 'Advanced AI assistant — explain concepts, summarise notes, check essays.', url: 'https://claude.ai', cost: 'freemium' },
  { name: 'ChatGPT', icon:'<i class=\'ti ti-message-circle\'></i>', slug: 'openai', cat: 'ai', desc: 'AI chatbot for explaining topics, brainstorming, and essay help.', url: 'https://chat.openai.com', cost: 'freemium' },
  { name: 'Gemini', icon:'<i class=\'ti ti-sparkles\'></i>', slug: 'gemini', cat: 'ai', desc: 'Google AI — great for research, summarising content, and explanations.', url: 'https://gemini.google.com', cost: 'free' },
  { name: 'Wolfram Alpha', icon:'<i class=\'ti ti-microscope\'></i>', slug: 'wolframalpha', cat: 'ai', desc: 'Computational intelligence — solve equations, get step-by-step maths.', url: 'https://wolframalpha.com', cost: 'freemium' },
  { name: 'Perplexity AI', icon:'<i class=\'ti ti-search\'></i>', slug: 'perplexity', cat: 'ai', desc: 'AI-powered search — get cited answers for research and fact-checking.', url: 'https://perplexity.ai', cost: 'freemium' },
  { name: 'Desmos', icon:'<i class=\'ti ti-chart-line\'></i>', slug: 'desmos', cat: 'math', desc: 'Free graphing calculator — plot functions and explore graphs visually.', url: 'https://desmos.com', cost: 'free' },
  { name: 'GeoGebra', icon:'<i class=\'ti ti-ruler-2\'></i>', slug: 'geogebra', cat: 'math', desc: 'Free interactive maths — geometry, algebra, statistics and calculus.', url: 'https://geogebra.org', cost: 'free' },
  { name: 'Photomath', icon:'<i class=\'ti ti-camera\'></i>', slug: 'photomath', cat: 'math', desc: 'Scan a maths problem — get step-by-step solutions instantly.', url: 'https://photomath.com', cost: 'freemium' },
  { name: 'Mathway', icon:'<i class=\'ti ti-calculator\'></i>', slug: 'mathway', cat: 'math', desc: 'Solve any maths problem — algebra, calculus, trigonometry and more.', url: 'https://mathway.com', cost: 'freemium' },
  { name: 'Phet Simulations', icon:'<i class=\'ti ti-telescope\'></i>', slug: 'phet', cat: 'science', desc: 'Free interactive science simulations from University of Colorado. Great for Physics & Chemistry.', url: 'https://phet.colorado.edu', cost: 'free' },
  { name: 'Chemguide', icon:'<i class=\'ti ti-flask\'></i>', cat: 'science', desc: 'Free, detailed Chemistry notes and explanations for A Level.', url: 'https://chemguide.co.uk', cost: 'free' },
  { name: 'Biology Corner', icon:'<i class=\'ti ti-virus\'></i>', cat: 'science', desc: 'Free biology worksheets, diagrams and practice resources.', url: 'https://biologycorner.com', cost: 'free' },
  { name: 'BBC Learning', icon:'<i class=\'ti ti-movie\'></i>', slug: 'bbc-iplayer', cat: 'science', desc: 'Free video clips and resources for science and humanities subjects.', url: 'https://bbc.co.uk/bitesize', cost: 'free' },
  { name: 'Grammarly', icon:'<i class=\'ti ti-pencil\'></i>', slug: 'grammarly', cat: 'writing', desc: 'AI grammar and spell checker — essential for English essays.', url: 'https://grammarly.com', cost: 'freemium' },
  { name: 'Hemingway Editor', icon:'<i class=\'ti ti-notes\'></i>', slug: 'hemingway-editor', cat: 'writing', desc: 'Highlights complex sentences and passive voice to improve clarity.', url: 'https://hemingwayapp.com', cost: 'free' },
  { name: 'Google Docs', icon:'<i class=\'ti ti-file-text\'></i>', slug: 'google-docs', cat: 'writing', desc: 'Free cloud word processor — collaborate and save automatically.', url: 'https://docs.google.com', cost: 'free' },
  { name: 'Quillbot', icon:'<i class=\'ti ti-feather\'></i>', slug: 'quillbot', cat: 'writing', desc: 'AI paraphrasing and summarising tool to improve your writing.', url: 'https://quillbot.com', cost: 'freemium' },
  { name: 'Duolingo', icon:'<i class=\'ti ti-feather\'></i>', slug: 'duolingo', cat: 'language', desc: 'Free language learning app with gamified lessons — great for foreign language subjects.', url: 'https://duolingo.com', cost: 'free' },
  { name: 'Cambridge Dictionary', icon:'<i class=\'ti ti-book\'></i>', cat: 'language', desc: 'Free online dictionary and thesaurus — essential for English.', url: 'https://dictionary.cambridge.org', cost: 'free' },
  { name: 'Lingua.com', icon:'<i class=\'ti ti-message-2\'></i>', cat: 'language', desc: 'Free reading comprehension passages for English practice.', url: 'https://lingua.com', cost: 'free' },
];

// If a dashboardicons.com logo 404s (common for niche edu-only sites), swap
// it for the plain emoji instead of leaving a broken image icon.
function handleAppIconError(imgEl) {
  const tile = imgEl.closest('.app-icon-tile');
  const icon = imgEl.dataset.icon || '';
  if (tile) tile.outerHTML = `<div class="app-icon">${icon}</div>`;
}
function appIconHTML(a) {
  if (!a.slug) return `<div class="app-icon">${a.icon}</div>`;
  return `<div class="app-icon-tile"><img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${a.slug}.svg" alt="" loading="lazy" data-icon="${a.icon}" onerror="handleAppIconError(this)"></div>`;
}

function renderStudentApps(cat) {
  const filtered = cat === 'all' ? STUDENT_APPS : STUDENT_APPS.filter(a => a.cat === cat);
  document.getElementById('studentAppGrid').innerHTML = filtered.map(a => {
    const costCls = a.cost === 'free' ? 'tag-free' : a.cost === 'freemium' ? 'tag-freemium' : 'tag-paid';
    const costLabel = a.cost === 'free' ? 'FREE' : a.cost === 'freemium' ? 'FREEMIUM' : 'PAID';
    return `<div class="app-card">
      <div style="display:flex;align-items:center;gap:10px">
        ${appIconHTML(a)}
        <div>
          <div class="app-name">${a.name}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">
            <span class="app-cat ${a.cat}">${a.cat.charAt(0).toUpperCase()+a.cat.slice(1)}</span>
            <span class="resource-free-tag ${costCls}">${costLabel}</span>
          </div>
        </div>
      </div>
      <div class="app-desc">${a.desc}</div>
      <a href="${a.url}" target="_blank" rel="noopener noreferrer"><button class="btn btn-sm btn-outline" style="margin-top:6px;width:100%">Open <i class="ti ti-external-link"></i></button></a>
    </div>`;
  }).join('');
}
function filterStudentApps(btn, cat) {
  document.querySelectorAll('#appCatTabs .pp-filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderStudentApps(cat);
}
renderStudentApps('all');
