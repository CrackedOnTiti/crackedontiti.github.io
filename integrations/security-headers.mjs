// Fills the %CSP% placeholder in dist/_headers from src/lib/csp.mjs after the build,
// so the header policy and the <meta> policy can never drift apart.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildCsp } from '../src/lib/csp.mjs';

export default function securityHeaders({ endpoint }) {
  return {
    name: 'security-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const file = fileURLToPath(new URL('_headers', dir));
        const text = await readFile(file, 'utf8');
        const line = 'Content-Security-Policy: %CSP%';
        if (!text.includes(line)) throw new Error('_headers: CSP placeholder missing');
        await writeFile(file, text.replace(line, `Content-Security-Policy: ${buildCsp({ endpoint })}`));
        logger.info('CSP written to _headers');
      },
    },
  };
}
