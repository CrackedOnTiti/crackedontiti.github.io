// Contact form Worker: validate -> Turnstile (server-side) -> per-IP rate limit -> ntfy.
// Responses are generic on purpose: never echo the topic, the token or internal errors.

export interface Env {
  ALLOWED_ORIGINS: string;
  TURNSTILE_SECRET: string;
  NTFY_TOPIC_URL: string;
  /** Optional: ntfy access token. Unset = anonymous publish (e.g. ntfy.sh with a long random topic). */
  NTFY_TOKEN?: string;
  CONTACT_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

export const LIMITS = { name: 100, contact: 200, message: 3000, messageMin: 10, body: 16_384 } as const;
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type Outcome = 'ok' | 'invalid' | 'forbidden' | 'rate_limited' | 'verification_failed' | 'unavailable';
const STATUS: Record<Outcome, number> = {
  ok: 200,
  invalid: 400,
  forbidden: 403,
  rate_limited: 429,
  verification_failed: 400,
  unavailable: 502,
};

function reply(outcome: Outcome, origin: string | null, extra: Record<string, string> = {}): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin',
    ...extra,
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify({ ok: outcome === 'ok', ...(outcome === 'ok' ? {} : { error: outcome }) }), {
    status: STATUS[outcome],
    headers,
  });
}

/** Trim, normalise newlines, drop control characters other than \n and \t. */
export function clean(value: unknown, singleLine: boolean): string {
  if (typeof value !== 'string') return '';
  let v = value.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
  if (singleLine) v = v.replace(/\s+/g, ' ');
  return v.trim();
}

export function validate(form: FormData) {
  const name = clean(form.get('name'), true);
  const contact = clean(form.get('contact'), true);
  const message = clean(form.get('message'), false);
  const honeypot = clean(form.get('website'), true);
  const token = clean(form.get('cf-turnstile-response'), true);
  const ok =
    name.length >= 1 && name.length <= LIMITS.name &&
    contact.length >= 3 && contact.length <= LIMITS.contact &&
    message.length >= LIMITS.messageMin && message.length <= LIMITS.message &&
    token.length > 0 && token.length <= 2048;
  return { ok, honeypot: honeypot.length > 0, name, contact, message, token };
}

async function verifyTurnstile(env: Env, token: string, ip: string, allowedHosts: Set<string>) {
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  body.append('idempotency_key', crypto.randomUUID());
  const res = await fetch(SITEVERIFY, { method: 'POST', body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean; hostname?: string; action?: string };
  return data.success === true && data.action === 'contact' && !!data.hostname && allowedHosts.has(data.hostname);
}

async function publish(env: Env, msg: { name: string; contact: string; message: string }) {
  // JSON publishing keeps UTF-8 intact in the title. The topic is the last path segment.
  const url = new URL(env.NTFY_TOPIC_URL);
  const topic = url.pathname.split('/').filter(Boolean).pop();
  if (!topic) throw new Error('bad topic url');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = env.NTFY_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${url.origin}/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      topic,
      title: `Portfolio: ${msg.name}`.slice(0, 150),
      message: `From: ${msg.name}\nReply to: ${msg.contact}\n\n${msg.message}`,
      tags: ['envelope'],
    }),
  });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = new Set(env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean));
    const origin = request.headers.get('Origin');
    const corsOrigin = origin && allowed.has(origin) ? origin : null;

    if (request.method === 'OPTIONS') {
      if (!corsOrigin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Accept, Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        },
      });
    }
    if (request.method !== 'POST') return reply('invalid', corsOrigin, { Allow: 'POST, OPTIONS' });
    if (!corsOrigin) return reply('forbidden', null);

    const length = Number(request.headers.get('Content-Length') ?? '0');
    if (length > LIMITS.body) return reply('invalid', corsOrigin);

    const ip = request.headers.get('CF-Connecting-IP') ?? '';
    try {
      const { success } = await env.CONTACT_LIMITER.limit({ key: ip || 'unknown' });
      if (!success) return reply('rate_limited', corsOrigin);

      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        return reply('invalid', corsOrigin);
      }
      const input = validate(form);
      if (!input.ok) return reply('invalid', corsOrigin);
      // Bots that fill the hidden field get a normal-looking success and nothing is sent.
      if (input.honeypot) return reply('ok', corsOrigin);

      const hosts = new Set([...allowed].map((o) => new URL(o).hostname));
      if (!(await verifyTurnstile(env, input.token, ip, hosts))) return reply('verification_failed', corsOrigin);

      await publish(env, input);
      return reply('ok', corsOrigin);
    } catch (err) {
      // Log the class of failure only; never the payload, topic or token.
      console.error('contact: failure', err instanceof Error ? err.message.replace(/https?:\/\/\S+/g, '[url]') : 'unknown');
      return reply('unavailable', corsOrigin);
    }
  },
} satisfies ExportedHandler<Env>;
