# StudySphere shared AI proxy

Holds real free-tier API keys server-side (Cloudflare Workers, free tier,
no credit card) so students get working AI tools with **zero signup**,
and if one provider's free quota runs dry, the next configured one is
tried automatically — no visible outage.

Full setup instructions are in the comment block at the top of
`worker.js` — takes about 5 minutes, all through Cloudflare's dashboard,
no command line needed. Short version:

1. Free account at https://dash.cloudflare.com
2. Workers & Pages → Create Worker → paste in `worker.js` → Deploy
3. Settings → Variables and secrets → add a secret for each provider you
   want (just one to start): `GROQ_API_KEY`, `GEMINI_API_KEY`,
   `OPENROUTER_API_KEY`, `HACKCLUB_API_KEY`
4. Copy your Worker's URL into `tools/assets/tools-common.js` →
   `SS_AI_PROXY_URL`

## Using FreeLLMAPI as the main AI source (optional)

[FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) pools many
free-tier providers behind one OpenAI-compatible endpoint and does its own
routing and failover. When configured, the Worker tries it **first** and
falls back to Groq / Gemini / OpenRouter / Hack Club as before.

1. Run FreeLLMAPI somewhere **publicly reachable over https** (a small VPS
   with Docker is enough — see its install guide). `http://localhost:3001`
   only exists on your own computer; a Cloudflare Worker cannot reach it.
2. In the FreeLLMAPI dashboard, add your provider keys and copy the unified
   key from the Keys page.
3. In the Worker: add the **secret** `FREELLMAPI_KEY` (the unified key) and
   the plain variable `FREELLMAPI_BASE_URL` (e.g. `https://llm.example.com`,
   no trailing `/v1`). Optionally set `FREELLMAPI_MODEL` (default `auto`;
   `auto:fast` and `auto:smart` also work).

Notes: FreeLLMAPI describes itself as for personal experimentation, and
each upstream provider's terms still apply to traffic you send through it.
Keep `PROXY_SHARED_SECRET` set so strangers can't spend your pooled quota,
and never put the unified key in the site's JS. If the router is down or
slow (25s limit), requests simply continue to the next provider. A failed
request returns a `tried` list of provider/error pairs to help debugging.

## Prefer the command line?

`wrangler.toml` is included if you'd rather deploy with the [Wrangler
CLI](https://developers.cloudflare.com/workers/wrangler/):

```
npm install -g wrangler
wrangler login
wrangler secret put GROQ_API_KEY        # repeat for whichever providers you want
wrangler deploy
```

## Why this instead of putting keys in the site itself?

Anything in the static site's HTML/JS is visible to any visitor via "View
Source" — a key placed there gets scraped and drained within days, then
banned by the provider. A serverless proxy is the standard fix: the key
lives only in Cloudflare's encrypted secret store and is never sent to
the browser; the site only ever talks to your Worker, which does the
actual provider calls on the server side.

This doesn't remove the "AI Keys" option already on the site — a student
can still add their own personal key there as a private backup. The site
tries the shared proxy first and only falls back to a student's own key
if the proxy is unreachable or hasn't been set up yet.

## When the AI suddenly stops working: model IDs

Free tiers retire models every few months. When that happens every request
fails and the tools show the offline outline. You don't need to edit code:
in the Worker's **Settings → Variables and secrets**, add a plain variable
with a comma-separated list (best first) and redeploy:

| Variable | Example |
| --- | --- |
| `GROQ_MODELS` | `openai/gpt-oss-120b,openai/gpt-oss-20b` |
| `GEMINI_MODELS` | `gemini-3.5-flash-lite,gemini-2.5-flash` |
| `OPENROUTER_MODELS` | `nvidia/nemotron-3-super-120b-a12b:free` |
| `HACKCLUB_MODELS` | `qwen/qwen3-32b` |

Current model names: Groq https://console.groq.com/docs/models,
Gemini https://ai.google.dev/gemini-api/docs/models,
OpenRouter https://openrouter.ai/models?q=free. The Worker's logs (and the
`tried` list in failed responses) show which model each provider rejected.
