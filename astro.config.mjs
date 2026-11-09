// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { unified } from '@astrojs/markdown-remark';
import securityHeaders from './integrations/security-headers.mjs';
import rehypeDiagrams from './integrations/rehype-diagrams.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Canonical origin. Changing domain = set the SITE_URL repo variable, nothing else.
const site = env.SITE_URL || 'https://crackedontiti.dev';
const endpoint = env.PUBLIC_CONTACT_ENDPOINT || '/api/contact';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Every stylesheet ships as a file so the CSP never needs 'unsafe-inline'.
    inlineStylesheets: 'never',
    assets: '_astro',
  },
  vite: {
    // Never inline scripts or assets as data: URIs.
    build: { assetsInlineLimit: 0 },
  },
  markdown: {
    // Diagrams: <div data-diagram="name"></div> in Markdown becomes inline SVG.
    processor: unified({ rehypePlugins: [rehypeDiagrams] }),
  },
  integrations: [securityHeaders({ endpoint })],
  devToolbar: { enabled: false },
});
