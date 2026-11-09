# CLAUDE.md: crackedontiti portfolio

Personal portfolio of Thierry Bungaroo (CrackedOnTiti): Epitech Toulouse student specialising in
cybersecurity, on exchange at BIT Beijing until June 2027. Audience: recruiters and engineers
deciding on internships (5th-year Epitech internship, part-time then full-time) and security roles.

## Hard rules

- **Never `git commit` or `git push` on your own.** Stage changes, summarise them, and wait for
  Thierry's explicit approval. `git add`, branches, merges and tags are fine.
- **Content comes from `docs/CONTENT_BRIEF.md` only.** Do not invent metrics, dates, users, team
  sizes or claims. If something is missing, leave a visible `TODO(content)` and list it in your
  summary.
- **Nothing marked `PRIVATE` in the brief goes on the site.** No home address, phone number,
  client names, private repo stats or exact amounts.
- **No absolute security claims** ("unhackable", "no way of leakage", "100% secure"). Describe
  what was built, not guarantees.
- **No copyrighted characters or media** (no anime GIFs, game art or fan art). Text mentions of
  interests are fine.

## Stack

- Astro (static output), TypeScript, plain CSS with custom properties. No UI kit, no Tailwind
  component libraries, no CSS-in-JS.
- Content as Astro content collections: `src/content/projects/*.md`, `src/content/experience/*.md`.
  Project frontmatter: `title`, `slug`, `status` (`featured` | `built` | `building` | `origins`),
  `role`, `team`, `stack[]`, `period`, `links{}`, `order`, `summary`.
  Swapping a project between sections must only require editing `status`.
- GitHub stats (stars, last push, languages) fetched **at build time** by a scheduled GitHub
  Action into `src/data/github.json`. No client-side GitHub API calls.
- Hosting: Cloudflare Pages (project `crackedontiti`) on `crackedontiti.dev` (apex), deployed by
  GitHub Actions with `wrangler pages deploy`. `public/_headers` is the live header set.
  `crackedontiti.github.io` is redirect-only: `scripts/build-redirect.mjs` writes one stub per page
  (canonical link + meta refresh to the same path on crackedontiti.dev). Steps: `docs/DEPLOY.md`.
- No backend except the contact Worker below. Contact = form + LinkedIn + GitHub. No email address
  anywhere on the site or in the HTML.

## Contact form

- Static form posts to a **Cloudflare Worker** (`worker/contact/`, deployed on `workers.dev` for
  now, optionally routed to `crackedontiti.dev/api/contact` later).
- Worker: validate input (name, reply-to contact, message; length limits), verify **Cloudflare
  Turnstile** server-side, rate-limit per IP, then deliver: **email via Resend** (from
  `Portfolio contact <contact@crackedontiti.com>`; `RESEND_API_KEY` and the recipient `CONTACT_TO` are Worker
  secrets) and, optionally, **ntfy** (`NTFY_TOPIC_URL`, optional `NTFY_TOKEN`). Both are tried;
  success if at least one delivers. Keys, addresses and the topic live in Worker secrets
  (`wrangler secret put`), never in the frontend or repo.
- Return a generic success/error; never echo the topic or internal errors.
- Turnstile is the only allowed third-party script; whitelist it explicitly in the CSP.

## Structure

```
src/
  content/projects/     one .md per project (from CONTENT_BRIEF)
  content/experience/   one .md per role
  components/           small, single-purpose .astro components
  layouts/Base.astro
  pages/index.astro     single page: hero, featured, experience, security, built, building, origins, contact
  pages/projects/[slug].astro   detail page for featured projects
  data/github.json      generated, never hand-edited
  styles/tokens.css     all colours, type scale, spacing
public/_headers         CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors 'none'
.github/workflows/      build → Cloudflare Pages (main = prod, other branches = preview) → github.io redirect; daily stats refresh
```

## Design direction

- Dark, restrained, editorial. Palette from his GitHub README: background `#121212`/`#1A1A1A`,
  deep red `#7F1D1D`, accent red `#E11D2E` used sparingly (links, one highlight per screen),
  off-white text. Check contrast (WCAG AA minimum).
- Type: Montserrat for headings, a clean sans for body, JetBrains Mono for small technical labels
  (stack tags, dates).
- **Must not look AI-generated or templated.** Avoid: gradient blobs, glassmorphism, glowing
  cards, emoji, "Hi, I'm X 👋", three-column icon feature grids, typing animations, particle
  backgrounds, skill progress bars, stock illustrations. Prefer: strong typography, generous
  spacing, real screenshots and diagrams, asymmetric layout where it helps.
- Motion: minimal, respects `prefers-reduced-motion`.
- Future (not now): an optional, lazy-loaded "play mode" reading the same content collections.
  Do not build it; just keep content separate from presentation.

## Quality bar

- Mobile first; test at 360px, 768px, 1280px.
- Lighthouse ≥ 95 on all four categories. Total page weight on first load < 500 KB.
- Semantic HTML, keyboard navigable, visible focus, alt text on every image.
- No third-party scripts, trackers or font CDNs; self-host fonts (woff2, subset).
- Security headers: aim for an A on securityheaders.com. No inline scripts
  (so CSP can drop `unsafe-inline`).

## Working style

- Work in the phases from `docs/BUILDER_PROMPT.md`; stop at each checkpoint.
- If `REVIEW.md` exists, address every item, or explain why not, before new work.
- Keep summaries short: what changed, what's pending, any `TODO(content)`.
