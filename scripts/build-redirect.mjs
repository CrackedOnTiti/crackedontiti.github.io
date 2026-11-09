// Builds the GitHub Pages site for crackedontiti.github.io: one redirect stub per page of dist/,
// so old deep links land on the same path on the canonical domain. No JavaScript.
// Usage: node scripts/build-redirect.mjs [distDir] [outDir]   (SITE_URL overrides the target)
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const OUT = process.argv[3] ?? 'redirect';
const TARGET = (process.env.SITE_URL || 'https://crackedontiti.dev').replace(/\/$/, '');
const HOST = new URL(TARGET).host;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function page(url) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Moved to ${esc(HOST)}</title>
<link rel="canonical" href="${esc(url)}">
<meta http-equiv="refresh" content="0; url=${esc(url)}">
</head>
<body>
<p>This site has moved to <a href="${esc(url)}">${esc(HOST)}</a>.</p>
</body>
</html>
`;
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

await rm(OUT, { recursive: true, force: true });
let n = 0;
for await (const file of htmlFiles(DIST)) {
  const rel = relative(DIST, file).split(sep).join('/');
  // 404.html: unknown old paths go to the home page.
  const path = rel === '404.html' ? '/' : '/' + rel.replace(/(^|\/)index\.html$/, '$1');
  const out = join(OUT, rel);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page(TARGET + path));
  n++;
}
console.log(`[redirect] ${n} pages -> ${TARGET}`);
