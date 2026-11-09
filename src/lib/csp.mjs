// Single source for the Content-Security-Policy.
// Written into dist/_headers (Cloudflare Pages, the real header) and repeated as a <meta> tag
// (defence in depth, e.g. if the files are ever served from elsewhere).
// Turnstile is the only third-party origin allowed.

const TURNSTILE = 'https://challenges.cloudflare.com';

/** Origin of the contact Worker, or null when it is same-origin (/api/contact). */
export function contactOrigin(endpoint = '/api/contact') {
  try {
    return new URL(endpoint).origin;
  } catch {
    return null; // relative path => 'self'
  }
}

/**
 * @param {{ endpoint?: string, meta?: boolean }} opts
 * meta: a <meta> CSP cannot carry frame-ancestors, so it is left out there.
 */
export function buildCsp({ endpoint, meta = false } = {}) {
  const worker = contactOrigin(endpoint);
  const self = (extra = []) => ["'self'", ...extra].join(' ');
  const directives = [
    ["default-src", "'none'"],
    ['script-src', self([TURNSTILE])],
    ['style-src', "'self'"],
    ['img-src', "'self'"],
    ['font-src', "'self'"],
    ['connect-src', self(worker ? [worker] : [])],
    ['frame-src', TURNSTILE],
    ['form-action', self(worker ? [worker] : [])],
    ['base-uri', "'none'"],
    ['object-src', "'none'"],
    ['manifest-src', "'self'"],
    ...(meta ? [] : [['frame-ancestors', "'none'"]]),
    ['upgrade-insecure-requests', ''],
  ];
  return directives.map(([k, v]) => (v ? `${k} ${v}` : k)).join('; ');
}
