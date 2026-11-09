// Build-time GitHub stats -> src/data/github.json. Runs in CI with GITHUB_TOKEN.
// Only repos linked as `repo:` in project frontmatter are fetched. Never fails the build:
// on any error the previous value for that repo is kept.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PROJECTS = 'src/content/projects';
const OUT = 'src/data/github.json';
const token = process.env.GITHUB_TOKEN;

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'portfolio-build',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function repoList() {
  const files = (await readdir(PROJECTS)).filter((f) => f.endsWith('.md'));
  const repos = new Set();
  for (const f of files) {
    const text = await readFile(join(PROJECTS, f), 'utf8');
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const m = front.match(/\brepo:\s*['"]?https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/);
    if (m) repos.add(m[1].replace(/\.git$/, '').toLowerCase());
  }
  return [...repos].sort();
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  let previous = { repos: {} };
  try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch {}

  const out = { generatedAt: new Date().toISOString(), repos: {} };
  for (const full of await repoList()) {
    try {
      const [repo, langs] = await Promise.all([gh(`/repos/${full}`), gh(`/repos/${full}/languages`)]);
      const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
      out.repos[full] = {
        stars: repo.stargazers_count,
        pushedAt: repo.pushed_at,
        languages: Object.fromEntries(
          Object.entries(langs)
            .map(([k, v]) => [k, Math.round((v / total) * 100)])
            .filter(([, pct]) => pct > 0),
        ),
      };
    } catch (err) {
      console.warn(`[stats] ${full}: ${err.message}; keeping previous value`);
      if (previous.repos?.[full]) out.repos[full] = previous.repos[full];
    }
  }
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`[stats] wrote ${Object.keys(out.repos).length} repos to ${OUT}`);
}

main().catch((err) => {
  console.warn(`[stats] skipped: ${err.message}`);
});
