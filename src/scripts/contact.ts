// Contact form: lazy-loads Cloudflare Turnstile on first interaction, then posts to the Worker.
// Turnstile is the only third-party script on the site (whitelisted in the CSP).

interface Turnstile {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id?: string): void;
}
declare global {
  interface Window { turnstile?: Turnstile }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_WAIT_MS = 15000;

const form = document.querySelector<HTMLFormElement>('form[data-contact]');
if (form) init(form);

function init(form: HTMLFormElement) {
  const endpoint = form.dataset.endpoint!;
  const sitekey = form.dataset.sitekey!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const slot = form.querySelector<HTMLElement>('[data-turnstile]')!;

  let token: string | null = null;
  let widgetId: string | undefined;
  let waiters: Array<(t: string | null) => void> = [];
  let loading: Promise<void> | null = null;

  const settle = (t: string | null) => {
    waiters.forEach((w) => w(t));
    waiters = [];
  };

  const load = () =>
    (loading ??= new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = TURNSTILE_SRC;
      s.async = true;
      s.onload = () => {
        if (!window.turnstile) return reject(new Error('turnstile'));
        widgetId = window.turnstile.render(slot, {
          sitekey,
          action: 'contact',
          theme: 'dark',
          appearance: 'interaction-only',
          callback: (t: string) => { token = t; settle(t); },
          'expired-callback': () => { token = null; },
          'error-callback': () => { token = null; settle(null); },
        });
        resolve();
      };
      s.onerror = () => { loading = null; reject(new Error('turnstile')); };
      document.head.append(s);
    }));

  const waitForToken = () =>
    token
      ? Promise.resolve(token)
      : new Promise<string | null>((resolve) => {
          waiters.push(resolve);
          setTimeout(() => resolve(null), TOKEN_WAIT_MS);
        });

  const say = (text: string, state: 'ok' | 'error' | 'busy') => {
    status.textContent = text;
    status.dataset.state = state;
  };

  const validate = () => {
    let ok = true;
    for (const el of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required]')) {
      el.value = el.value.trim();
      const valid = el.checkValidity();
      el.setAttribute('aria-invalid', String(!valid));
      if (!valid && ok) { el.focus(); ok = false; }
    }
    return ok;
  };

  form.addEventListener('focusin', () => { load().catch(() => {}); }, { once: true });
  button.disabled = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) {
      say('Please fill in every field. The message needs at least 10 characters.', 'error');
      return;
    }
    button.disabled = true;
    say('Sending…', 'busy');
    try {
      await load();
      const t = await waitForToken();
      if (!t) throw new Error('verify');
      const body = new FormData(form);
      body.set('cf-turnstile-response', t);
      const res = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.reset();
        say('Sent. I will reply through the contact you gave.', 'ok');
      } else if (res.status === 429) {
        say('Too many messages from your connection. Try again in a minute, or use LinkedIn.', 'error');
      } else {
        say('That did not go through. Check the fields and try again, or reach me on LinkedIn.', 'error');
      }
    } catch {
      say('The spam check or the connection failed. Try again, or reach me on LinkedIn.', 'error');
    } finally {
      token = null;
      if (widgetId !== undefined) window.turnstile?.reset(widgetId);
      button.disabled = false;
    }
  });
}

export {};
