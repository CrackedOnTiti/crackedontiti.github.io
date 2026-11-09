# Contact Worker

Receives the portfolio contact form, checks it, and sends it to ntfy as a push notification.

Order of checks: allowed `Origin` → per-IP rate limit (3/min) → field validation and honeypot →
Turnstile `siteverify` (success, `action = contact`, hostname in `ALLOWED_ORIGINS`) → ntfy publish
with an access token if `NTFY_TOKEN` is set (anonymous otherwise). Every response is a generic `{ ok, error? }`.

## Secrets

Secrets are typed into the prompt and never written to a file in the repo:

```sh
cd worker/contact
npm ci
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET   # Turnstile widget secret key
npx wrangler secret put NTFY_TOPIC_URL     # e.g. https://ntfy.sh/<topic>
npx wrangler secret put NTFY_TOKEN         # optional: ntfy access token (tk_...)
                                           # skip it for anonymous ntfy.sh with a long random topic
```

## Deploy

```sh
npm test && npm run typecheck
npx wrangler deploy        # prints https://contact.<your-subdomain>.workers.dev
```

Then set the repository variables (Settings → Secrets and variables → Actions → Variables):
`CONTACT_ENDPOINT` = the workers.dev URL, `TURNSTILE_SITE_KEY` = the widget's site key.

`ALLOWED_ORIGINS` in `wrangler.jsonc` is `https://crackedontiti.dev` only. Pages previews
(`*.pages.dev`) cannot send messages on purpose; add an origin there only to test, then remove it.
The full deploy runbook is in `docs/DEPLOY.md`.

## Local development

`.dev.vars` (gitignored) holds local secrets for `npx wrangler dev`. With Cloudflare's test secret
`1x0000000000000000000000000000000AA` and the site's default test site key, Turnstile always passes.
Add `http://localhost:4321` to `ALLOWED_ORIGINS` locally only (`--var` flag), never in `wrangler.jsonc`.
