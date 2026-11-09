# Deploy runbook

How the site goes live on **crackedontiti.dev** (Cloudflare Pages) with
**crackedontiti.github.io** reduced to a redirect. Everything here is done once, by hand, in this
order. Secrets are only ever typed into a prompt or a dashboard field, never into a file.

```
push to main ─► build (launch check, stats, astro build, redirect stubs)
               └─► Cloudflare Pages "crackedontiti" (production)
                   └─► smoke test: https://crackedontiti.dev returns 200 with THIS build's marker
                       ├─ pass ─► GitHub Pages ─► crackedontiti.github.io = redirect
                       └─ fail ─► redirect skipped, run marked failed, github.io unchanged
push to any other branch ─► Cloudflare Pages preview only (<branch>.crackedontiti.pages.dev)
```

Names used below: Pages project `crackedontiti`, Worker `contact`.

---

## 1. Cloudflare: the domain

1. **Add the zone.** Dashboard → *Add a domain* → `crackedontiti.dev` → Free plan.
   If the domain is registered elsewhere, change its nameservers at the registrar to the two
   Cloudflare gives you and wait until the zone shows **Active**. (If you bought it through
   Cloudflare Registrar, it is already active.)
2. **SSL/TLS → Edge Certificates:** *Always Use HTTPS* **On**, *Minimum TLS Version* **1.2**.
   (`.dev` is on the browser HSTS preload list, so HTTPS is mandatory anyway.)
3. **Leave Web Analytics off** for this site: it injects a third-party script, which the CSP
   blocks and the site promises not to have.

## 2. Cloudflare: Turnstile widget

Dashboard → **Turnstile** → *Add widget*:

- Widget name: `crackedontiti contact`
- Hostnames: `crackedontiti.dev`
- Widget mode: **Managed**
- Pre-clearance: **No**

Keep the page open: you need the **Site key** (public) in step 6 and the **Secret key** in step 4.

## 3. Cloudflare: API token and account ID for GitHub Actions

1. Dashboard → *My Profile* → **API Tokens** → *Create Token* → *Create Custom Token*:
   - Token name: `github-actions-pages-crackedontiti`
   - Permissions: **Account** · **Cloudflare Pages** · **Edit** (nothing else)
   - Account Resources: *Include* → your account
   - Client IP filtering: none. TTL: optional (if you set one, note the renewal date).
   Create, and copy the token once.
2. **Account ID:** Dashboard → *Workers & Pages* → right-hand column *Account ID* → copy.

## 4. Contact Worker

From the repo root, on your machine:

```sh
cd worker/contact
npm ci
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET   # paste the Turnstile Secret key (step 2)
npx wrangler secret put NTFY_TOPIC_URL     # e.g. https://ntfy.sh/<your-topic>
npx wrangler secret put NTFY_TOKEN         # optional: only if your ntfy topic needs a token
                                           # (ntfy.sh, no account: skip it; use a long random topic)
npm test && npm run typecheck
npx wrangler deploy
```

`wrangler deploy` prints the URL, `https://contact.<your-subdomain>.workers.dev`. Copy it for step 6.
The Worker only accepts requests whose `Origin` is `https://crackedontiti.dev`.

## 5. Cloudflare Pages project

Create the project once (Direct Upload, production branch `main`):

```sh
cd ../..            # repo root
npx wrangler pages project create crackedontiti --production-branch=main
```

Then attach the domain: Dashboard → *Workers & Pages* → **crackedontiti** → *Custom domains* →
*Set up a custom domain* → `crackedontiti.dev` → *Continue* → *Activate domain*. Cloudflare creates
the apex record and the certificate; wait for **Active**. The domain has no content until the first
deploy in step 7.

**www (optional but recommended):**
1. *DNS* → *Records* → *Add record*: Type `AAAA`, Name `www`, IPv6 `100::`, Proxy **on**.
2. *Rules* → *Redirect Rules* → *Create rule* → template **Redirect from WWW to root** (or custom:
   hostname equals `www.crackedontiti.dev` → dynamic `concat("https://crackedontiti.dev", http.request.uri.path)`,
   status **301**, preserve query string).

## 6. GitHub repository settings

Repo **CrackedOnTiti/crackedontiti.github.io** → *Settings*:

1. *Secrets and variables* → *Actions* → **Secrets** → *New repository secret*:
   - `CLOUDFLARE_API_TOKEN` = token from step 3
   - `CLOUDFLARE_ACCOUNT_ID` = account ID from step 3
2. Same page → **Variables** tab → *New repository variable*:
   - `CONTACT_ENDPOINT` = Worker URL from step 4
   - `TURNSTILE_SITE_KEY` = Turnstile Site key from step 2
   - `SITE_URL` = `https://crackedontiti.dev` (optional; this is the default)
3. *Pages* → *Build and deployment* → *Source*: **GitHub Actions**.
   Do **not** set a custom domain here: github.io must stay the redirect.
   **Do this before merging into `main`.** While the source is "Deploy from a branch", every push to
   `main` makes GitHub publish the raw branch with Jekyll (no index page, `docs/` exposed). After
   switching, open https://crackedontiti.github.io once to confirm the old site still loads; it stays
   up until the redirect job replaces it.
4. Optional hardening: *Environments* → `production` → *Deployment branches*: **Selected branches**
   → `main`. (The workflow creates `production`, `preview` and `github-pages` on first run.)

## 7. First deploy

1. Push the branch first, without merging: it deploys a **preview** only, at
   `https://site-v2.crackedontiti.pages.dev`. Check it. Preview builds show a note in place of the
   contact form (the Worker only accepts the production origin); everything else should work.
2. Make sure the custom domain from step 5 shows **Active**.
3. Merge into `main` and push. The workflow deploys production to Cloudflare, then the **smoke** job
   fetches https://crackedontiti.dev up to 10 times over ~5 minutes and requires HTTP 200, the page
   title and `<meta name="build" content="<commit SHA>">`. Only then does the **redirect** job replace
   github.io. If the smoke test fails, the run is red with the reason, and github.io keeps serving
   whatever it served before. Fix the cause (usually the domain not Active yet) and re-run the
   workflow.
4. Send yourself a message through the form on https://crackedontiti.dev right away (previews show a
   note instead of the form, so production is the first place it can be tested end to end).

## 8. Verify

```sh
curl -sI https://crackedontiti.dev | grep -iE 'HTTP/|content-security|strict-transport|x-frame|referrer|permissions'
curl -s https://crackedontiti.github.io/projects/sentinel/ | grep -E 'canonical|refresh'
```

- securityheaders.com on `https://crackedontiti.dev` → aim for **A**.
- Send yourself a message through the form; it should arrive in ntfy within seconds.
- `https://crackedontiti.github.io/` should land on `https://crackedontiti.dev/`.
- Other repos' project pages (e.g. `crackedontiti.github.io/Glados_Documentation/`, `/AREA/`) are
  separate repos and keep working.

## Later

- **Worker on the same origin (optional):** route it at `crackedontiti.dev/api/contact` by adding
  `"routes": [{ "pattern": "crackedontiti.dev/api/contact", "zone_name": "crackedontiti.dev" }]` to
  `worker/contact/wrangler.jsonc`, redeploying it, and setting `CONTACT_ENDPOINT` to `/api/contact`.
  The CSP then drops the workers.dev origin automatically.
- **Token hygiene:** the API token only has Pages:Edit on this account. Rotate it if it leaks:
  roll it in the dashboard and update the GitHub secret.
- **Scheduled refresh:** GitHub disables the daily schedule after 60 days without repo activity.
  If the footer's "GitHub stats as of" date gets stale, re-enable it under *Actions*.
