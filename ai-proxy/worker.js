// ══════════════════════════════════════════════════════
//  STUDYSPHERE — shared AI proxy (Cloudflare Worker)
// ══════════════════════════════════════════════════════
//
// WHAT THIS IS
// The static site can't hold secret API keys — anything in its HTML/JS is
// visible to every visitor. This tiny Worker is the fix: it lives on
// Cloudflare's free tier, holds the real keys as encrypted secrets (never
// visible to students, never in the site's source), and the site calls
// THIS instead of calling Groq/Gemini/etc directly.
//
// It tries each provider you've given it a key for, in order, and moves to
// the next one automatically if a provider errors, rate-limits, or has no
// key set — so students get one "just works" AI feature with no signup,
// and it keeps working even if one free tier runs dry for the day.
//
// SET-UP (no coding required)
//   1. Sign up free at https://dash.cloudflare.com (no card needed).
//   2. Workers & Pages → Create → "Create Worker" → give it a name
//      (e.g. studysphere-ai) → Deploy.
//   3. Click "Edit code", delete the sample code, paste in this whole file,
//      click "Deploy" again.
//   4. Go to Settings → Variables and secrets, and add a secret for each
//      free provider you want (you only need ONE to get started — add more
//      later any time to increase resilience):
//        GROQ_API_KEY        - free key from https://console.groq.com/keys
//        GEMINI_API_KEY      - free key from https://aistudio.google.com/apikey
//        OPENROUTER_API_KEY  - free key from https://openrouter.ai/keys
//        HACKCLUB_API_KEY    - free key from https://ai.hackclub.com
//      (Mark each as "Secret" / encrypted, not plain text.)
//   5. Optional but recommended: add one more secret, PROXY_SHARED_SECRET,
//      set it to any random string YOU make up. This stops strangers from
//      finding your Worker's URL and burning your free quota directly
//      (CORS only stops OTHER WEBSITES' browser JS, not direct requests).
//      If you set this, also put the same string in tools-common.js as
//      SS_AI_PROXY_SECRET so the site sends it along automatically.
//   6. Copy the Worker's URL (shown at the top of its dashboard page,
//      looks like https://studysphere-ai.YOURNAME.workers.dev) into
//      tools/assets/tools-common.js → SS_AI_PROXY_URL.
//
// That's it — every tool on the site that calls ssAIComplete/ssAIChat will
// now use this automatically, with no per-student signup. Anyone who wants
// their own private key can still add one under "AI Keys" as a personal
// backup; the code tries the shared proxy first, so this doesn't remove
// anything that already worked.

const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'],
    async call(key, model, system, messages, signal) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0.6, max_tokens: 900,
          messages: [{ role: 'system', content: system }, ...messages] })
      });
      if (!res.ok) throw new Error(`Groq/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    envKey: 'GEMINI_API_KEY',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash'],
    async call(key, model, system, messages, signal) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
        })
      });
      if (!res.ok) throw new Error(`Gemini/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return (data.candidates?.[0]?.content?.parts || []).map(p => p.text).join('').trim();
    }
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-chat-v3.1:free'],
    async call(key, model, system, messages, signal) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...messages] })
      });
      if (!res.ok) throw new Error(`OpenRouter/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  },
  {
    id: 'hackclub',
    name: 'Hack Club AI',
    envKey: 'HACKCLUB_API_KEY',
    models: ['qwen/qwen3-32b'],
    async call(key, model, system, messages, signal) {
      const res = await fetch('https://ai.hackclub.com/proxy/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...messages] })
      });
      if (!res.ok) throw new Error(`Hack Club/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  }
];

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-SS-Secret',
    'Content-Type': 'application/json'
  };
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(env);

    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
    }

    // Optional shared-secret check — see step 5 in the notes above.
    if (env.PROXY_SHARED_SECRET) {
      if (request.headers.get('X-SS-Secret') !== env.PROXY_SHARED_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
      }
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
    }

    const system = typeof body.system === 'string' ? body.system : '';
    const messages = Array.isArray(body.messages) ? body.messages : null;
    if (!system || !messages || !messages.length) {
      return new Response(JSON.stringify({ error: 'Body needs { system, messages }' }), { status: 400, headers });
    }

    for (const provider of PROVIDERS) {
      const key = env[provider.envKey];
      if (!key) continue; // this provider has no secret configured — skip straight to the next
      for (const model of provider.models) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
          const text = await provider.call(key, model, system, messages, controller.signal);
          clearTimeout(timeout);
          if (text) {
            return new Response(JSON.stringify({ text, provider: provider.name, model }), { headers });
          }
        } catch (err) {
          clearTimeout(timeout);
          console.warn(`[StudySphere AI proxy] ${provider.name} (${model}) failed:`, err.message || err);
          // fall through to the next model / provider automatically
        }
      }
    }

    return new Response(JSON.stringify({ error: 'No configured provider could answer right now' }), { status: 502, headers });
  }
};
