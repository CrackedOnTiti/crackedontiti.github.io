// The site's one module: tabs, featured-project expanders, carousel, media galleries, and the contact form.
// Everything here is progressive enhancement: without it, the page is one long, complete document.
// No inline styles or scripts (CSP): state goes through attributes, classes and CSS custom properties.
import './contact';

document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = (): ScrollBehavior => (reducedMotion.matches ? 'auto' : 'smooth');

/* ------------------------------------------------------------------ tabs */

// Old section anchors (site v2) still land on the right tab.
const LEGACY_HASH: Record<string, string> = {
  featured: 'work',
  built: 'work',
  building: 'work',
  origins: 'work',
};

function initTabs() {
  const bar = document.querySelector<HTMLElement>('[data-tabbar]');
  const inner = bar?.querySelector<HTMLElement>('[data-tabbar-inner]');
  const links = inner ? [...inner.querySelectorAll<HTMLAnchorElement>('a[data-tab]')] : [];
  if (!bar || !inner || links.length === 0) return;

  const panels = new Map<string, HTMLElement>();
  for (const a of links) {
    const panel = document.getElementById(a.dataset.tab!);
    if (panel) panels.set(a.dataset.tab!, panel);
  }
  const ids = [...panels.keys()];
  if (ids.length === 0) return;

  // Replace the links with an ARIA tablist of real buttons.
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Sections');
  list.className = 'tablist';
  const tabs = new Map<string, HTMLButtonElement>();
  for (const a of links) {
    const id = a.dataset.tab!;
    const panel = panels.get(id);
    if (!panel) continue;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = a.className;
    b.id = `tab-${id}`;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', id);
    b.append(...a.childNodes);
    b.addEventListener('click', () => select(id, { history: 'push', focus: false }));
    tabs.set(id, b);
    list.append(b);

    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', b.id);
    panel.tabIndex = 0;
    panel.classList.add('is-tab');
  }
  inner.replaceChildren(list);

  list.addEventListener('keydown', (e) => {
    const current = ids.indexOf((document.activeElement as HTMLElement | null)?.id.replace(/^tab-/, '') ?? '');
    if (current < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (current + 1) % ids.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + ids.length) % ids.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = ids.length - 1;
    if (next < 0) return;
    e.preventDefault();
    // Arrow keys replace the history entry so Back does not step through every tab passed over.
    select(ids[next], { history: 'replace', focus: true });
  });

  let active = '';

  function select(id: string, opts: { history?: 'push' | 'replace'; focus?: boolean; scroll?: boolean } = {}) {
    if (!panels.has(id)) id = ids[0];
    const changed = id !== active;
    active = id;
    for (const [key, tab] of tabs) {
      const on = key === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels.get(key)!.hidden = !on;
    }
    const tab = tabs.get(id)!;
    if (opts.focus) tab.focus({ preventScroll: true });
    revealTab(tab);

    if (opts.history) {
      const url = `${location.pathname}${location.search}#${id}`;
      if (location.hash !== `#${id}`) history[opts.history === 'push' ? 'pushState' : 'replaceState'](null, '', url);
    }
    // Keep the start of the new panel in view: if the page is scrolled past the tab bar, go back to it.
    if ((changed || opts.scroll) && (opts.scroll || window.scrollY > barTop())) {
      window.scrollTo({ top: barTop(), behavior: 'auto' });
    }
  }

  // Where the bar sits when not stuck: the top of the visible panel minus the bar's height.
  // (A stuck sticky element reports its stuck position, so it cannot be measured directly.)
  const barTop = () =>
    Math.max(0, panels.get(active)!.getBoundingClientRect().top + window.scrollY - bar.offsetHeight);

  // On narrow screens the tab row scrolls sideways; bring the active tab into it without moving the page.
  function revealTab(tab: HTMLElement) {
    const r = tab.getBoundingClientRect();
    const c = inner!.getBoundingClientRect();
    const pad = 16;
    if (r.left < c.left) inner!.scrollBy({ left: r.left - c.left - pad, behavior: motion() });
    else if (r.right > c.right) inner!.scrollBy({ left: r.right - c.right + pad, behavior: motion() });
  }

  // Which tab a hash points to: a tab id, an element inside a panel, or a legacy section id.
  function fromHash(): string | null {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (!raw) return null;
    if (panels.has(raw)) return raw;
    if (LEGACY_HASH[raw]) return LEGACY_HASH[raw];
    const el = document.getElementById(raw);
    const panel = el?.closest<HTMLElement>('[data-panel]');
    return panel && panels.has(panel.id) ? panel.id : null;
  }

  // Following a #hash focuses its target; for a whole panel that only paints a page-sized focus ring.
  const dropTargetFocus = () => {
    const el = document.activeElement as HTMLElement | null;
    if (el?.matches('[data-panel]')) el.blur();
  };

  const initial = fromHash();
  select(initial ?? ids[0]);
  if (initial) {
    // The browser already jumped to the (then-stacked) section; line the tab bar up with the top instead.
    window.scrollTo({ top: barTop(), behavior: 'auto' });
    dropTargetFocus();
    // The browser may focus the fragment target only after load.
    window.addEventListener('load', () => setTimeout(dropTargetFocus), { once: true });
  }

  // Back/Forward, and in-page links such as href="#contact".
  const onNav = () => {
    const id = fromHash();
    select(id ?? ids[0], { scroll: id !== null });
    dropTargetFocus();
  };
  window.addEventListener('popstate', onNav);
  window.addEventListener('hashchange', onNav);
}

/* ------------------------------------------------------------- expanders */

// Featured projects: one open at a time. Closed panels are inert (out of the tab order and the
// accessibility tree); the height animation itself is CSS (grid-template-rows 0fr → 1fr).
function initExpanders() {
  const items = [...document.querySelectorAll<HTMLElement>('[data-expander]')].flatMap((row) => {
    const button = row.querySelector<HTMLButtonElement>('[data-expander-toggle]');
    const panel = row.querySelector<HTMLElement>('[data-expander-panel]');
    return button && panel ? [{ row, button, panel }] : [];
  });
  if (items.length === 0) return;

  const set = (item: (typeof items)[number], open: boolean) => {
    item.button.setAttribute('aria-expanded', String(open));
    item.panel.dataset.open = String(open);
    item.panel.inert = !open;
  };

  for (const item of items) {
    set(item, item.row.hasAttribute('data-default-open'));
    item.button.addEventListener('click', () => {
      const opening = item.button.getAttribute('aria-expanded') !== 'true';
      for (const other of items) set(other, other === item ? opening : false);
    });
  }
  // Transitions only after the first state is applied, so nothing animates on load.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    for (const { row } of items) row.dataset.ready = '';
  }));
}

/* -------------------------------------------------------------- carousel */

function initCarousel() {
  const root = document.querySelector<HTMLElement>('[data-carousel]');
  if (!root) return;
  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  const slides = [...root.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
  const controls = root.querySelector<HTMLElement>('[data-carousel-controls]');
  const picker = root.querySelector<HTMLElement>('[data-carousel-picker]');
  const counter = root.querySelector<HTMLElement>('[data-carousel-counter]');
  const current = root.querySelector<HTMLElement>('[data-carousel-current]');
  const picks = [...root.querySelectorAll<HTMLButtonElement>('[data-carousel-go]')];
  if (!track || slides.length < 2 || !controls || !picker || !counter || !current) return;

  const pad = (n: number) => String(n).padStart(2, '0');
  const title = (slide: HTMLElement) => slide.querySelector('h4')?.textContent?.trim() ?? '';
  let index = 0;

  const go = (n: number) => {
    index = (n + slides.length) % slides.length;
    // A CSS custom property set through the CSSOM: allowed by the CSP (no style attribute in the HTML).
    track.style.setProperty('--slide', String(index));
    slides.forEach((slide, i) => { slide.inert = i !== index; });
    picks.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
    counter.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
    current.textContent = `, ${title(slides[index])}`;
  };

  root.classList.add('is-live');
  controls.hidden = false;
  picker.hidden = false;
  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => go(index - 1));
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => go(index + 1));
  picks.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.carouselGo))));

  // Swipe on touch: horizontal moves only, so vertical scrolling is untouched (touch-action: pan-y).
  let startX = 0;
  let startY = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  go(0);
}

/* -------------------------------------------------------------- galleries */

// Project media (MediaSlot): one item at a time, thumbnails switch. Without the script every item
// is stacked and the thumbnails stay hidden.
function initGalleries() {
  for (const root of document.querySelectorAll<HTMLElement>('[data-gallery]')) {
    const frames = [...root.querySelectorAll<HTMLElement>('[data-gallery-frame]')];
    const thumbs = root.querySelector<HTMLElement>('[data-gallery-thumbs]');
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-gallery-go]')];
    if (frames.length < 2 || !thumbs) continue;
    const show = (n: number) => {
      frames.forEach((f, i) => { f.hidden = i !== n; });
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
    };
    buttons.forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.galleryGo))));
    thumbs.hidden = false;
    show(0);
  }
}

initTabs();
initExpanders();
initCarousel();
initGalleries();
