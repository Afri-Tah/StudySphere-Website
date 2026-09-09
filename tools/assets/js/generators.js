// ══ 4. FREE ONLINE GENERATORS ══
const GENERATORS = [
  { icon:'⚡', name:'Quizlet', desc:'Create free flashcard sets, practice tests & matching games. Millions of free sets available.', url:'https://quizlet.com', tags:['FREE','Flashcards','Quizzes'], cat:'revision' },
  { icon:'🎴', name:'Anki Web', desc:'Powerful spaced repetition flashcard system. Free, science-backed memory tool.', url:'https://ankiweb.net', tags:['FREE','Flashcards'], cat:'revision' },
  { icon:'🧠', name:'Kahoot!', desc:'Create fun quiz games for class. Free for students. Teachers can host live games.', url:'https://kahoot.com', tags:['FREEMIUM','Quiz'], cat:'generator' },
  { icon:'📊', name:'Mentimeter', desc:'Interactive quizzes, polls & word clouds for classroom engagement. Free plan available.', url:'https://mentimeter.com', tags:['FREEMIUM','Quiz','Poll'], cat:'generator' },
  { icon:'🗺️', name:'Coggle', desc:'Beautiful, free mind maps & flow charts. Unlimited free maps for students.', url:'https://coggle.it', tags:['FREE','Mind Map'], cat:'generator' },
  { icon:'🌳', name:'MindMeister', desc:'Create and share mind maps online. Great for brainstorming and topic overviews.', url:'https://mindmeister.com', tags:['FREEMIUM','Mind Map'], cat:'generator' },
  { icon:'🎯', name:'Typeform', desc:'Create engaging quizzes and forms. Free plan includes unlimited questions.', url:'https://typeform.com', tags:['FREEMIUM','Quiz','Form'], cat:'generator' },
  { icon:'📋', name:'Google Forms', desc:'Completely free quiz and form maker from Google. Auto-marking included.', url:'https://forms.google.com', tags:['FREE','Quiz','Form'], cat:'generator' },
  { icon:'🖼️', name:'Canva', desc:'Design posters, infographics & revision cards. Free education plan available.', url:'https://canva.com/education', tags:['FREE','Design','Cards'], cat:'generator' },
  { icon:'🔠', name:'Flippity', desc:'Turn Google Sheets into flashcards, quizzes & bingo cards. 100% free.', url:'https://flippity.net', tags:['FREE','Flashcards','Quiz'], cat:'generator' },
  { icon:'🎲', name:'Gimkit', desc:'Student-favourite quiz game with earning mechanics. Free plan available.', url:'https://gimkit.com', tags:['FREEMIUM','Quiz','Game'], cat:'generator' },
  { icon:'📝', name:'Socrative', desc:'Free student quiz tool with real-time results and space race feature.', url:'https://socrative.com', tags:['FREEMIUM','Quiz'], cat:'generator' },
  { icon:'🔄', name:'StudyBlue', desc:'Create flashcards and practice quizzes. Access shared sets from other students.', url:'https://www.studyblue.com', tags:['FREEMIUM','Flashcards'], cat:'revision' },
  { icon:'🏆', name:'Quizizz', desc:'Self-paced quiz games with memes and music. Free for both teachers and students.', url:'https://quizizz.com', tags:['FREE','Quiz','Game'], cat:'generator' },
  { icon:'📌', name:'Padlet', desc:'Digital board for brainstorming, group projects & collaborative revision.', url:'https://padlet.com', tags:['FREEMIUM','Collaborate'], cat:'generator' },
  { icon:'🔗', name:'Miro', desc:'Free collaborative whiteboard — great for mind maps, diagrams and group work.', url:'https://miro.com', tags:['FREEMIUM','Whiteboard','Mind Map'], cat:'generator' },
];

function renderGenerators() {
  document.getElementById('generatorsGrid').innerHTML = GENERATORS.map(g => {
    const tagHtml = g.tags.map(t => {
      const cls = t === 'FREE' ? 'tag-free' : t === 'FREEMIUM' ? 'tag-freemium' : t === 'PAID' ? 'tag-paid' : '';
      return `<span class="resource-free-tag ${cls}">${t}</span>`;
    }).join('');
    return `<div class="gen-card">
      <span class="gen-icon">${g.icon}</span>
      <div class="gen-name">${g.name}</div>
      <div class="gen-tags">${tagHtml}</div>
      <div class="gen-desc">${g.desc}</div>
      <a href="${g.url}" target="_blank"><button class="btn btn-outline btn-sm" style="width:100%;margin-top:0">Open ↗</button></a>
    </div>`;
  }).join('');
}
renderGenerators();

