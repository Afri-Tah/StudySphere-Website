// ══ AI STUDY TUTOR ══
// A grounded, level-aware tutor. Students can upload their own notes in almost any
// format; the WHOLE file is kept in the browser and, for every message, the tutor is
// shown the outline plus the parts of the file that matter for that message (see
// doc-tools.js). Maths is written in LaTeX and drawn properly (rich-output.js). The
// student can ask the tutor to look things up online (Wikipedia — a static site can't
// call Google), ask for diagrams, and turn the lesson into downloadable study notes.
// Runs on StudySphere's shared AI (see SS_AI_PROXY_URL in tools-common.js).

const tutStore = ssCreateDocStore();
let tutMessages = [];        // {role:'user'|'assistant', content}
let tutCtx = { level: '', subject: '', topic: '', mode: 'teach' };
let tutSessionLabel = '';
let tutLastChunks = [];      // excerpts shown on the previous turn
let tutCursor = -1;          // furthest excerpt (in reading order) shown so far
let tutBusy = false;
let tutNotesMd = '';
let tutLevelTouched = false;
const TUT_AI = { effort: 'medium', maxTokens: 3000, timeoutMs: 45000 };
const TUT_BEGIN_RX = /^Please (begin|start)/;

document.getElementById('tutLevel')?.addEventListener('change', () => { tutLevelTouched = true; });
ssMountUploader(document.getElementById('tutUploader'), tutStore, {});
document.getElementById('tutQuick')?.addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) tutSend(b.dataset.q); });

// ── Prompt ──
const TUT_MODE_RULES = {
  teach: `Teach step by step, one small idea at a time. After each idea ask ONE short question to check the student understood, then wait for their answer before moving on. If they answer wrongly, gently correct them and re-explain in a different way, then ask again. If they answer correctly, confirm briefly and move to the next idea.`,
  quiz: `This is QUIZ mode. Ask ONE exam-style question at a time based on the material, starting easy and getting harder. After the student answers, mark it (correct / partly correct / not yet), explain the right answer clearly, then ask the next question. Do not give long lessons unless the student asks.`,
  explain: `This is EXPLAIN mode. Give clear, well-organised explanations and summaries of what the student asks about. Offer to go deeper or to quiz them, and check understanding now and then (not after every message).`
};

function tutBuildSystem(grounding) {
  const { level, subject, topic, mode } = tutCtx;
  const focus = subject ? (topic ? `${subject} — specifically "${topic}"` : subject)
    : (topic ? `"${topic}"` : 'the study material they provided (work out the subject and the right difficulty from the material itself)');
  return `You are a patient, encouraging personal tutor for ${level ? 'a ' + level + ' student' : 'a student'} studying ${focus}.

HOW TO TEACH
- Use plain, simple language and short paragraphs. Many students study in a second language, so avoid jargon and briefly define any technical term you must use.
- ${TUT_MODE_RULES[mode] || TUT_MODE_RULES.teach}
- The student's very first message is only a signal to begin. They have NOT answered anything yet, so never say "good answer", "correct" or "well done" until the student has actually answered one of your questions.
- Keep each message under about 150 words unless the student asks for more or you are showing a worked solution.

ACCURACY (very important)
- Only state facts you are confident about. If you are not sure, say so. Never invent numbers, formulas, dates, quotes or page numbers.
- For any calculation: write the formula, substitute the values with their units, work step by step, and double-check the arithmetic before stating the final answer with units. When the student gives a calculated answer, recompute it yourself before saying whether it is right.
- Text taken from PDFs and photos can have broken equations or missing symbols. If something in the study material looks garbled or wrong, say so and give the correct version, clearly labelled as your correction.

MATHS AND SYMBOLS
- Write ALL maths in LaTeX: inline between single dollar signs, display equations between double dollar signs. Examples: $x^2$, $\\frac{a}{b}$, $\\sqrt{b^2-4ac}$, $v=\\frac{\\Delta s}{\\Delta t}$, $\\theta = 30^{\\circ}$, $9.8\\ \\text{m/s}^2$, $\\text{H}_2\\text{O}$, $\\text{CO}_2$, $\\Delta H$, $\\pi r^2$.
- Never write plain-text maths such as x^2, sqrt(x), 1/2 or H2O. Never use a dollar sign for money — write currency as a code, for example BDT 500.

DIAGRAMS
- When a process, cycle, sequence or classification is clearer as a picture, include ONE diagram in that message as a Mermaid flowchart in a fenced code block labelled mermaid. Use "flowchart TD", node labels in double quotes like A["Label"], and arrows written -->.
- For a labelled textbook-style picture (a cell, a circuit, a plant, an apparatus), finish that message with one last line exactly like: DIAGRAM_SEARCH: followed by 2-4 keywords. Only do this when it genuinely helps.

FORMAT
- Light Markdown only: short bullet lists, **bold** for key terms, a small table when comparing. No headings, no horizontal rules.

${grounding}`;
}

function tutGroundingFor(excerpts, upcoming, web) {
  const parts = [];
  if (tutStore.count()) {
    const names = tutStore.docs().map(d => `${d.name} (${d.chars.toLocaleString()} characters)`).join('; ');
    parts.push(`STUDY MATERIAL
The student uploaded: ${names}. The whole material is searchable, but you only see part of it at a time: an outline, then the excerpts that matter for the student's latest message.
- Teach from this material and stay faithful to it. If the student asks about something it does not cover, say so plainly rather than guessing.
- Only bring in outside information when the student asks you to go beyond their notes; then label it clearly with "Beyond your notes:".

--- OUTLINE OF THE MATERIAL ---
${tutStore.outline()}
--- EXCERPTS FOR THIS MESSAGE ---
${excerpts.map(c => `[${c.doc} · ${c.label}]\n${c.text}`).join('\n\n') || '(nothing matched — tell the student you could not find this in their notes)'}
${upcoming.length ? `--- WHAT COMES NEXT IN THE MATERIAL (use when moving on) ---\n${upcoming.map(c => `[${c.label}]\n${c.text}`).join('\n\n')}\n` : ''}--- END ---`);
  } else {
    parts.push(`There is no uploaded material, so you are teaching from general knowledge. Be upfront when you are unsure instead of inventing facts, and encourage the student to confirm important details against their textbook or teacher.`);
  }
  if (web.length) {
    parts.push(`WEB RESULTS (from Wikipedia — included only because the student asked you to go beyond their notes)
Use them to add helpful extra information. Begin such parts with "From the web:" and name the page title. Do not invent links; the page links are shown to the student separately. If the results do not answer the question, say so.
${web.map(w => `[${w.title}]\n${w.text}`).join('\n\n')}`);
  }
  return parts.join('\n\n');
}

// ── Choosing what the tutor sees this turn ──
function tutPickExcerpts(userText, kickoff) {
  if (!tutStore.count()) return { now: [], next: [] };
  const words = userText.trim().split(/\s+/).length;
  const nextish = /^(next|continue|go on|ok|okay|yes|got it|done|sure|ready|move on|understood)\b/i.test(userText.trim());
  const lastTutor = ([...tutMessages].reverse().find(m => m.role === 'assistant') || {}).content || '';
  let now = [];
  if (kickoff) {
    const focus = [tutCtx.topic, tutCtx.subject].filter(Boolean).join(' ');
    now = focus ? tutStore.retrieve(focus, { k: 3, budget: 4500 }) : [];
    if (!now.length) now = tutStore.sequence(0, 4000);
  } else if (nextish) {
    now = tutStore.sequence(tutCursor + 1, 4000);
    if (!now.length) now = tutLastChunks;
  } else {
    now = tutStore.retrieve(userText + (words < 8 ? ' ' + lastTutor.slice(0, 400) : ''), { k: 5, budget: 6000 });
    if (words < 8) { const seen = new Set(now.map(c => c.i)); tutLastChunks.forEach(c => { if (!seen.has(c.i)) now.push(c); }); now.sort((a, b) => a.i - b.i); }
    if (!now.length) now = tutLastChunks.length ? tutLastChunks : tutStore.sequence(Math.max(0, tutCursor), 3500);
  }
  const maxI = now.reduce((m, c) => Math.max(m, c.i), -1);
  const next = tutStore.sequence(maxI + 1, 1800).slice(0, 2);
  tutLastChunks = now; if (maxI > tutCursor || kickoff) tutCursor = maxI;
  return { now, next };
}

const TUT_WEB_RX = /\b(look (it |this |that |these )?up|search( for| online| the web)?|google|online|internet|the web|wikipedia|beyond (my |the )?notes|outside (my |the )?notes|more (info|information|details?) (about|on)|extra (info|information))\b/i;
function tutWebQuery(userText) {
  const cleaned = userText.replace(TUT_WEB_RX, ' ').replace(/\b(please|can you|could you|add|and|some|extra|more|information|info|about|on|for|me|to|my|notes|the|a|this|that|it)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.split(' ').length >= 2) return cleaned;
  const lastTutor = ([...tutMessages].reverse().find(m => m.role === 'assistant') || {}).content || '';
  const bold = (lastTutor.match(/\*\*([^*]{3,40})\*\*/) || [])[1];
  return [tutCtx.topic || tutCtx.subject, bold || cleaned].filter(Boolean).join(' ');
}

// ── Rendering ──
function tutEl(cls) {
  const div = document.createElement('div');
  div.className = 'tutor-msg ' + cls; document.getElementById('tutorLog').appendChild(div); return div;
}
function tutScroll() { const log = document.getElementById('tutorLog'); log.scrollTop = log.scrollHeight; }
function tutRenderStudent(text) { tutEl('student').textContent = text; tutScroll(); }
function tutRenderSystemNote(text) { tutEl('system-note').textContent = text; tutScroll(); }
function tutShowTyping(show, label) {
  let el = document.getElementById('tutTyping');
  if (show) {
    if (!el) { el = document.createElement('div'); el.id = 'tutTyping'; el.className = 'tutor-typing'; document.getElementById('tutorLog').appendChild(el); }
    el.innerHTML = `<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> ${label || 'Tutor is thinking…'}`; tutScroll();
  } else if (el) el.remove();
}
async function tutRenderTutor(rawText, sources) {
  const { body, query } = ssSplitDiagramQuery(rawText);
  const div = tutEl('tutor');
  const content = document.createElement('div'); content.className = 'tutor-msg-body ss-rich rich';
  content.innerHTML = ssSimpleMarkdown(body);        // readable straight away
  div.appendChild(content); tutScroll();
  await ssRenderRich(content, body, { breaks: true });
  if (sources && sources.length) {
    const s = document.createElement('p'); s.className = 'tutor-sources';
    s.innerHTML = '<i class="ti ti-world"></i> From the web (Wikipedia): ' + sources.map(w => `<a href="${ssEscapeHTML(w.url)}" target="_blank" rel="noopener noreferrer">${ssEscapeHTML(w.title)}</a>`).join(' · ');
    content.appendChild(s);
  }
  const figs = document.createElement('div'); figs.className = 'ss-rich tutor-figs'; div.appendChild(figs);
  const actions = document.createElement('div'); actions.className = 'tutor-msg-actions'; actions.setAttribute('data-nodl', '1');
  const mk = (icon, label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<i class="ti ${icon}"></i> ${label}`; b.addEventListener('click', () => fn(b)); actions.appendChild(b); };
  mk('ti-photo', 'Show diagram', async (b) => {
    b.disabled = true;
    const q = query || [tutCtx.topic, tutCtx.subject].filter(Boolean).join(' ') || (body.match(/\*\*([^*]{3,40})\*\*/) || [])[1] || 'study diagram';
    const n = await ssShowDiagrams(figs, q);
    if (!n) figs.innerHTML = '<p class="ss-fig-note">No matching diagram found. Try “Draw a diagram” and the tutor will sketch one.</p>';
    b.disabled = false; tutScroll();
  });
  mk('ti-checks', 'Double-check', () => tutSend('Please double-check your last message: independently redo every calculation and verify each fact. If you find a mistake, correct it clearly; if everything is right, say so briefly.', 'Double-check that, please'));
  mk('ti-copy', 'Copy', async (b) => { try { await navigator.clipboard.writeText(body); b.innerHTML = '<i class="ti ti-check"></i> Copied'; setTimeout(() => { b.innerHTML = '<i class="ti ti-copy"></i> Copy'; }, 1500); } catch (e) {} });
  div.appendChild(actions);
  if (query) ssShowDiagrams(figs, query).then(() => tutScroll());   // the tutor asked for a labelled picture
  tutScroll();
}

function tutSetLoading(on) {
  tutBusy = on;
  ['tutSendBtn', 'tutStartBtn', 'tutNotesBtn'].forEach(id => { const b = document.getElementById(id); if (b) b.disabled = on; });
  document.querySelectorAll('#tutQuick button').forEach(b => { b.disabled = on; });
}

// ── One AI turn ──
async function tutAsk(userContent, opts) {
  opts = opts || {};
  const { now, next } = tutPickExcerpts(userContent, !!opts.kickoff);
  let web = [];
  if (!opts.kickoff && TUT_WEB_RX.test(userContent)) {
    tutShowTyping(true, 'Looking this up online…');
    web = await ssWebLookup(tutWebQuery(userContent), 3);
    if (!web.length) tutRenderSystemNote('Couldn’t find extra information online for that — the tutor will say what it can.');
  }
  const system = tutBuildSystem(tutGroundingFor(now, next, web));
  tutMessages.push({ role: 'user', content: userContent });
  const hist = tutMessages.slice(-14); while (hist.length && hist[0].role !== 'user') hist.shift();
  tutShowTyping(true);
  const result = await ssAIChat(system, hist, name => tutShowTyping(true, `Asking ${name}…`), TUT_AI);
  tutShowTyping(false);
  if (result) {
    tutMessages.push({ role: 'assistant', content: result.text });
    await tutRenderTutor(result.text, web);
    return true;
  }
  tutMessages.pop();
  return false;
}

async function tutStartSession() {
  const notice = document.getElementById('tutNoKeyNotice');
  if (!ssHasAnyAIPath()) { notice.style.display = 'block'; return; }
  notice.style.display = 'none';
  const hasNotes = tutStore.count() > 0;
  const subject = document.getElementById('tutSubject').value.trim();
  const topic = document.getElementById('tutTopic').value.trim();
  if (!subject && !topic && !hasNotes) { alert('Upload your notes, or type a subject or topic, so the tutor knows what to teach.'); return; }
  tutCtx = {
    level: hasNotes && !tutLevelTouched ? '' : document.getElementById('tutLevel').value,
    subject, topic, mode: (document.querySelector('input[name="tutMode"]:checked') || {}).value || 'teach'
  };
  tutMessages = []; tutLastChunks = []; tutCursor = -1; tutNotesMd = '';
  tutSessionLabel = subject ? (topic ? `${subject} — ${topic}` : subject) : (topic || (hasNotes ? tutStore.docs().map(d => d.name).slice(0, 2).join(', ') : 'Study session'));
  document.getElementById('tutSessionLabel').textContent = tutCtx.level ? `${tutSessionLabel} · ${tutCtx.level}` : tutSessionLabel;
  document.getElementById('tutorSetupCard').style.display = 'none';
  document.getElementById('tutorChatCard').style.display = 'block';
  document.getElementById('tutorChat').style.display = 'flex';
  document.getElementById('tutorLog').innerHTML = '';
  document.getElementById('tutNotesPanel').style.display = 'none';
  tutMountTranscriptMenu();
  if (hasNotes) tutRenderSystemNote(`Teaching from your notes: ${tutStore.docs().length} file${tutStore.docs().length > 1 ? 's' : ''}, ${tutStore.totalChars().toLocaleString()} characters — all of it is available. Ask me to “look it up online” any time you want extra information beyond your notes (from Wikipedia).`);
  else tutRenderSystemNote('No notes uploaded — teaching from general knowledge. Double-check key facts with your textbook or teacher.');
  addPoints(5, `Started tutoring: ${tutSessionLabel}`);

  tutSetLoading(true);
  const kick = tutCtx.mode === 'quiz'
    ? 'Please begin the quiz now. (I have not answered anything yet.) Ask your first, easier question.'
    : (hasNotes && !subject && !topic)
      ? 'Please begin the session now. (I have not answered anything yet.) In one or two sentences say what my notes are about, then teach the first small idea from them and ask your first check question.'
      : 'Please begin the session now. (I have not answered anything yet.) Give a short, friendly introduction to the topic, then teach the first small idea and ask your first check question.';
  const ok = await tutAsk(kick, { kickoff: true });
  tutSetLoading(false);
  if (!ok) tutRenderSystemNote('Couldn’t reach the AI tutor right now — please try again in a few minutes.');
}

function tutHandleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); tutSend(); } }

async function tutSend(textOverride, label) {
  if (tutBusy) return;
  const input = document.getElementById('tutInput');
  const text = (textOverride || input.value).trim();
  if (!text) return;
  if (!textOverride) input.value = '';
  tutRenderStudent(label || text);
  tutSetLoading(true);
  const ok = await tutAsk(text);
  tutSetLoading(false);
  if (ok) addPoints(2, `Tutoring exchange: ${tutSessionLabel}`);
  else tutRenderSystemNote('Couldn’t reach the AI tutor right now — please try again in a moment.');
}

function tutRestart() {
  tutMessages = []; tutLastChunks = []; tutCursor = -1;
  document.getElementById('tutorChatCard').style.display = 'none';
  document.getElementById('tutorSetupCard').style.display = 'block';
  document.getElementById('tutNoKeyNotice').style.display = 'none';
}

// ── Chat download (transcript) ──
function tutTranscriptRoot() {
  const root = document.createElement('div');
  document.querySelectorAll('#tutorLog .tutor-msg').forEach(m => {
    if (m.classList.contains('system-note')) return;
    const h = document.createElement('h3'); h.textContent = m.classList.contains('student') ? 'You' : 'Tutor'; root.appendChild(h);
    if (m.classList.contains('student')) { const p = document.createElement('p'); p.textContent = m.textContent; root.appendChild(p); }
    else { const d = document.createElement('div'); d.innerHTML = m.querySelector('.tutor-msg-body') ? m.querySelector('.tutor-msg-body').innerHTML : m.innerHTML; root.appendChild(d); }
  });
  return root;
}
function tutMountTranscriptMenu() {
  const bar = document.getElementById('tutBarBtns');
  bar.querySelectorAll('.ss-dl').forEach(n => n.remove());
  const menu = ssMakeDownloadMenu({
    title: () => 'Tutoring session — ' + tutSessionLabel,
    getRoot: tutTranscriptRoot,
    getMarkdown: () => tutMessages.filter(m => !TUT_BEGIN_RX.test(m.content)).map(m => (m.role === 'user' ? '**You:** ' : '**Tutor:** ') + ssSplitDiagramQuery(m.content).body).join('\n\n---\n\n')
  });
  const b = menu.querySelector('.ss-dl-btn');
  b.className = 'btn btn-outline btn-sm ss-dl-btn';
  b.innerHTML = '<i class="ti ti-download"></i> Download chat <i class="ti ti-chevron-down"></i>';
  bar.insertBefore(menu, bar.firstChild);
}

// ── Study notes made from the lesson ──
function tutNotesExportRoot() {
  const r = document.createElement('div');
  r.appendChild(document.getElementById('tutNotesBody').cloneNode(true));
  const f = document.getElementById('tutNotesFigs'); if (f && f.children.length) r.appendChild(f.cloneNode(true));
  return r;
}
async function tutMakeNotes() {
  if (tutBusy) return;
  if (!tutMessages.some(m => m.role === 'assistant')) { alert('Have a little lesson first, then I can turn it into notes.'); return; }
  const panel = document.getElementById('tutNotesPanel');
  panel.style.display = 'block';
  panel.innerHTML = '<p class="ss-fig-loading"><i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Writing your study notes…</p>';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  tutSetLoading(true);
  const lesson = tutMessages.filter(m => m.role === 'assistant').map(m => ssSplitDiagramQuery(m.content).body).join('\n\n').slice(-9000);
  const asked = tutMessages.filter(m => m.role === 'user' && !TUT_BEGIN_RX.test(m.content)).map(m => '- ' + m.content.slice(0, 160)).slice(-12).join('\n');
  const material = tutStore.count() ? '\n\nOutline of the student’s own notes:\n' + tutStore.outline() : '';
  const system = `You write clear, accurate revision notes for ${tutCtx.level || 'a student'}. Use GitHub-flavoured Markdown. Base the notes ONLY on the lesson below (and the outline if given) — do not add new facts. Structure: a "## " heading per idea covered, short bullet points with key terms in **bold**, a "## Key formulae" section ONLY if formulae were covered, "## Worked example" ONLY if one was shown, "## Quick recall" with 5 short bullets, and "## Practice questions" with 3 short questions (no answers).
Write ALL maths in LaTeX ($...$ inline, $$...$$ display; chemical formulae like $\\text{H}_2\\text{O}$). Never use a dollar sign for money. If a process or sequence was taught, include one Mermaid flowchart (flowchart TD, labels in double quotes like A["Label"], arrows -->) in a fenced block labelled mermaid. No emojis, no horizontal rules. Your last line must be exactly: DIAGRAM_SEARCH: followed by 2-4 keywords for a textbook diagram of the topic.`;
  const prompt = `Topic: ${tutSessionLabel}\n\nWhat the student asked or answered:\n${asked || '(nothing yet)'}\n\nWhat the tutor taught:\n${lesson}${material}\n\nWrite the study notes now.`;
  const result = await ssAIComplete(system, prompt, null, { effort: 'medium', maxTokens: 3500, timeoutMs: 45000 });
  tutSetLoading(false);
  if (!result) { panel.innerHTML = '<p class="ss-fig-note">Couldn’t make the notes right now — please try again in a moment.</p>'; return; }
  const { body, query } = ssSplitDiagramQuery(result.text); tutNotesMd = body;
  panel.innerHTML = `<div class="tut-notes-head"><h3><i class="ti ti-notes"></i> Study notes — ${ssEscapeHTML(tutSessionLabel)}</h3><span id="tutNotesDl"></span></div>
    <p class="tut-notes-sub">Made from this lesson. Check key facts against your textbook.</p>
    <div class="ss-rich" id="tutNotesBody"></div><div class="ss-rich" id="tutNotesFigs"></div>`;
  const bodyEl = panel.querySelector('#tutNotesBody');
  bodyEl.innerHTML = ssSimpleMarkdown(body);
  panel.querySelector('#tutNotesDl').appendChild(ssMakeDownloadMenu({ title: () => 'Study notes — ' + tutSessionLabel, getRoot: tutNotesExportRoot, getMarkdown: () => tutNotesMd }));
  await ssRenderRich(bodyEl, body);
  await ssShowDiagrams(panel.querySelector('#tutNotesFigs'), query || tutSessionLabel);
  addPoints(5, `Tutor notes: ${tutSessionLabel}`);
}
