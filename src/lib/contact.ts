// Public build-time config for the contact form. Neither value is secret.
// Defaults: same-origin Worker route and the Turnstile test key. Use .env for local dev; scripts/check-launch.mjs rejects them in CI.
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'; // Cloudflare's always-pass test key

export const contactEndpoint: string = import.meta.env.PUBLIC_CONTACT_ENDPOINT || '/api/contact';
export const turnstileSiteKey: string = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;

/** 'preview' on non-main branches: the Worker only accepts the production origin. */
export const isPreview = import.meta.env.PUBLIC_DEPLOY_ENV === 'preview';

export const limits = { name: 100, contact: 200, message: 3000, messageMin: 10 } as const;
