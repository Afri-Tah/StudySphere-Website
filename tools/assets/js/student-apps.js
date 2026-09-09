// ══ 16. STUDENT APPS ══
var STUDENT_APPS = [
  { name: 'Notion', icon: '📓', cat: 'productivity', desc: 'All-in-one workspace for notes, tasks, and revision calendars.', url: 'https://notion.so/students', cost: 'free' },
  { name: 'Google Calendar', icon: '📅', cat: 'productivity', desc: 'Plan your study schedule, set exam reminders, and share timetables.', url: 'https://calendar.google.com', cost: 'free' },
  { name: 'Todoist', icon: '✅', cat: 'productivity', desc: 'Smart task manager to track assignments and revision tasks.', url: 'https://todoist.com', cost: 'freemium' },
  { name: 'Trello', icon: '🗂️', cat: 'productivity', desc: 'Visual boards for organising revision topics and tracking progress.', url: 'https://trello.com', cost: 'freemium' },
  { name: 'Google Keep', icon: '🟡', cat: 'notes', desc: 'Quick notes, checklists and reminders — completely free from Google.', url: 'https://keep.google.com', cost: 'free' },
  { name: 'OneNote', icon: '🔵', cat: 'notes', desc: 'Microsoft free note-taking app — great for organising by subject.', url: 'https://onenote.com', cost: 'free' },
  { name: 'Obsidian', icon: '💎', cat: 'notes', desc: 'Powerful linked notes app — great for connecting concepts.', url: 'https://obsidian.md', cost: 'free' },
  { name: 'Notability', icon: '✏️', cat: 'notes', desc: 'Handwriting + typing notes app — perfect for iPad study sessions.', url: 'https://notability.com', cost: 'paid' },
  { name: 'Forest', icon: '🌳', cat: 'focus', desc: 'Stay focused by growing a virtual forest. Block distracting apps while studying.', url: 'https://www.forestapp.cc', cost: 'freemium' },
  { name: 'Cold Turkey', icon: '🦃', cat: 'focus', desc: 'Block distracting websites during study sessions — very effective.', url: 'https://getcoldturkey.com', cost: 'freemium' },
  { name: 'Focusmate', icon: '👥', cat: 'focus', desc: 'Study with a virtual partner — body doubling boosts productivity.', url: 'https://focusmate.com', cost: 'freemium' },
  { name: 'Lofi.cafe', icon: '🎵', cat: 'focus', desc: 'Free lofi music streams for focused studying — no account needed.', url: 'https://lofi.cafe', cost: 'free' },
  { name: 'Anki', icon: '🃏', cat: 'revision', desc: 'Spaced repetition flashcards — the most effective way to memorise content. Free desktop app.', url: 'https://apps.ankiweb.net', cost: 'free' },
  { name: 'Quizlet', icon: '⚡', cat: 'revision', desc: 'Create flashcards, practice tests, and play learning games.', url: 'https://quizlet.com', cost: 'freemium' },
  { name: 'SaveMyExams', icon: '📗', cat: 'revision', desc: 'Topic-by-topic questions and model answers for Cambridge & Edexcel.', url: 'https://savemyexams.com', cost: 'freemium' },
  { name: 'Khan Academy', icon: '🎓', cat: 'revision', desc: 'Free video lessons and practice exercises for Maths, Sciences, and more.', url: 'https://khanacademy.org', cost: 'free' },
  { name: 'ZNotes', icon: '📘', cat: 'revision', desc: 'Free condensed revision notes for all Cambridge IGCSE & A Level subjects.', url: 'https://znotes.org', cost: 'free' },
  { name: 'Seneca Learning', icon: '🦉', cat: 'revision', desc: 'Free AI-powered revision for IGCSE — smart memory system included.', url: 'https://senecalearning.com', cost: 'free' },
  { name: 'Claude (Anthropic)', icon: '🤖', cat: 'ai', desc: 'Advanced AI assistant — explain concepts, summarise notes, check essays.', url: 'https://claude.ai', cost: 'freemium' },
  { name: 'ChatGPT', icon: '💬', cat: 'ai', desc: 'AI chatbot for explaining topics, brainstorming, and essay help.', url: 'https://chat.openai.com', cost: 'freemium' },
  { name: 'Gemini', icon: '✨', cat: 'ai', desc: 'Google AI — great for research, summarising content, and explanations.', url: 'https://gemini.google.com', cost: 'free' },
  { name: 'Wolfram Alpha', icon: '🔬', cat: 'ai', desc: 'Computational intelligence — solve equations, get step-by-step maths.', url: 'https://wolframalpha.com', cost: 'freemium' },
  { name: 'Perplexity AI', icon: '🔍', cat: 'ai', desc: 'AI-powered search — get cited answers for research and fact-checking.', url: 'https://perplexity.ai', cost: 'freemium' },
  { name: 'Desmos', icon: '📈', cat: 'math', desc: 'Free graphing calculator — plot functions and explore graphs visually.', url: 'https://desmos.com', cost: 'free' },
  { name: 'GeoGebra', icon: '📐', cat: 'math', desc: 'Free interactive maths — geometry, algebra, statistics and calculus.', url: 'https://geogebra.org', cost: 'free' },
  { name: 'Photomath', icon: '📷', cat: 'math', desc: 'Scan a maths problem — get step-by-step solutions instantly.', url: 'https://photomath.com', cost: 'freemium' },
  { name: 'Mathway', icon: '🧮', cat: 'math', desc: 'Solve any maths problem — algebra, calculus, trigonometry and more.', url: 'https://mathway.com', cost: 'freemium' },
  { name: 'Phet Simulations', icon: '🔭', cat: 'science', desc: 'Free interactive science simulations from University of Colorado. Great for Physics & Chemistry.', url: 'https://phet.colorado.edu', cost: 'free' },
  { name: 'Chemguide', icon: '⚗️', cat: 'science', desc: 'Free, detailed Chemistry notes and explanations for A Level.', url: 'https://chemguide.co.uk', cost: 'free' },
  { name: 'Biology Corner', icon: '🦠', cat: 'science', desc: 'Free biology worksheets, diagrams and practice resources.', url: 'https://biologycorner.com', cost: 'free' },
  { name: 'BBC Learning', icon: '🎬', cat: 'science', desc: 'Free video clips and resources for science and humanities subjects.', url: 'https://bbc.co.uk/bitesize', cost: 'free' },
  { name: 'Grammarly', icon: '✍️', cat: 'writing', desc: 'AI grammar and spell checker — essential for English essays.', url: 'https://grammarly.com', cost: 'freemium' },
  { name: 'Hemingway Editor', icon: '📝', cat: 'writing', desc: 'Highlights complex sentences and passive voice to improve clarity.', url: 'https://hemingwayapp.com', cost: 'free' },
  { name: 'Google Docs', icon: '📄', cat: 'writing', desc: 'Free cloud word processor — collaborate and save automatically.', url: 'https://docs.google.com', cost: 'free' },
  { name: 'Quillbot', icon: '🪶', cat: 'writing', desc: 'AI paraphrasing and summarising tool to improve your writing.', url: 'https://quillbot.com', cost: 'freemium' },
  { name: 'Duolingo', icon: '🦜', cat: 'language', desc: 'Free language learning app with gamified lessons — great for foreign language subjects.', url: 'https://duolingo.com', cost: 'free' },
  { name: 'Cambridge Dictionary', icon: '📖', cat: 'language', desc: 'Free online dictionary and thesaurus — essential for English.', url: 'https://dictionary.cambridge.org', cost: 'free' },
  { name: 'Lingua.com', icon: '🗣️', cat: 'language', desc: 'Free reading comprehension passages for English practice.', url: 'https://lingua.com', cost: 'free' },
];

function renderStudentApps(cat) {
  const filtered = cat === 'all' ? STUDENT_APPS : STUDENT_APPS.filter(a => a.cat === cat);
  document.getElementById('studentAppGrid').innerHTML = filtered.map(a => {
    const costCls = a.cost === 'free' ? 'tag-free' : a.cost === 'freemium' ? 'tag-freemium' : 'tag-paid';
    const costLabel = a.cost === 'free' ? 'FREE' : a.cost === 'freemium' ? 'FREEMIUM' : 'PAID';
    return `<div class="app-card">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="app-icon">${a.icon}</div>
        <div>
          <div class="app-name">${a.name}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">
            <span class="app-cat ${a.cat}">${a.cat.charAt(0).toUpperCase()+a.cat.slice(1)}</span>
            <span class="resource-free-tag ${costCls}">${costLabel}</span>
          </div>
        </div>
      </div>
      <div class="app-desc">${a.desc}</div>
      <a href="${a.url}" target="_blank"><button class="btn btn-sm btn-outline" style="margin-top:6px;width:100%">Open ↗</button></a>
    </div>`;
  }).join('');
}
function filterStudentApps(btn, cat) {
  document.querySelectorAll('#appCatTabs .pp-filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderStudentApps(cat);
}
renderStudentApps('all');

