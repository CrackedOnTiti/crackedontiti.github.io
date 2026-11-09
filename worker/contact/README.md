# Contact Worker

Receives the portfolio contact form, checks it, and delivers it by email (Resend) and/or as a push
notification (ntfy).

Order of checks: allowed `Origin` → per-IP rate limit (3/min) → field validation and honeypot →
Turnstile `siteverify` (success, `action = contact`, hostname in `ALLOWED_ORIGINS`) → delivery.
Every response is a generic `{ ok, error? }`.

**Delivery.** Each channel is optional; at least one must be configured. All configured channels
are tried in parallel with an 8 s timeout each. The visitor gets "sent" as soon as **one** delivers;
a slow or dead channel never delays them (it finishes in the background via `waitUntil`). The
request fails only if every channel fails. Failures are logged as channel + status class only
(never the address, key or topic).

| Channel | Enabled when | Notes |
|---|---|---|
| Email (Resend) | `RESEND_API_KEY` and `CONTACT_TO` are set | Plain text, from `CONTACT_FROM` (var, `Portfolio contact <contact@crackedontiti.com>`). The visitor's reply contact is in the body; it also becomes `Reply-To` when it is a plain email address. |
| Push (ntfy) | `NTFY_TOPIC_URL` is set | `NTFY_TOKEN` optional; without it, publishes anonymously (use a long random topic). |

## Secrets

Secrets are typed into the prompt and never written to a file in the repo:

```sh
cd worker/contact
npm ci
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET   # Turnstile widget secret key

# Email channel (Resend)
npx wrangler secret put RESEND_API_KEY     # Resend API key (re_...), "Sending access" only
npx wrangler secret put CONTACT_TO         # your inbox address

# Push channel (ntfy), optional
npx wrangler secret put NTFY_TOPIC_URL     # e.g. https://ntfy.sh/<long-random-topic>
npx wrangler secret put NTFY_TOKEN         # optional: only if the topic needs a token

npx wrangler secret list                   # names only; values are never shown
```

To turn a channel off later: `npx wrangler secret delete NTFY_TOPIC_URL` (or `RESEND_API_KEY`).

## Resend sender domain

`CONTACT_FROM` must be on a domain verified in Resend. `crackedontiti.com` is verified (Resend →
*Domains* shows it **Verified**). Create the API key under *API Keys* with permission
**Sending access**, restricted to `crackedontiti.com`.

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
