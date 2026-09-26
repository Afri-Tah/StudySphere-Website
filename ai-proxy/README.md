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
