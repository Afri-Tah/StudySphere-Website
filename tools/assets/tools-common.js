// ══════════════════════════════════════════════════════
//  STUDYSPHERE TOOLS — shared across every tool page
// ══════════════════════════════════════════════════════

// ── Dark mode (shares the same localStorage key as the main site,
//    so the setting carries across index.html <-> tools pages) ──
function applyStoredTheme() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark', isDark);
  const btn = document.getElementById('darkToggleBtn');
  if (btn) btn.innerHTML = isDark ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
}
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  const btn = document.getElementById('darkToggleBtn');
  if (btn) btn.innerHTML = isDark ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
}
applyStoredTheme();

// ── Points system ──
let ptsData = JSON.parse(localStorage.getItem('ss_points') || '{"balance":0,"log":[]}');
function savePts() { localStorage.setItem('ss_points', JSON.stringify(ptsData)); }
function addPoints(amount, reason) {
  ptsData.balance += amount;
  ptsData.log.unshift({ pts: amount, desc: reason, time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) });
  if (ptsData.log.length > 50) ptsData.log = ptsData.log.slice(0, 50);
  savePts(); updatePtsDisplay(); showPtsToast(`+${amount} ⭐ ${reason}`);
}
function spendPoints(amount, reason) {
  if (ptsData.balance < amount) { alert(`You need ${amount} ⭐ points. Keep studying to earn more!`); return false; }
  ptsData.balance -= amount;
  ptsData.log.unshift({ pts: -amount, desc: reason, time: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) });
  savePts(); updatePtsDisplay(); showPtsToast(`-${amount} ⭐ ${reason}`); return true;
}
function updatePtsDisplay() {
  const nav = document.getElementById('topnavPts');
  const panel = document.getElementById('ptsPanelVal');
  if (nav) nav.textContent = ptsData.balance;
  if (panel) panel.textContent = ptsData.balance;
}
function showPtsToast(msg) {
  const t = document.getElementById('ptsToast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(showPtsToast._t);
  showPtsToast._t = setTimeout(() => t.classList.remove('show'), 2800);
}
function openPtsPanel() {
  document.getElementById('ptsPanel')?.classList.add('open');
  document.getElementById('ptsOverlay')?.classList.add('open');
  renderPtsPanel();
}
function closePtsPanel() {
  document.getElementById('ptsPanel')?.classList.remove('open');
  document.getElementById('ptsOverlay')?.classList.remove('open');
}
function renderPtsPanel() {
  updatePtsDisplay();
  const rewards = [
    { name: '🔓 Unlock Premium Notes', desc: 'Access exclusive curated notes for any subject', cost: 200 },
    { name: '📋 Mock Exam PDF', desc: 'Download a full mock exam for your subject', cost: 150 },
    { name: '🎯 Ask Priority Question', desc: "Move to top of teacher's queue", cost: 100 },
    { name: '📝 Notes Generator', desc: '5 extra note outline generations', cost: 50 },
    { name: '🏅 Gold Studier Badge', desc: 'Earn the "Gold Studier" profile badge', cost: 500 },
  ];
  const rewardsEl = document.getElementById('ptsRewards');
  if (rewardsEl) {
    rewardsEl.innerHTML = rewards.map(r => `
      <div class="pts-reward-item">
        <div class="pri-info"><div class="pri-name">${r.name}</div><div class="pri-desc">${r.desc}</div></div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div class="pri-cost">${r.cost} ⭐</div>
          <button class="btn btn-sm btn-peach" style="margin:0;width:auto;font-size:0.72rem" onclick="redeemReward('${r.name}',${r.cost})">Redeem</button>
        </div>
      </div>`).join('');
  }
  // Note: the old "leaderboard" showing fabricated names (e.g. "Farhan A.")
  // was removed — it displayed made-up people as if they were real students,
  // which was misleading. This panel now only shows the user's own stats.
  const log = ptsData.log;
  const logEl = document.getElementById('ptsLog');
  if (logEl) {
    logEl.innerHTML = log.length ? log.map(l => `
      <div class="pts-log-item">
        <div>${l.desc}</div>
        <div style="display:flex;flex-direction:column;align-items:flex-end">
          <div class="pli-pts ${l.pts > 0 ? 'earn' : 'spend'}">${l.pts > 0 ? '+' : ''}${l.pts} ⭐</div>
          <div style="font-size:0.65rem;color:var(--muted)">${l.time}</div>
        </div>
      </div>`).join('') : '<div style="text-align:center;padding:16px;color:var(--muted);font-size:0.85rem">No activity yet!</div>';
  }
}
function redeemReward(name, cost) {
  if (spendPoints(cost, `Redeemed: ${name}`)) {
    alert(`🎉 Redeemed: ${name}!\n\nContact your teacher to claim this reward.`);
    renderPtsPanel();
  }
}
updatePtsDisplay();

// ══════════════════════════════════════════════════════
//  MULTI-PROVIDER AI FALLBACK ENGINE
// ══════════════════════════════════════════════════════
// StudySphere is a static site with no backend/server, which shapes what's
// actually possible here — worth being upfront about:
//
//  • A "free, unlimited, no-key" AI API that's also safe to call straight
//    from public browser code doesn't exist. Any key baked into this
//    codebase is visible to every visitor via "View Source" — it WILL get
//    scraped, drained, and the provider WILL ban it. Providers that used to
//    offer keyless browser access (e.g. Pollinations) have explicitly
//    dropped that for new projects because of exactly this abuse.
//  • So instead: each student/teacher who wants the AI features pastes
//    their OWN free API key (from the provider's own dashboard — no credit
//    card needed for any of these) into the panel below. It's saved only in
//    THIS browser's localStorage — never in this code, never sent anywhere
//    but straight to that provider from your own browser.
//  • Multiple providers can be configured at once. If one is missing a key,
//    rate-limited, or down, the next configured one is tried automatically
//    — so a single provider running dry doesn't stop the feature. If every
//    configured provider fails (or none are set up yet), callers fall back
//    to a fully offline mode that never depends on the network at all.
//
// This is "as resilient as free tiers allow," not literally infinite — no
// static site can honestly promise more than that.

const SS_AI_PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    keyPlaceholder: 'gsk_...',
    signupUrl: 'https://console.groq.com/keys',
    signupNote: 'No card required · ~30 requests/min, 14,400/day',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'],
    async call(key, model, system, prompt, signal) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0.6, max_tokens: 900,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error(`Groq/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    keyPlaceholder: 'AIza...',
    signupUrl: 'https://aistudio.google.com/apikey',
    signupNote: 'No card required · Google AI Studio free tier',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash'],
    async call(key, model, system, prompt, signal) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${system}\n\n${prompt}` }] }] })
      });
      if (!res.ok) throw new Error(`Gemini/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return (data.candidates?.[0]?.content?.parts || []).map(p => p.text).join('').trim();
    }
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    keyPlaceholder: 'sk-or-...',
    signupUrl: 'https://openrouter.ai/keys',
    signupNote: 'No card required · pick any model ending in ":free"',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-chat-v3.1:free'],
    async call(key, model, system, prompt, signal) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error(`OpenRouter/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  },
  {
    id: 'hackclub',
    name: 'Hack Club AI',
    keyPlaceholder: 'key from ai.hackclub.com',
    signupUrl: 'https://ai.hackclub.com',
    signupNote: 'Free for students — join Hack Club Slack to get a key',
    models: ['qwen/qwen3-32b'],
    async call(key, model, system, prompt, signal) {
      const res = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error(`Hack Club/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  }
];

function ssGetAIKey(id) { return localStorage.getItem(`ss_ai_key_${id}`) || ''; }
function ssSetAIKey(id, val) {
  if (val && val.trim()) localStorage.setItem(`ss_ai_key_${id}`, val.trim());
  else localStorage.removeItem(`ss_ai_key_${id}`);
}
function ssConfiguredAIProviders() { return SS_AI_PROVIDERS.filter(p => ssGetAIKey(p.id)); }

// Tries every configured provider (in the order above), and within each
// provider, every model in its list, until one returns text. Returns
// { text, provider, model } on success, or null if nothing worked (including
// the case where no keys are configured at all) — callers should always have
// an offline fallback ready for the null case.
async function ssAIComplete(system, prompt, onAttempt) {
  for (const provider of ssConfiguredAIProviders()) {
    const key = ssGetAIKey(provider.id);
    for (const model of provider.models) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        if (onAttempt) onAttempt(provider.name);
        const text = await provider.call(key, model, system, prompt, controller.signal);
        clearTimeout(timeout);
        if (text) return { text, provider: provider.name, model };
      } catch (err) {
        clearTimeout(timeout);
        console.warn(`[StudySphere AI] ${provider.name} (${model}) unavailable:`, err.message || err);
      }
    }
  }
  return null;
}

// ── Settings panel: where a key gets pasted in and saved locally ──
function openAISettingsModal() {
  closeAISettingsModal();
  const modal = document.createElement('div');
  modal.className = 'tt-add-modal';
  modal.id = 'aiSettingsModal';
  modal.innerHTML = `
    <div class="tt-modal-inner" style="max-width:420px;text-align:left;max-height:85vh;overflow-y:auto">
      <h3><i class="ti ti-key"></i> AI Provider Keys</h3>
      <p style="font-size:0.8rem;color:var(--muted);margin-bottom:14px">
        StudySphere has no server, so AI features run on <strong>your own free API key(s)</strong> —
        pasted here and saved only in this browser, never uploaded anywhere. Add one or more; if a
        provider is busy or out of quota, the next one you've added is tried automatically.
      </p>
      ${SS_AI_PROVIDERS.map(p => `
        <div style="margin-bottom:12px">
          <label style="display:flex;justify-content:space-between;align-items:baseline;font-size:0.82rem;font-weight:700;margin-bottom:4px">
            <span>${p.name}</span>
            <a href="${p.signupUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.72rem;font-weight:600">Get a free key <i class="ti ti-external-link"></i></a>
          </label>
          <input type="text" id="aiKey_${p.id}" placeholder="${p.keyPlaceholder}" value="${ssGetAIKey(p.id)}" style="margin:0" autocomplete="off">
          <div style="font-size:0.68rem;color:var(--muted);margin-top:2px">${p.signupNote}</div>
        </div>
      `).join('')}
      <div class="edit-cell-btns" style="margin-top:6px">
        <button class="btn btn-outline btn-sm" style="width:auto" onclick="closeAISettingsModal()">Cancel</button>
        <button class="btn btn-sm" style="width:auto" onclick="saveAISettingsModal()">Save ✓</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}
function closeAISettingsModal() { const m = document.getElementById('aiSettingsModal'); if (m) m.remove(); }
function saveAISettingsModal() {
  SS_AI_PROVIDERS.forEach(p => {
    const el = document.getElementById(`aiKey_${p.id}`);
    if (el) ssSetAIKey(p.id, el.value);
  });
  closeAISettingsModal();
  const count = ssConfiguredAIProviders().length;
  if (typeof showPtsToast === 'function') {
    showPtsToast(count ? `${count} AI provider${count > 1 ? 's' : ''} saved ✓` : 'Keys cleared');
  }
}
