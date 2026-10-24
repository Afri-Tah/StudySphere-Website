// ══ NOTES GENERATOR ══
// Notes are tied to real sources instead of the AI's memory:
//   1. The exam board's specification (syllabus-data.js) decides WHAT is covered and how deep.
//   2. The student's own textbook/notes (doc-tools.js), if attached, supply the content, with
//      page references — nothing is invented when the book doesn't cover a point.
//   3. A second AI pass checks the finished notes against the specification and flags gaps,
//      out-of-syllabus content and any maths errors it can verify.
// Maths is drawn with KaTeX; every result has a Download menu (ss-download.js).
// If no AI can be reached, a fill-in outline is shown instead — always labelled honestly.

const nhStore = ssCreateDocStore();
let nhMd = '';
let nhTitle = '';
let nhBusy = false;
let nhSylKey = '';
const nhEl = id => document.getElementById(id);

ssMountUploader(nhEl('nhUploader'), nhStore, { onChange: () => { if (nhStore.count()) nhEl('nhBookBox').open = true; nhRefreshPlan(); } });

function nhSyllabus() { return ssGetSyllabus(nhEl('nhGenCurriculum').value, nhEl('nhGenLevel').value, nhEl('nhGenSubject').value); }
function nhBoardLabel() { const c = nhEl('nhGenCurriculum').value; return c ? `${c} ${nhEl('nhGenLevel').value}` : nhEl('nhGenLevel').value; }

// ── Syllabus box (unit picker, matched sections, suggestions) ──
function nhRefreshSpec() {
  const syl = nhSyllabus(), box = nhEl('nhSpecBox');
  if (!syl) { box.style.display = 'none'; nhEl('nhTopicList').innerHTML = ''; nhRefreshPlan(); return; }
  box.style.display = 'block';
  const sel = nhEl('nhUnit'), key = nhEl('nhGenCurriculum').value + nhEl('nhGenLevel').value + nhEl('nhGenSubject').value;
  if (nhSylKey !== key) {
    sel.innerHTML = '<option value="">All units</option>' + syl.units.map(u => `<option value="${u.code}">${u.code} — ${ssEscapeHTML(u.name)}</option>`).join('');
    nhSylKey = key;
  }
  nhEl('nhTopicList').innerHTML = ssSyllabusTopicNames(syl, sel.value).map(n => `<option value="${ssEscapeHTML(n)}"></option>`).join('');
  const topic = nhEl('nhGenTopic').value.trim(), body = nhEl('nhSpecBody');
  if (!topic) body.innerHTML = `<span class="nh-spec-hint">Notes follow the official ${ssEscapeHTML(syl.short)} specification. Type a topic and you’ll see exactly where it sits on the syllabus.</span>`;
  else {
    const m = ssSyllabusMatch(syl, topic, sel.value);
    body.innerHTML = m.length
      ? '<span class="nh-spec-hint">On the spec:</span> ' + m.map(x => `<span class="nh-chip"><b>${x.unit.code}</b> §${x.section.n} ${ssEscapeHTML(x.section.name)}</span>`).join('')
      : `<span class="nh-spec-warn"><i class="ti ti-alert-triangle"></i> “${ssEscapeHTML(topic)}” isn’t on the ${ssEscapeHTML(syl.short)} specification${sel.value ? ' for ' + sel.value : ''}. Pick a suggestion from the topic box, or choose “All units”.</span>`;
  }
  const src = nhEl('nhSpecSrc'); src.href = syl.source; src.innerHTML = `<i class="ti ti-external-link"></i> ${ssEscapeHTML(syl.title)} — ${ssEscapeHTML(syl.issue)}`;
  nhRefreshPlan();
}
function nhRefreshPlan() {
  const syl = nhSyllabus(), topic = nhEl('nhGenTopic').value.trim(), hasBook = nhStore.count() > 0;
  const m = syl && topic ? ssSyllabusMatch(syl, topic, nhEl('nhUnit').value) : [];
  let t;
  if (hasBook && !topic) t = 'Plan: your whole file will be turned into notes, part by part, with page references.';
  else if (!topic) t = 'Type a topic, or attach a file to turn it into notes.';
  else if (syl && m.length) t = `Plan: notes on “${topic}” matched to ${syl.short} (${Array.from(new Set(m.map(x => x.unit.code))).join(', ')})${hasBook ? ', taken from the pages of your book' : ''}, then checked against the specification.`;
  else if (syl) t = 'This topic isn’t on the specification, so there is nothing to match it to.';
  else t = `Plan: notes on “${topic}”${hasBook ? ', taken from your book' : ''}. There is no syllabus map for this subject yet, so these notes are not checked against the specification${hasBook ? '' : ' — attach your textbook for page-referenced answers'}.`;
  nhEl('nhPlan').textContent = t;
}
['nhGenCurriculum', 'nhGenLevel', 'nhGenSubject', 'nhUnit'].forEach(id => nhEl(id).addEventListener('change', nhRefreshSpec));
nhEl('nhGenTopic').addEventListener('input', nhRefreshSpec);
nhRefreshSpec();

function buildOfflineOutline(topic, subject, boardLabel) {
  return `
    <h3><i class="ti ti-notes"></i> ${topic} — ${subject}</h3>
    <p style="margin:6px 0 12px;color:var(--muted);font-size:0.85rem">A fill-in outline for ${boardLabel} (generated offline — no AI provider configured or available right now). Fill in each section from your textbook and class notes.</p>
    <h4>Overview</h4>
    <p>Write 2–3 sentences summarising what "${topic}" covers and why it matters for the ${subject} syllabus.</p>
    <h4>Key Concepts</h4>
    <ul>
      <li>List the core ideas or processes involved in ${topic}</li>
      <li>Note how each concept connects to the wider ${subject} topic list</li>
      <li>Add any formulae, equations or laws that apply here</li>
    </ul>
    <h4>Important Definitions</h4>
    <ul>
      <li>Term 1 — definition</li>
      <li>Term 2 — definition</li>
    </ul>
    <h4>Common Exam Mistakes</h4>
    <ul>
      <li>Mistakes examiners frequently flag on this topic</li>
      <li>Command words to watch out for (e.g. "explain" vs "describe")</li>
    </ul>
    <h4>Quick Recall Summary</h4>
    <ul>
      <li>5 bullet points you could read in the last 5 minutes before the exam</li>
    </ul>
    <div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border);font-size:0.78rem;color:var(--muted)">Offline outline for ${boardLabel} · Fill it in, then cross-check with SaveMyExams or ZNotes and your textbook.</div>
  `;
}



const NH_LENGTH = {
  short:    { topic: 'about 250-300 words', point: '40-60 words', part: 'about 150-250 words', tokens: 2500 },
  standard: { topic: 'about 450-550 words', point: '80-120 words', part: 'about 300-450 words', tokens: 3200 },
  detailed: { topic: 'about 800-1000 words', point: '150-220 words', part: 'about 500-800 words', tokens: 4500 }
};
const NH_MATH_RULES = `Write ALL maths in LaTeX: inline between single dollar signs, display equations between double dollar signs (examples: $x^2$, $\\frac{a}{b}$, $\\sqrt{b^2-4ac}$, $\\int_a^b f(x)\\,dx$, $v=\\frac{\\Delta s}{\\Delta t}$, $30^{\\circ}$, $\\text{H}_2\\text{O}$). Never write plain-text maths like x^2 or sqrt(x). Never use a dollar sign for money; write currency as a code such as BDT 500.`;
const NH_DIAGRAM_RULES = `If a process, cycle, sequence or decision is involved, add ONE Mermaid diagram in a fenced code block labelled mermaid. Use "flowchart TD", node labels in double quotes like A["Label"] (plain words only inside the quotes), and arrows written -->. Example:
\`\`\`mermaid
flowchart TD
  A["Interphase"] --> B["Prophase"]
  B --> C["Metaphase"]
\`\`\``;
const NH_BOOK_RULES = `STUDENT'S OWN TEXTBOOK/NOTES are provided as labelled excerpts, such as [Page 12]. They are your SOURCE for definitions, methods and examples. After every point, example or formula taken from them, add its label in square brackets, for example [Page 12]. Never invent a page label. If the excerpts do not cover something that is required, write "Not found in your book —" and give a short standard explanation, clearly marked as coming from outside the book. If the excerpts contradict the specification, follow the specification and say so. Text copied from PDFs can have broken equations; if you see one, give the correct version labelled "Correction:".`;

function nhOptions() {
  return { length: nhEl('nhLength').value, diagrams: nhEl('nhOptDiagrams').checked, formulae: nhEl('nhOptFormulae').checked, practice: nhEl('nhOptPractice').checked };
}
function nhDepthRule(level) {
  return level.startsWith('O Level')
    ? `Write at O Level / IGCSE depth: the key ideas, processes and terms a 15-16 year old needs for the exam, in simple clear language. Leave out university-level and A Level detail unless it is clearly part of the O Level / IGCSE syllabus. When unsure, leave it out.`
    : `Write at A Level / IAL depth: include the extra detail, mechanisms and precise terminology that level requires, explained clearly.`;
}
function nhResultShell(title, subtitle, badge) {
  const el = nhEl('nhAiResult'); el.style.display = 'block';
  el.innerHTML = `<div class="nh-result-head"><h3><i class="ti ti-sparkles"></i> ${ssEscapeHTML(title)}</h3><span id="nhDlSlot"></span></div>
    ${badge ? `<p class="nh-badge-line">${badge}</p>` : ''}<p class="nh-sub">${ssEscapeHTML(subtitle)}</p>
    <div id="nhProgress" class="nh-progress" aria-live="polite"></div><div id="nhExport"></div><div id="nhCheck"></div>`;
}
function nhAttachDownload(title) {
  const slot = nhEl('nhDlSlot'); if (!slot || slot.children.length) return;
  slot.appendChild(ssMakeDownloadMenu({ title: () => title, getRoot: () => nhEl('nhExport'), getMarkdown: () => nhMd }));
}
function nhSetBtn(busy, text) {
  const btn = nhEl('nhGenBtn'); nhBusy = busy; if (!btn) return;
  btn.disabled = busy;
  btn.innerHTML = busy ? `<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> ${text || 'Working…'}` : '<i class="ti ti-notes"></i> Generate Notes';
}
const nhProg = html => { const p = nhEl('nhProgress'); if (p) p.innerHTML = html ? `<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> ${html}` : ''; };
let nhFigGroups = 0;
async function nhAppendNotes(markdown, o, fallbackQuery) {
  const { body, query } = ssSplitDiagramQuery(markdown);
  nhMd += (nhMd ? '\n\n' : '') + body;
  const host = nhEl('nhExport');
  const block = document.createElement('div'); block.className = 'ss-rich nh-block';
  block.innerHTML = ssSimpleMarkdown(body); host.appendChild(block);
  await ssRenderRich(block, body);
  if (o.diagrams && nhFigGroups < 6 && (query || fallbackQuery)) {
    nhFigGroups++;
    const figs = document.createElement('div'); figs.className = 'ss-rich'; host.appendChild(figs);
    await ssShowDiagrams(figs, query || fallbackQuery);
  }
}
const nhPlainTex = s => String(s).replace(/\$/g, '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}^_]/g, ' ').replace(/\s+/g, ' ').trim();
function nhBookExcerpts(query, k, budget) {
  const hit = nhStore.retrieve(query, { k: k || 8, budget: budget || 9000 });
  return hit.map(c => `[${c.label}${nhStore.count() > 1 ? ' · ' + c.doc : ''}]\n${c.text}`).join('\n\n');
}
async function nhAI(system, prompt, tokens, effort) {
  return ssAIComplete(system, prompt, name => nhSetBtn(true, `Asking ${name}…`), { effort: effort || 'medium', maxTokens: tokens || 3200, timeoutMs: 50000 });
}

// ── A. Notes matched to the specification (one call per unit) ──
async function nhSpecNotes(syl, matches, topic, level, o, useBook) {
  const len = NH_LENGTH[o.length];
  const groups = []; matches.forEach(m => { let g = groups.find(x => x.unit.code === m.unit.code); if (!g) groups.push(g = { unit: m.unit, sections: [] }); g.sections.push(m.section); });
  const allPts = [];
  let done = 0;
  for (let i = 0; i < groups.length; i++) {
    const { unit, sections } = groups[i];
    const specText = sections.map(s => `${unit.code} §${s.n} ${s.name}\n` + s.pts.map(p => `  [${unit.code} ${p[0]}] ${p[1].replace(/\$/g, '')}`).join('\n')).join('\n');
    sections.forEach(s => s.pts.forEach(p => allPts.push({ code: `${unit.code} ${p[0]}`, text: p[1] })));
    const know = o.formulae && unit.know.length ? `\nFormulae students must remember for ${unit.code} (use these exactly where relevant):\n${unit.know.map(k => '- ' + k).join('\n')}` : '';
    const title = `${unit.code} — ${sections.map(s => s.name).join(', ')}`;
    const book = useBook ? nhBookExcerpts(`${topic} ${sections.map(s => s.name).join(' ')} ${nhPlainTex(sections.map(s => s.pts.map(p => p[1]).join(' ')).join(' ')).slice(0, 500)}`, 9, 10000) : '';
    const system = `You write revision notes for a ${syl.title} student (${syl.issue}).
THE SPECIFICATION EXTRACT IN THE USER MESSAGE IS THE AUTHORITY on what to teach and how deep. Cover EVERY point listed, in order, and nothing the specification does not ask for. Respect every restriction in it (for example "not required").
Start with the heading "## ${title}". If there are several specification sections, use a "### " sub-heading for each.
For each point: a bullet starting with its code in bold square brackets such as **[${unit.code} ${sections[0].pts[0][0]}]**, then the rule or method in plain words and LaTeX, then ONE short worked example with every step shown (choose numbers that work out cleanly), and a one-line "Exam tip" only where useful. About ${len.point} per point.
ACCURACY: work every example out completely and check it by a second method (substitute back, differentiate your integral, estimate). Never state a formula you are not certain of — write "Check this in your textbook" instead of guessing. Do not include content from other exam boards, from Further Mathematics, or from university level.
${useBook ? NH_BOOK_RULES : 'No textbook was provided, so write from your knowledge of this specification, and keep to standard methods and results.'}
${NH_MATH_RULES}
${o.diagrams ? NH_DIAGRAM_RULES + '\nOnly add a diagram if it really helps (for example a flowchart for choosing a method).' : 'Do not include diagrams.'}
${nhDepthRule(level)} No horizontal rules, no emojis.${o.diagrams ? '\nYour very last line must be exactly: DIAGRAM_SEARCH: followed by 2-4 keywords for a labelled textbook diagram, or DIAGRAM_SEARCH: none.' : ''}`;
    const prompt = `Topic requested: ${topic}\nUnit: ${unit.code} — ${unit.name} (${unit.exam})\n\n--- SPECIFICATION EXTRACT ---\n${specText}${know}\n--- END ---${useBook ? `\n\n--- STUDENT'S BOOK EXCERPTS ---\n${book || '(no matching pages were found in the attached file)'}\n--- END ---` : ''}\n\nWrite the notes for this unit now.`;
    nhProg(`Writing ${unit.code} (${i + 1} of ${groups.length})… notes appear below as each unit is finished`);
    nhSetBtn(true, `${unit.code} (${i + 1}/${groups.length})…`);
    const res = await nhAI(system, prompt, 5000, 'high');
    if (res) { done++; let t = res.text.replace(/^.*DIAGRAM_SEARCH:\s*none.*$/im, ''); await nhAppendNotes(t, o, ''); }
    else { const n = document.createElement('p'); n.className = 'nh-part-fail'; n.textContent = `${title} could not be written because the AI was busy. Click Generate Notes again to retry.`; nhEl('nhExport').appendChild(n); }
  }
  nhProg('');
  return { done, groups, allPts };
}

// ── B. Second pass: check the notes against the specification ──
async function nhSpecCheck(syl, allPts) {
  if (!allPts.length || !nhMd) return;
  nhProg('Checking the notes against the specification…');
  const system = `You are a strict examiner checking revision notes against a specification. Reply with ONLY one JSON object and nothing else, in exactly this shape: {"covered":["P1 5.1"],"missing":["P1 5.2"],"outOfSpec":["short description"],"errors":["short description of the mistake and where it is"]}.
"covered" and "missing" use the point codes given. A point is covered only if the notes explain it. "outOfSpec" lists content in the notes that these specification points do NOT require. "errors" lists only mathematical or factual mistakes you are SURE about, including wrong arithmetic in worked examples — verify each worked example yourself. Use empty arrays when there is nothing to report.`;
  const prompt = `SPECIFICATION POINTS:\n${allPts.map(p => `[${p.code}] ${p.text.replace(/\$/g, '')}`).join('\n')}\n\nNOTES TO CHECK:\n${nhMd.slice(0, 16000)}`;
  const res = await nhAI(system, prompt, 1800, 'high');
  nhProg('');
  if (!res) return;
  let j; try { j = JSON.parse((res.text.match(/\{[\s\S]*\}/) || [''])[0]); } catch (e) { return; }
  const arr = k => (Array.isArray(j[k]) ? j[k].map(String).slice(0, 12) : []);
  const covered = arr('covered'), missing = arr('missing'), out = arr('outOfSpec'), errs = arr('errors');
  const total = allPts.length, ok = Math.min(total, covered.length);
  const li = a => a.map(x => `<li>${ssEscapeHTML(x)}</li>`).join('');
  nhEl('nhCheck').innerHTML = `<div class="nh-checkbox ${errs.length || missing.length ? 'warn' : 'ok'}">
    <h4><i class="ti ti-shield-check"></i> Specification check <small>— a second AI pass, not a guarantee. Always compare with your textbook and past papers.</small></h4>
    <p><b>${ok} of ${total}</b> specification points covered.</p>
    ${missing.length ? `<p><b>Not covered yet:</b> ${ssEscapeHTML(missing.join(', '))}. Generate again or ask the AI Tutor about these.</p>` : ''}
    ${errs.length ? `<p><b>Please double-check these:</b></p><ul>${li(errs)}</ul>` : '<p>No mathematical errors were found in the worked examples.</p>'}
    ${out.length ? `<p><b>Extra content (not required by the spec):</b></p><ul>${li(out)}</ul>` : ''}
  </div>`;
}

// ── C. Topic notes without a syllabus map (optionally from the student's book) ──
async function nhTopicNotes(subject, topic, boardLabel, level, o, useBook) {
  const len = NH_LENGTH[o.length];
  const sections = ['Overview (2-3 sentences)', 'Key Concepts (short bullet points with the key terms in **bold**)', 'Important Definitions (bullets)']
    .concat(o.formulae ? ['Key Formulae (only if the topic has formulae; each as a LaTeX equation with a one-line meaning of each symbol)'] : [])
    .concat(['Common Exam Mistakes (bullets)', 'Quick Recall Summary (5 bullets)'])
    .concat(o.practice ? ['Practice Questions (4 exam-style questions, then a short "Answers" list)'] : []);
  const book = useBook ? nhBookExcerpts(`${topic} ${subject}`, 10, 11000) : '';
  const system = `You are a revision-notes writer for a ${boardLabel} student. Write clean GitHub-flavoured Markdown, exam-focused, ${len.topic}.
Use exactly these sections, each starting with a "## " heading: ${sections.join('; ')}.
Add a Markdown table (with a header row) under Key Concepts only when the topic compares things.
${o.diagrams ? NH_DIAGRAM_RULES : 'Do not include diagrams.'}
Accuracy matters: only include facts you are sure are correct for this syllabus; if unsure, write "Check this in your textbook" or leave it out. For any calculation, work it step by step and double-check the arithmetic.
${useBook ? NH_BOOK_RULES : ''}
${NH_MATH_RULES}
${nhDepthRule(level)} Spell the exam board and level exactly as given: ${boardLabel}. No horizontal rules or emojis.${o.diagrams ? '\nYour very last line must be exactly: DIAGRAM_SEARCH: followed by 2-4 keywords for a labelled textbook diagram of this topic.' : ''}`;
  const prompt = `Subject: ${subject || '(not given)'}\nBoard/Level: ${boardLabel}\nTopic: ${topic}${useBook ? `\n\n--- STUDENT'S BOOK EXCERPTS ---\n${book || '(no matching pages were found in the attached file)'}\n--- END ---` : ''}\n\nWrite the revision notes described in the system prompt.`;
  return nhAI(system, prompt, len.tokens, 'medium');
}

// ── D. A whole uploaded file, part by part ──
async function nhFileNotes(subject, boardLabel, level, o) {
  const chunks = nhStore.chunks();
  const allChars = chunks.reduce((a, c) => a + c.text.length, 0);
  const partSize = Math.max(6000, Math.ceil(allChars / 14));
  const parts = []; let cur = null;
  chunks.forEach(c => { if (!cur || cur.text.length + c.text.length > partSize) { cur = { text: '', labels: [] }; parts.push(cur); } cur.text += `[${c.label}]\n${c.text}\n\n`; cur.labels.push(c.label); });
  const len = NH_LENGTH[o.length];
  const base = `You write revision notes for a ${boardLabel} student, using ONLY the part of their own study material that you are given. Do not add facts that are not in it. After every bullet, definition or formula, add the label of the excerpt it came from in square brackets, for example [Page 4]; never invent a label. If something looks garbled or wrong (text from PDFs can have broken equations), say so briefly and give the correct version labelled "Correction:". Clean GitHub-flavoured Markdown, ${len.part}.
Start with a "## " heading that names what this part is about, then short bullet points with key terms in **bold**, a "### Definitions" list if the part defines terms${o.formulae ? ', and a "### Formulae" list (each as a LaTeX equation with a one-line meaning of each symbol) if it has formulae' : ''}. Use a Markdown table when the material compares things. Do not write an overview or a summary — those are added separately.
${o.diagrams ? NH_DIAGRAM_RULES + '\nOnly add a diagram if this part really contains a process, cycle or sequence.' : 'Do not include diagrams.'}
${NH_MATH_RULES} ${nhDepthRule(level)} No horizontal rules, no emojis.${o.diagrams ? '\nYour very last line must be exactly: DIAGRAM_SEARCH: followed by 2-4 keywords for a labelled textbook diagram of this part, or DIAGRAM_SEARCH: none if no diagram would help.' : ''}`;
  let done = 0, failed = 0;
  for (let i = 0; i < parts.length; i++) {
    nhProg(`Writing part ${i + 1} of ${parts.length}… notes appear below as each part is finished`);
    nhSetBtn(true, `Part ${i + 1} of ${parts.length}…`);
    const labels = parts[i].labels, where = labels[0] + (labels.length > 1 ? ' to ' + labels[labels.length - 1] : '');
    const res = await nhAI(base, `Subject: ${subject || '(work it out from the material)'}\nThis is part ${i + 1} of ${parts.length} of the student's material (${where}).\n\n--- MATERIAL ---\n${parts[i].text.trim()}\n--- END ---\n\nWrite the notes for this part.`, len.tokens, 'medium');
    if (res) { done++; await nhAppendNotes(res.text.replace(/^.*DIAGRAM_SEARCH:\s*none.*$/im, ''), o, ''); }
    else { failed++; const n = document.createElement('p'); n.className = 'nh-part-fail'; n.textContent = `Part ${i + 1} (${where}) could not be written because the AI was busy. Click Generate Notes again to retry.`; nhEl('nhExport').appendChild(n); }
  }
  nhProg('');
  return { done, failed, parts: parts.length };
}

// ── E. Quick-recall summary (and optional practice) from the notes just written ──
async function nhWrapUp(boardLabel, o) {
  nhProg('Adding a quick-recall summary…');
  const wrapUp = `Using ONLY the notes below, write: "## Quick Recall Summary" with 8 short bullets of the most important points to remember; "## Common Exam Mistakes" with 4 bullets (only mistakes clearly implied by the notes' content)${o.practice ? '; and "## Practice Questions" with 5 exam-style questions followed by a short "Answers" list (work each calculation step by step and double-check it)' : ''}. ${NH_MATH_RULES} No horizontal rules, no emojis, no diagrams.`;
  const res = await nhAI(wrapUp, `Student: ${boardLabel}\n\nNOTES:\n${nhMd.slice(0, 14000)}`, 3000, 'medium');
  if (res) await nhAppendNotes(res.text, { diagrams: false }, '');
  nhProg('');
}

async function generateAINotes() {
  if (nhBusy) return;
  const level = nhEl('nhGenLevel').value, subject = nhEl('nhGenSubject').value, topic = nhEl('nhGenTopic').value.trim();
  const o = nhOptions(), boardLabel = nhBoardLabel(), hasBook = nhStore.count() > 0, syl = nhSyllabus();
  nhMd = ''; nhFigGroups = 0;
  if (!hasBook && !topic) { alert('Type a topic, or attach a file first.'); return; }
  if (!hasBook && !subject) { alert('Please select a subject.'); return; }
  const matches = syl && topic ? ssSyllabusMatch(syl, topic, nhEl('nhUnit').value) : [];
  if (syl && topic && !matches.length) { alert(`“${topic}” isn’t on the ${syl.short} specification${nhEl('nhUnit').value ? ' for ' + nhEl('nhUnit').value : ''}. Choose a topic from the suggestions (or “All units”).`); return; }

  if (!ssHasAnyAIPath()) {
    const el = nhEl('nhAiResult'); el.style.display = 'block';
    el.innerHTML = topic && !hasBook ? buildOfflineOutline(topic, subject, boardLabel) : '<p>The AI is temporarily unavailable — please try again in a few minutes.</p>';
    if (topic && !hasBook) addPoints(8, `Notes outline: ${subject} — ${topic}`);
    return;
  }

  // 1) Whole file, no topic
  if (hasBook && !topic) {
    nhTitle = (subject ? subject + ' — ' : '') + 'Notes from ' + nhStore.docs().map(d => d.name.replace(/\.[a-z0-9]+$/i, '')).slice(0, 2).join(', ');
    nhResultShell(nhTitle, `Made only from your ${nhStore.docs().length > 1 ? 'files' : 'file'} (${nhStore.totalChars().toLocaleString()} characters), for ${boardLabel}. Page references are in square brackets.`);
    nhSetBtn(true, 'Reading your notes…');
    const r = await nhFileNotes(subject, boardLabel, level, o);
    if (r.done) await nhWrapUp(boardLabel, o);
    nhSetBtn(false);
    if (r.done) { nhAttachDownload(nhTitle); addPoints(10 + Math.min(10, r.done), `AI notes from file: ${nhTitle}`); }
    else nhEl('nhAiResult').innerHTML = '<p>The AI was too busy to write these notes. Please try again in a minute.</p>';
    return;
  }

  // 2) Topic matched to the specification (book optional)
  if (syl && matches.length) {
    nhTitle = `${topic} — ${syl.short}`;
    const badge = `<span class="nh-spec-badge"><i class="ti ti-certificate"></i> Matched to ${ssEscapeHTML(syl.title)}</span>${hasBook ? ' <span class="nh-spec-badge book"><i class="ti ti-book"></i> From your book</span>' : ''}`;
    nhResultShell(nhTitle, `${syl.issue}. ${hasBook ? 'Facts and examples come from your attached book (page references in brackets); the specification decides what is covered.' : 'Written from the specification — attach your textbook to get page-referenced answers.'}`, badge);
    nhSetBtn(true, 'Matching the syllabus…');
    const r = await nhSpecNotes(syl, matches, topic, level, o, hasBook);
    if (r.done) {
      if (o.practice) await nhWrapUp(boardLabel, o);
      await nhSpecCheck(syl, r.allPts);
    }
    nhSetBtn(false);
    if (r.done) { nhAttachDownload(nhTitle); addPoints(10 + r.done * 2, `Spec-matched notes: ${nhTitle}`); }
    else nhEl('nhAiResult').innerHTML = '<p>The AI was too busy to write these notes. Please try again in a minute.</p>';
    return;
  }

  // 3) General topic notes (no syllabus map for this subject)
  nhTitle = `${topic} — ${subject}`;
  const badge = hasBook ? '<span class="nh-spec-badge book"><i class="ti ti-book"></i> From your book</span>' : '<span class="nh-spec-badge none"><i class="ti ti-info-circle"></i> Not checked against a syllabus map</span>';
  nhResultShell(nhTitle, hasBook ? `Facts come from your attached book (page references in brackets), for ${boardLabel}.` : `AI-written for ${boardLabel}. There is no syllabus map for this subject yet — compare with your specification and textbook.`, badge);
  nhSetBtn(true, 'Asking AI…'); nhProg('Generating…');
  const result = await nhTopicNotes(subject, topic, boardLabel, level, o, hasBook);
  nhSetBtn(false); nhProg('');
  if (result) { await nhAppendNotes(result.text, o, `${topic} ${subject}`); nhAttachDownload(nhTitle); addPoints(10, `AI notes: ${subject} — ${topic}`); }
  else { nhEl('nhAiResult').innerHTML = hasBook ? '<p>The AI was too busy. Please try again in a minute.</p>' : buildOfflineOutline(topic, subject, boardLabel); if (!hasBook) addPoints(8, `Notes outline: ${subject} — ${topic}`); }
}
