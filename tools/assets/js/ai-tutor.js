// ══ AI STUDY TUTOR ══
// Inspired by study-buddy (github.com/michael-borck/study-buddy): a
// grounded, level-aware, quiz-style AI tutor. StudySphere has no backend
// and no live web-search step, so this version leans on the two things a
// static site *can* honestly do: (1) let the student paste their own
// source material to be taught from, and (2) be upfront when there's no
// source and the tutor is teaching from general knowledge instead — never
// pretend either one is the other. It runs on whichever AI key the
// student has added under "AI Keys" (see tools-common.js); with none
// configured, it doesn't fake a conversation — it just says so.

let tutMessages = [];      // {role:'user'|'assistant', content}
let tutSystemPrompt = '';
let tutSessionLabel = '';

function tutToggleNotes() {
  const wrap = document.getElementById('tutNotesWrap');
  const chevron = document.getElementById('tutNotesChevron');
  const open = wrap.style.display !== 'none';
  wrap.style.display = open ? 'none' : 'block';
  chevron.className = open ? 'ti ti-chevron-right' : 'ti ti-chevron-down';
}

function tutBuildSystemPrompt(level, subject, topic, notes) {
  const focus = topic ? `${subject} — specifically "${topic}"` : subject;
  const grounding = notes
    ? `The student has pasted their own study material below. Teach from THIS material — don't bring in outside facts unless the student explicitly asks you to go beyond it. If their question isn't covered by it, say so plainly rather than guessing.\n\n--- STUDY MATERIAL ---\n${notes}\n--- END STUDY MATERIAL ---`
    : `The student hasn't pasted any source material, so you're teaching from general knowledge rather than a specific text. Be upfront if you're unsure about something instead of inventing facts — this is a static website with no live search, so nothing here has been double-checked against a source. Encourage the student to confirm important details against their own textbook or teacher.`;

  return `You are a patient, encouraging personal tutor for a ${level} student studying ${focus}.

Use plain, simple language and short paragraphs — many students are learning in a second language, so avoid jargon, and briefly define any technical term you have to use.

Teach step by step, one small idea at a time. After each idea, ask a short question to check the student understood before moving on — don't dump everything at once. If the student answers wrong, gently correct them and re-explain rather than just handing over the right answer. If they answer right, confirm briefly and move to the next idea. Keep each message under about 120 words unless the student asks for more detail.

${grounding}`;
}

function tutSetLoading(isLoading, label) {
  const btn = document.getElementById('tutSendBtn');
  const startBtn = document.getElementById('tutStartBtn');
  if (btn) { btn.disabled = isLoading; }
  if (startBtn) { startBtn.disabled = isLoading; }
}

function tutRenderMessage(role, text) {
  const log = document.getElementById('tutorLog');
  const div = document.createElement('div');
  div.className = `tutor-msg ${role === 'assistant' ? 'tutor' : 'student'}`;
  const paras = text.split(/\n{2,}/).map(p => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`).join('');
  div.innerHTML = paras;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function tutRenderSystemNote(text) {
  const log = document.getElementById('tutorLog');
  const div = document.createElement('div');
  div.className = 'tutor-msg system-note';
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function tutShowTyping(show) {
  let el = document.getElementById('tutTyping');
  if (show) {
    if (!el) {
      el = document.createElement('div');
      el.id = 'tutTyping';
      el.className = 'tutor-typing';
      el.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Tutor is thinking…';
      document.getElementById('tutorLog').appendChild(el);
      el.scrollIntoView({ block: 'end' });
    }
  } else if (el) {
    el.remove();
  }
}

async function tutStartSession() {
  const notice = document.getElementById('tutNoKeyNotice');
  if (!ssHasAnyAIPath()) {
    notice.style.display = 'block';
    return;
  }
  notice.style.display = 'none';

  const level = document.getElementById('tutLevel').value;
  const subject = document.getElementById('tutSubject').value.trim();
  const topic = document.getElementById('tutTopic').value.trim();
  const notes = document.getElementById('tutNotes').value.trim();
  if (!subject) { alert('Please tell the tutor what subject you want to study!'); return; }

  tutSystemPrompt = tutBuildSystemPrompt(level, subject, topic, notes);
  tutMessages = [];
  tutSessionLabel = topic ? `${subject} — ${topic}` : subject;
  document.getElementById('tutSessionLabel').textContent = `${tutSessionLabel} · ${level}`;

  document.getElementById('tutorSetupCard').style.display = 'none';
  const chatCard = document.getElementById('tutorChatCard');
  chatCard.style.display = 'block';
  document.getElementById('tutorChat').style.display = 'flex';
  document.getElementById('tutorLog').innerHTML = '';
  if (notes) tutRenderSystemNote('Teaching from the notes you pasted.');
  else tutRenderSystemNote('No notes pasted — teaching from general knowledge. Double-check key facts yourself.');

  addPoints(5, `Started tutoring: ${tutSessionLabel}`);

  tutSetLoading(true);
  tutShowTyping(true);
  const kickoff = 'Please start the session now: give a short, friendly introduction to the topic, then teach the first small idea and ask your first check question.';
  tutMessages.push({ role: 'user', content: kickoff });
  const result = await ssAIChat(tutSystemPrompt, tutMessages, (name) => {
    const el = document.getElementById('tutTyping');
    if (el) el.innerHTML = `<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Asking ${name}…`;
  });
  tutShowTyping(false);
  tutSetLoading(false);

  if (result) {
    tutMessages.push({ role: 'assistant', content: result.text });
    tutRenderMessage('assistant', result.text);
  } else {
    tutMessages.pop(); // drop the kickoff turn so retrying doesn't duplicate it
    tutRenderSystemNote('Couldn\u2019t reach any configured AI provider. Check your AI Keys, then try New session.');
  }
}

function tutHandleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    tutSend();
  }
}

async function tutSend() {
  const input = document.getElementById('tutInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  tutMessages.push({ role: 'user', content: text });
  tutRenderMessage('student', text);

  tutSetLoading(true);
  tutShowTyping(true);
  const result = await ssAIChat(tutSystemPrompt, tutMessages, (name) => {
    const el = document.getElementById('tutTyping');
    if (el) el.innerHTML = `<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Asking ${name}…`;
  });
  tutShowTyping(false);
  tutSetLoading(false);

  if (result) {
    tutMessages.push({ role: 'assistant', content: result.text });
    tutRenderMessage('assistant', result.text);
    addPoints(2, `Tutoring exchange: ${tutSessionLabel}`);
  } else {
    tutRenderSystemNote('Couldn\u2019t reach any configured AI provider right now — check your AI Keys and try again.');
  }
}

function tutRestart() {
  tutMessages = [];
  document.getElementById('tutorChatCard').style.display = 'none';
  document.getElementById('tutorSetupCard').style.display = 'block';
  document.getElementById('tutNoKeyNotice').style.display = 'none';
}
