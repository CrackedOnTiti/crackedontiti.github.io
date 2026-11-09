// Run: npm test (Node's built-in runner; Node strips the TypeScript types).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { type Env } from '../src/index.ts';

const ORIGIN = 'https://crackedontiti.dev';
const sent: Array<{ url: string; body: string; auth: string | null }> = [];
let siteverify = { success: true, hostname: 'crackedontiti.dev', action: 'contact' };
let allow = true;

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.includes('siteverify')) return new Response(JSON.stringify(siteverify));
  sent.push({ url, body: String(init?.body), auth: new Headers(init?.headers).get('Authorization') });
  return new Response('{}', { status: 200 });
}) as typeof fetch;

const makeEnv = (token?: string): Env => ({
  ALLOWED_ORIGINS: ORIGIN,
  TURNSTILE_SECRET: 'secret',
  NTFY_TOPIC_URL: 'https://ntfy.example/private-topic',
  ...(token === undefined ? {} : { NTFY_TOKEN: token }),
  CONTACT_LIMITER: { limit: async () => ({ success: allow }) },
});
const env = makeEnv('tk_test');

function post(fields: Record<string, string>, origin: string | null = ORIGIN, e: Env = env) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  const headers: Record<string, string> = { 'CF-Connecting-IP': '203.0.113.7' };
  if (origin) headers.Origin = origin;
  return worker.fetch(new Request('https://contact.example/', { method: 'POST', body, headers }), e);
}

const good = { name: 'Ada', contact: 'ada@example.com', message: 'Hello, about an internship.', 'cf-turnstile-response': 'tok' };

test('valid message is published to ntfy with the token, response is generic', async () => {
  sent.length = 0;
  const res = await post(good);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, 'https://ntfy.example/');
  assert.equal(sent[0].auth, 'Bearer tk_test');
  const payload = JSON.parse(sent[0].body);
  assert.equal(payload.topic, 'private-topic');
  assert.match(payload.message, /Reply to: ada@example.com/);
});

test('without NTFY_TOKEN it publishes anonymously, with no Authorization header', async () => {
  for (const e of [makeEnv(), makeEnv(''), makeEnv('   ')]) {
    sent.length = 0;
    const res = await post(good, ORIGIN, e);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].auth, null);
    assert.equal(JSON.parse(sent[0].body).topic, 'private-topic');
  }
});

test('unknown origin is rejected without CORS header', async () => {
  const res = await post(good, 'https://evil.example');
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
});

test('invalid fields are rejected', async () => {
  for (const bad of [{ ...good, name: '' }, { ...good, message: 'short' }, { ...good, message: 'x'.repeat(3001) }, { ...good, 'cf-turnstile-response': '' }]) {
    const res = await post(bad);
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, error: 'invalid' });
  }
});

test('failed Turnstile, wrong hostname or wrong action are rejected', async () => {
  for (const sv of [
    { success: false, hostname: 'crackedontiti.dev', action: 'contact' },
    { success: true, hostname: 'evil.example', action: 'contact' },
    { success: true, hostname: 'crackedontiti.dev', action: 'login' },
  ]) {
    siteverify = sv;
    sent.length = 0;
    const res = await post(good);
    assert.equal(res.status, 400);
    assert.equal(sent.length, 0);
  }
  siteverify = { success: true, hostname: 'crackedontiti.dev', action: 'contact' };
});

test('honeypot gets a fake success and nothing is sent', async () => {
  sent.length = 0;
  const res = await post({ ...good, website: 'http://spam' });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('rate limit returns 429', async () => {
  allow = false;
  const res = await post(good);
  assert.equal(res.status, 429);
  allow = true;
});

test('ntfy failure returns a generic 502 that leaks nothing', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) =>
    String(input).includes('siteverify')
      ? new Response(JSON.stringify(siteverify))
      : new Response('nope', { status: 500 })) as typeof fetch;
  const res = await post(good);
  const text = await res.text();
  assert.equal(res.status, 502);
  assert.doesNotMatch(text, /ntfy|private-topic|tk_test/);
  globalThis.fetch = realFetch;
});

test('preflight from an allowed origin succeeds, others are refused', async () => {
  const ok = await worker.fetch(new Request('https://c/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env);
  assert.equal(ok.status, 204);
  const no = await worker.fetch(new Request('https://c/', { method: 'OPTIONS', headers: { Origin: 'https://x.example' } }), env);
  assert.equal(no.status, 403);
});
