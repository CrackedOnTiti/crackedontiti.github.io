// Run: npm test (Node's built-in runner; Node strips the TypeScript types).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { type Env } from '../src/index.ts';

const ORIGIN = 'https://crackedontiti.dev';
const TO = 'owner@inbox.example';
const KEY = 're_test_key';
const TOPIC_URL = 'https://ntfy.example/private-topic';

type Behaviour = 'ok' | 'fail' | 'throw' | 'hang';
interface Call { service: 'resend' | 'ntfy'; url: string; body: string; headers: Headers }

let calls: Call[] = [];
let siteverify = { success: true, hostname: 'crackedontiti.dev', action: 'contact' };
let behaviour: Record<'resend' | 'ntfy', Behaviour> = { resend: 'ok', ntfy: 'ok' };
let allow = true;

beforeEach(() => {
  calls = [];
  siteverify = { success: true, hostname: 'crackedontiti.dev', action: 'contact' };
  behaviour = { resend: 'ok', ntfy: 'ok' };
  allow = true;
});

// Routes by URL: Turnstile siteverify, Resend, or ntfy. 'hang' waits until the request is aborted.
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.includes('siteverify')) return new Response(JSON.stringify(siteverify));
  const service = url.startsWith('https://api.resend.com/') ? 'resend' : 'ntfy';
  calls.push({ service, url, body: String(init?.body), headers: new Headers(init?.headers) });
  switch (behaviour[service]) {
    case 'ok': return new Response('{}', { status: 200 });
    case 'fail': return new Response('nope', { status: 500 });
    case 'throw': throw new TypeError('network error');
    case 'hang':
      return new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
      });
  }
}) as typeof fetch;

function makeEnv(o: { email?: boolean; ntfy?: boolean; ntfyToken?: string } = {}): Env {
  const { email = true, ntfy = true, ntfyToken } = o;
  return {
    ALLOWED_ORIGINS: ORIGIN,
    TURNSTILE_SECRET: 'secret',
    CONTACT_FROM: 'Portfolio contact <contact@crackedontiti.com>',
    ...(email ? { RESEND_API_KEY: KEY, CONTACT_TO: TO } : {}),
    ...(ntfy ? { NTFY_TOPIC_URL: TOPIC_URL } : {}),
    ...(ntfyToken === undefined ? {} : { NTFY_TOKEN: ntfyToken }),
    DELIVERY_TIMEOUT_MS: '50',
    CONTACT_LIMITER: { limit: async () => ({ success: allow }) },
  };
}

function post(fields: Record<string, string>, env: Env = makeEnv(), origin: string | null = ORIGIN) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  const headers: Record<string, string> = { 'CF-Connecting-IP': '203.0.113.7' };
  if (origin) headers.Origin = origin;
  return worker.fetch(new Request('https://contact.example/', { method: 'POST', body, headers }), env);
}

const good = { name: 'Ada', contact: 'ada@example.com', message: 'Hello, about an internship.', 'cf-turnstile-response': 'tok' };
const byService = (s: Call['service']) => calls.filter((c) => c.service === s);

// ── Delivery ─────────────────────────────────────────────────────────────────

test('both channels configured: email and ntfy are both sent, response is generic', async () => {
  const res = await post(good);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(byService('resend').length, 1);
  assert.equal(byService('ntfy').length, 1);
});

test('email: Resend request has the key, sender, recipient, and the reply contact in the body', async () => {
  await post(good, makeEnv({ ntfy: false }));
  const [mail] = byService('resend');
  assert.equal(mail.url, 'https://api.resend.com/emails');
  assert.equal(mail.headers.get('Authorization'), `Bearer ${KEY}`);
  assert.ok(mail.headers.get('Idempotency-Key'));
  const payload = JSON.parse(mail.body);
  assert.equal(payload.from, 'Portfolio contact <contact@crackedontiti.com>');
  assert.deepEqual(payload.to, [TO]);
  assert.equal(payload.subject, 'Portfolio contact: Ada');
  assert.match(payload.text, /Reply to: ada@example\.com/);
  assert.match(payload.text, /Hello, about an internship\./);
  assert.equal(payload.html, undefined, 'plain text only');
  assert.equal(payload.reply_to, 'ada@example.com');
});

test('email: reply_to is only set when the contact is a plain email address', async () => {
  for (const contact of ['linkedin.com/in/ada', '+33 6 00 00 00 00', 'ada@example.com, evil@example.com']) {
    calls = [];
    await post({ ...good, contact }, makeEnv({ ntfy: false }));
    const payload = JSON.parse(byService('resend')[0].body);
    assert.equal(payload.reply_to, undefined, contact);
    assert.ok(payload.text.includes(`Reply to: ${contact}`), contact);
  }
});

test('email delivers, ntfy fails (500, network error or timeout): still a success', async () => {
  for (const b of ['fail', 'throw', 'hang'] as const) {
    behaviour = { resend: 'ok', ntfy: b };
    const res = await post(good);
    assert.equal(res.status, 200, `ntfy ${b}`);
    assert.deepEqual(await res.json(), { ok: true });
  }
});

test('a hanging channel does not delay the response once another has delivered', async () => {
  behaviour = { resend: 'ok', ntfy: 'hang' };
  const env = { ...makeEnv(), DELIVERY_TIMEOUT_MS: '5000' };
  const pending: Promise<unknown>[] = [];
  const ctx = { waitUntil: (p: Promise<unknown>) => pending.push(p), passThroughOnException() {} };
  const body = new FormData();
  for (const [k, v] of Object.entries(good)) body.append(k, v);
  const started = Date.now();
  const res = await worker.fetch(
    new Request('https://contact.example/', { method: 'POST', body, headers: { Origin: ORIGIN, 'CF-Connecting-IP': '203.0.113.7' } }),
    env,
    ctx as unknown as ExecutionContext,
  );
  assert.equal(res.status, 200);
  assert.ok(Date.now() - started < 1000, 'answered without waiting for the 5 s timeout');
  assert.equal(pending.length, 1, 'remaining channel handed to waitUntil');
});

test('ntfy delivers, email fails (500, network error or timeout): still a success', async () => {
  for (const b of ['fail', 'throw', 'hang'] as const) {
    behaviour = { resend: b, ntfy: 'ok' };
    const res = await post(good);
    assert.equal(res.status, 200, `resend ${b}`);
  }
});

test('both channels fail: generic 502 that leaks no key, address or topic', async () => {
  behaviour = { resend: 'fail', ntfy: 'hang' };
  const res = await post(good);
  const text = await res.text();
  assert.equal(res.status, 502);
  assert.deepEqual(JSON.parse(text), { ok: false, error: 'unavailable' });
  for (const secret of [KEY, TO, 'private-topic', 'resend', 'ntfy']) assert.ok(!text.includes(secret), secret);
});

test('only email configured: ntfy is never called', async () => {
  const res = await post(good, makeEnv({ ntfy: false }));
  assert.equal(res.status, 200);
  assert.equal(byService('ntfy').length, 0);
  assert.equal(byService('resend').length, 1);
});

test('only ntfy configured: email is never called', async () => {
  const res = await post(good, makeEnv({ email: false }));
  assert.equal(res.status, 200);
  assert.equal(byService('resend').length, 0);
  assert.equal(byService('ntfy').length, 1);
});

test('email needs both RESEND_API_KEY and CONTACT_TO', async () => {
  const env = { ...makeEnv({ ntfy: false }), CONTACT_TO: '  ' };
  const res = await post(good, env);
  assert.equal(res.status, 502);
  assert.equal(calls.length, 0);
});

test('no channel configured: 502 and nothing is sent', async () => {
  const res = await post(good, makeEnv({ email: false, ntfy: false }));
  assert.equal(res.status, 502);
  assert.equal(calls.length, 0);
});

test('ntfy with NTFY_TOKEN sends it; without (unset, empty, spaces) it publishes anonymously', async () => {
  await post(good, makeEnv({ email: false, ntfyToken: 'tk_test' }));
  assert.equal(byService('ntfy')[0].headers.get('Authorization'), 'Bearer tk_test');
  for (const ntfyToken of [undefined, '', '   ']) {
    calls = [];
    const res = await post(good, makeEnv({ email: false, ntfyToken }));
    assert.equal(res.status, 200);
    const [push] = byService('ntfy');
    assert.equal(push.headers.get('Authorization'), null);
    assert.equal(push.url, 'https://ntfy.example/');
    const payload = JSON.parse(push.body);
    assert.equal(payload.topic, 'private-topic');
    assert.match(payload.message, /Reply to: ada@example\.com/);
  }
});

// ── Gatekeeping (nothing is sent on any of these) ────────────────────────────

test('unknown origin is rejected without CORS header', async () => {
  const res = await post(good, makeEnv(), 'https://evil.example');
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(calls.length, 0);
});

test('invalid fields are rejected', async () => {
  for (const bad of [{ ...good, name: '' }, { ...good, message: 'short' }, { ...good, message: 'x'.repeat(3001) }, { ...good, 'cf-turnstile-response': '' }]) {
    const res = await post(bad);
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, error: 'invalid' });
  }
  assert.equal(calls.length, 0);
});

test('failed Turnstile, wrong hostname or wrong action are rejected', async () => {
  for (const sv of [
    { success: false, hostname: 'crackedontiti.dev', action: 'contact' },
    { success: true, hostname: 'evil.example', action: 'contact' },
    { success: true, hostname: 'crackedontiti.dev', action: 'login' },
  ]) {
    siteverify = sv;
    const res = await post(good);
    assert.equal(res.status, 400);
  }
  assert.equal(calls.length, 0);
});

test('honeypot gets a fake success and nothing is sent', async () => {
  const res = await post({ ...good, website: 'http://spam' });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test('rate limit returns 429', async () => {
  allow = false;
  const res = await post(good);
  assert.equal(res.status, 429);
  assert.equal(calls.length, 0);
});

test('preflight from an allowed origin succeeds, others are refused', async () => {
  const env = makeEnv();
  const ok = await worker.fetch(new Request('https://c/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env);
  assert.equal(ok.status, 204);
  const no = await worker.fetch(new Request('https://c/', { method: 'OPTIONS', headers: { Origin: 'https://x.example' } }), env);
  assert.equal(no.status, 403);
});
