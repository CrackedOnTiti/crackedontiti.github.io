// Renders a vertical flow diagram as inline SVG with real text (no images of text).
// Styling comes from classes in src/styles/global.css; no inline style attributes (CSP).
//
// Sizing: the SVG scales with its container. global.css caps .diagram at 26rem, so one viewBox unit
// is ~0.82px on a 360px phone (328px column) and ~1.04px on desktop (416px). With the sizes below,
// the smallest text (edge labels) renders at ~13px on mobile and ~16.6px on desktop.
//
// Spec:  { id, title, desc, caption?, steps: Step[] }
// Step:  { box, edge? }                one box, arrow from the previous step (label = edge)
//      | { row: Box[], edge? }         boxes side by side (fan-out / fan-in arrows)
//      | { box, detached: true }       a box with no arrow into it (e.g. a background job)
//      | { split: { left: { edge }, right: { edge?, boxes: Box[], out? } } }
//                                      two lanes from the previous box: the left lane is a single
//                                      arrow straight to the next step, the right lane a stack of
//                                      boxes. Both lanes end in the next step, which must be a box.
// Box:   { title, sub?, kind?: 'default' | 'hot' | 'note' }

const W = 400;
const PAD = 2;
const GAP_X = 12;
const BOX_PAD_X = 14;
const TITLE = 20;
const SUB = 17;
const EDGE = 16;
const LINE = 1.25;
const EDGE_H = 56;
const DETACHED_GAP = 40;
const TITLE_RATIO = 0.58; // average glyph width / font size, Montserrat 600 (conservative)
const SUB_RATIO = 0.61;   // JetBrains Mono
const EDGE_RATIO = 0.61;

// Split lanes
const LEFT_X = 40;            // x of the straight-through arrow
const RIGHT_X = 128;          // left edge of the right lane's boxes
const RIGHT_W = W - PAD - RIGHT_X;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, width, size, ratio) {
  const max = Math.max(4, Math.floor(width / (size * ratio)));
  const lines = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function layoutBox(box, width) {
  const inner = width - BOX_PAD_X * 2;
  const t = wrap(box.title, inner, TITLE, TITLE_RATIO);
  const s = box.sub ? wrap(box.sub, inner, SUB, SUB_RATIO) : [];
  const h = 14 + t.length * TITLE * LINE + (s.length ? 4 + s.length * SUB * LINE : 0) + 10;
  return { ...box, t, s, h, width };
}

function drawBox(b, x, y, h) {
  const kind = b.kind ?? 'default';
  let out = `<rect class="d-box d-${kind}" x="${x}" y="${y}" width="${b.width}" height="${h}" rx="2"/>`;
  let ty = y + 14 + TITLE * 0.85;
  for (const line of b.t) {
    out += `<text class="d-title" x="${x + BOX_PAD_X}" y="${ty}">${esc(line)}</text>`;
    ty += TITLE * LINE;
  }
  ty += 4 - TITLE * LINE + SUB * LINE;
  for (const line of b.s) {
    out += `<text class="d-sub" x="${x + BOX_PAD_X}" y="${ty}">${esc(line)}</text>`;
    ty += SUB * LINE;
  }
  return out;
}

const textWidth = (s) => s.length * EDGE * EDGE_RATIO;

function textBlock(lines, x, y, anchor) {
  const a = anchor === 'end' ? ' text-anchor="end"' : '';
  const top = y - ((lines.length - 1) * EDGE * LINE) / 2;
  return lines
    .map((l, i) => `<text class="d-edge-label" x="${x}" y="${top + i * EDGE * LINE}"${a}>${esc(l)}</text>`)
    .join('');
}

/**
 * Label beside a vertical arrow at x, centred on y. Never leaves [minX, maxX]:
 * right of the arrow if it fits, else left, else wrapped onto several lines, else clamped.
 */
function edgeLabel(x, y, label, minX = PAD, maxX = W - PAD) {
  const w = textWidth(label);
  if (x + 12 + w <= maxX) return textBlock([label], x + 12, y);
  if (x - 12 - w >= minX) return textBlock([label], x - 12, y, 'end');
  const rightRoom = maxX - (x + 12);
  const leftRoom = x - 12 - minX;
  if (rightRoom >= leftRoom) return textBlock(wrap(label, rightRoom, EDGE, EDGE_RATIO), x + 12, y);
  return textBlock(wrap(label, leftRoom, EDGE, EDGE_RATIO), x - 12, y, 'end');
}

const line = (x1, y1, x2, y2) => `<line class="d-edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const arrow = (x, y1, y2) =>
  `<line class="d-edge" x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 2}" marker-end="url(#d-arrow)"/>`;

export function renderDiagram(spec) {
  const usable = W - PAD * 2;
  let body = '';
  let bottom = null;     // y where the previous step ends
  let centers = [];      // x centres of the previous step's boxes
  let pendingSplit = null;

  for (const step of spec.steps) {
    if (step.split) {
      // Left lane: arrow from the previous box straight to the next step (drawn once we know where).
      // Right lane: stack of boxes.
      const from = centers[0];
      const right = step.split.right;
      const rightCx = RIGHT_X + RIGHT_W / 2;
      const fork = bottom + 18;
      body += line(from, bottom, from, fork);
      body += line(LEFT_X, fork, rightCx, fork);
      let y = bottom + EDGE_H;
      body += arrow(rightCx, fork, y);
      if (right.edge) body += edgeLabel(rightCx, (fork + y) / 2 + 6, right.edge, RIGHT_X - 4);
      right.boxes.forEach((b, i) => {
        const laid = layoutBox(b, RIGHT_W);
        if (i > 0) { body += arrow(rightCx, y, y + EDGE_H); y += EDGE_H; }
        body += drawBox(laid, RIGHT_X, y, laid.h);
        y += laid.h;
      });
      pendingSplit = { fork, rightBottom: y, rightCx, left: step.split.left, out: right.out };
      bottom = y;
      centers = [rightCx];
      continue;
    }

    const boxes = step.row ?? [step.box];
    const bw = (usable - GAP_X * (boxes.length - 1)) / boxes.length;
    const laid = boxes.map((b) => layoutBox(b, bw));
    const h = Math.max(...laid.map((b) => b.h));
    const next = laid.map((_, i) => PAD + i * (bw + GAP_X) + bw / 2);
    let top = PAD;

    if (pendingSplit) {
      if (boxes.length !== 1) throw new Error(`${spec.id}: the step after a split must be a single box`);
      const { fork, rightBottom, rightCx, left, out } = pendingSplit;
      top = rightBottom + EDGE_H;
      body += arrow(rightCx, rightBottom, top);
      if (out) body += edgeLabel(rightCx, (rightBottom + top) / 2 + 6, out);
      body += arrow(LEFT_X, fork, top);
      if (left.edge) body += edgeLabel(LEFT_X, (fork + top) / 2, left.edge, PAD, RIGHT_X - 8);
      pendingSplit = null;
    } else if (bottom !== null && step.detached) {
      top = bottom + DETACHED_GAP;
    } else if (bottom !== null) {
      top = bottom + EDGE_H;
      if (centers.length === 1 && next.length > 1) {
        const mid = bottom + EDGE_H / 2;
        body += line(centers[0], bottom, centers[0], mid);
        body += line(next[0], mid, next[next.length - 1], mid);
        next.forEach((c) => (body += arrow(c, mid, top)));
        if (step.edge) body += edgeLabel(centers[0], bottom + EDGE_H / 4 + 6, step.edge);
      } else if (centers.length > 1 && next.length === 1) {
        const mid = bottom + EDGE_H / 2;
        centers.forEach((c) => (body += line(c, bottom, c, mid)));
        body += line(centers[0], mid, centers[centers.length - 1], mid);
        body += arrow(next[0], mid, top);
        if (step.edge) body += edgeLabel(next[0], mid + EDGE_H / 4 + 6, step.edge);
      } else {
        body += arrow(next[0], bottom, top);
        if (step.edge) body += edgeLabel(next[0], (bottom + top) / 2 + 6, step.edge);
      }
    }

    laid.forEach((b, i) => (body += drawBox(b, PAD + i * (bw + GAP_X), top, h)));
    bottom = top + h;
    centers = next;
  }

  const H = Math.ceil(bottom + PAD);
  const tid = `${spec.id}-title`;
  const did = `${spec.id}-desc`;
  return (
    `<figure class="diagram">` +
    `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${tid} ${did}" xmlns="http://www.w3.org/2000/svg">` +
    `<title id="${tid}">${esc(spec.title)}</title><desc id="${did}">${esc(spec.desc)}</desc>` +
    `<defs><marker id="d-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="d-arrowhead" d="M0 0 L10 5 L0 10 z"/></marker></defs>` +
    body +
    `</svg>` +
    (spec.caption ? `<figcaption>${esc(spec.caption)}</figcaption>` : '') +
    `</figure>`
  );
}
