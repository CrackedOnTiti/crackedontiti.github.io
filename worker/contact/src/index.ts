// Contact form Worker: validate -> Turnstile (server-side) -> per-IP rate limit -> deliver.
// Delivery channels (each optional, at least one required): email via Resend, push via ntfy.
// All configured channels are tried in parallel; the request succeeds if at least one delivers.
// Responses are generic on purpose: never echo addresses, keys, the topic or internal errors.

export interface Env {
  ALLOWED_ORIGINS: string;
  TURNSTILE_SECRET: string;
  /** Full sender, a plain var: `Name <address>` on the Resend-verified domain. */
  CONTACT_FROM: string;
  /** Email channel (secrets). Enabled when both are set. */
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  /** Push channel (secrets). Enabled when NTFY_TOPIC_URL is set. NTFY_TOKEN is optional. */
  NTFY_TOPIC_URL?: string;
  NTFY_TOKEN?: string;
  /** Optional per-channel timeout in ms (default 8000). */
  DELIVERY_TIMEOUT_MS?: string;
  CONTACT_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

type Message = { name: string; contact: string; message: string };
const RESEND_URL = 'https://api.resend.com/emails';
const DEFAULT_TIMEOUT_MS = 8000;
// Deliberately strict: only a plain address becomes Reply-To; anything else stays in the body only.
const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/;

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

const bodyText = (msg: Message) =>
  `New message from the portfolio contact form.\n\nName: ${msg.name}\nReply to: ${msg.contact}\n\n${msg.message}\n`;

async function sendEmail(env: Env, msg: Message, signal: AbortSignal) {
  const payload: Record<string, unknown> = {
    from: env.CONTACT_FROM.trim(),
    to: [env.CONTACT_TO!.trim()],
    subject: `Portfolio contact: ${msg.name}`.slice(0, 150),
    text: bodyText(msg),
  };
  if (EMAIL_RE.test(msg.contact)) payload.reply_to = msg.contact;
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY!.trim()}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function publishNtfy(env: Env, msg: Message, signal: AbortSignal) {
  // JSON publishing keeps UTF-8 intact in the title. The topic is the last path segment.
  const url = new URL(env.NTFY_TOPIC_URL!);
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
    signal,
  });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}

/** Channels that are fully configured. */
export function channels(env: Env) {
  const list: Array<{ name: string; send: (env: Env, msg: Message, signal: AbortSignal) => Promise<void> }> = [];
  if (env.RESEND_API_KEY?.trim() && env.CONTACT_TO?.trim() && env.CONTACT_FROM?.trim()) list.push({ name: 'email', send: sendEmail });
  if (env.NTFY_TOPIC_URL?.trim()) list.push({ name: 'ntfy', send: publishNtfy });
  return list;
}

/**
 * Tries every configured channel in parallel and resolves true as soon as one delivers, so a
 * slow or dead channel never delays the visitor. The rest finish in the background (waitUntil)
 * so their failures are still logged. Resolves false only if every channel failed.
 */
async function deliver(env: Env, msg: Message, ctx?: ExecutionContext): Promise<boolean> {
  const list = channels(env);
  if (list.length === 0) {
    console.error('contact: no delivery channel configured');
    return false;
  }
  const ms = Number(env.DELIVERY_TIMEOUT_MS) > 0 ? Number(env.DELIVERY_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS;
  const attempts = list.map((c) =>
    c.send(env, msg, AbortSignal.timeout(ms)).catch((err: unknown) => {
      // Log the channel and the class of failure only; never the payload, address, key or topic.
      const reason = err instanceof Error ? (err.name === 'TimeoutError' ? 'timeout' : err.message) : 'unknown';
      console.error(`contact: ${c.name} failed:`, reason.replace(/https?:\/\/\S+/g, '[url]'));
      throw err;
    }),
  );
  ctx?.waitUntil(Promise.allSettled(attempts));
  try {
    await Promise.any(attempts);
    return true;
  } catch {
    return false; // AggregateError: every channel failed
  }
}

export default {
  async fetch(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
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

      return (await deliver(env, input, ctx)) ? reply('ok', corsOrigin) : reply('unavailable', corsOrigin);
    } catch (err) {
      // Log the class of failure only; never the payload, topic or token.
      console.error('contact: failure', err instanceof Error ? err.message.replace(/https?:\/\/\S+/g, '[url]') : 'unknown');
      return reply('unavailable', corsOrigin);
    }
  },
} satisfies ExportedHandler<Env>;
