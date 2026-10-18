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
//        FREELLMAPI_KEY      - (optional) unified key of your FreeLLMAPI router;
//                              ALSO add a plain variable FREELLMAPI_BASE_URL
//                              = its public https address. Tried first.
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

// Free-tier model IDs get retired every few months (that is what silently broke
// this Worker in 2026). Each provider's list below is only a default: set
// GROQ_MODELS / GEMINI_MODELS / OPENROUTER_MODELS / HACKCLUB_MODELS in the
// Worker's Variables (comma-separated, best first) to change it from the
// Cloudflare dashboard without editing or redeploying any code.
function modelsFrom(env, varName, defaults) {
  const list = String(env[varName] || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.length ? list : defaults;
}

const PROVIDERS = [
  {
    // FreeLLMAPI (https://github.com/tashfeenahmed/freellmapi) — a self-hosted
    // router that pools ~34 free-tier providers behind ONE OpenAI-compatible
    // /v1 endpoint, with its own smart routing and automatic failover. It is
    // tried first; if it is unset, down, or slow, the direct providers below
    // still work exactly as before.
    //
    // It must be reachable from Cloudflare, so FREELLMAPI_BASE_URL has to be a
    // public https URL (e.g. https://llm.yourdomain.com) — a localhost:3001
    // address only exists on your own computer and the Worker cannot reach it.
    //   FREELLMAPI_BASE_URL  - origin only, no trailing /v1  (plain variable)
    //   FREELLMAPI_KEY       - the "freellmapi-..." unified key (SECRET)
    //   FREELLMAPI_MODEL     - optional; default "auto" (or "auto:fast" etc.)
    id: 'freellmapi',
    name: 'FreeLLMAPI',
    envKey: 'FREELLMAPI_KEY',
    needsEnv: ['FREELLMAPI_BASE_URL'],
    timeoutMs: 25000,
    models: (env) => [env.FREELLMAPI_MODEL || 'auto'],
    async call(key, model, system, messages, signal, env) {
      const base = String(env.FREELLMAPI_BASE_URL).replace(/\/+$/, '').replace(/\/v1$/, '');
      const res = await fetch(`${base}/v1/chat/completions`, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0.6, max_tokens: 2500,
          messages: [{ role: 'system', content: system }, ...messages] })
      });
      if (!res.ok) throw new Error(`FreeLLMAPI/${model} → HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  },
  {
    id: 'groq',
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    // Groq retired the Llama 3.x/Gemma models on its free tier; its own
    // deprecations page names these gpt-oss models as the replacements.
    models: (env) => modelsFrom(env, 'GROQ_MODELS', ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']),
    async call(key, model, system, messages, signal) {
      const reasoning = model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {};
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        // gpt-oss models "think" first; a small max_tokens can be used up before
        // any answer text appears, so leave room.
        body: JSON.stringify({ model, temperature: 0.6, max_tokens: 2500, ...reasoning,
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
    // gemini-2.0-flash was shut down on 2026-06-01. Several current IDs are
    // listed because failures just move on to the next one; override with
    // GEMINI_MODELS once you see which one your key can use.
    models: (env) => modelsFrom(env, 'GEMINI_MODELS', ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash']),
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
    // Free OpenRouter models change often (llama-3.3-70b is no longer free).
    // Check https://openrouter.ai/models?q=free and set OPENROUTER_MODELS to
    // update without touching code.
    models: (env) => modelsFrom(env, 'OPENROUTER_MODELS', ['nvidia/nemotron-3-super-120b-a12b:free', 'google/gemma-4-31b-it:free']),
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
    models: (env) => modelsFrom(env, 'HACKCLUB_MODELS', ['qwen/qwen3-32b']),
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

    // The site gives up on this Worker after 30s (see ssAIProxyCall), so stop
    // trying new providers once ~27s have passed — otherwise a long run of
    // failures would make the browser abandon a request that might have
    // succeeded a moment later.
    const deadline = Date.now() + 27000;
    const tried = [];

    for (const provider of PROVIDERS) {
      const key = env[provider.envKey];
      if (!key) continue; // this provider has no secret configured — skip straight to the next
      if (provider.needsEnv && provider.needsEnv.some(v => !env[v])) continue; // e.g. FREELLMAPI_BASE_URL not set
      const models = typeof provider.models === 'function' ? provider.models(env) : provider.models;
      for (const model of models) {
        const remaining = deadline - Date.now();
        if (remaining < 1500) break;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), Math.min(provider.timeoutMs || 30000, remaining));
        try {
          const text = await provider.call(key, model, system, messages, controller.signal, env);
          clearTimeout(timeout);
          if (text) {
            return new Response(JSON.stringify({ text, provider: provider.name, model }), { headers });
          }
          tried.push(`${provider.id}/${model}: empty reply`);
        } catch (err) {
          clearTimeout(timeout);
          const reason = err.name === 'AbortError' ? 'timeout' : (err.message || String(err));
          tried.push(`${provider.id}/${model}: ${reason}`);
          console.warn(`[StudySphere AI proxy] ${provider.name} (${model}) failed:`, reason);
          // fall through to the next model / provider automatically
        }
      }
    }

    // `tried` holds only provider names and error codes (no keys) — it makes
    // "why is the AI down?" answerable from the browser's network tab.
    return new Response(JSON.stringify({ error: 'No configured provider could answer right now', tried }), { status: 502, headers });
  }
};
