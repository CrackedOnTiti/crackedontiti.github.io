// Blocks a deploy that is not ready for recruiters. Runs in CI before the build.
// Fails on: any TODO(content) left in src/, a missing or test contact config.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const TEST_SITE_KEY = '1x00000000000000000000AA';
const problems = [];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

for await (const file of walk('src')) {
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes('TODO(content)')) problems.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}

const endpoint = process.env.PUBLIC_CONTACT_ENDPOINT ?? '';
const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
if (!/^https:\/\//.test(endpoint) && !endpoint.startsWith('/')) problems.push('PUBLIC_CONTACT_ENDPOINT is not set (repo variable CONTACT_ENDPOINT)');
if (!siteKey || siteKey === TEST_SITE_KEY) problems.push('PUBLIC_TURNSTILE_SITE_KEY is missing or the test key (repo variable TURNSTILE_SITE_KEY)');

if (problems.length) {
  console.error(`Launch check failed (${problems.length}):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('Launch check passed.');
