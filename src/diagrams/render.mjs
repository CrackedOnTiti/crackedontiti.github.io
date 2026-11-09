// Renders a vertical flow diagram as inline SVG with real text (no images of text).
// Styling comes from classes in src/styles/global.css; no inline style attributes (CSP).
//
// Spec: { id, title, desc, steps: Step[] }
// Step: { box: Box, edge?: string } | { row: Box[], edge?: string }
// Box:  { title, sub?, kind?: 'default' | 'hot' | 'note' | 'group' }
// `edge` labels the arrow coming INTO the step.

const W = 600;          // viewBox width
const PAD = 2;
const GAP_X = 16;
const BOX_PAD_X = 20;
const TITLE = 24;       // >= 12px rendered at a 328px-wide container
const SUB = 21;
const LINE = 1.25;
const EDGE_H = 64;
const CHARS_TITLE = 0.56; // average glyph width / font size, Montserrat 600
const CHARS_SUB = 0.6;    // JetBrains Mono

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, width, size, ratio) {
  const max = Math.max(8, Math.floor(width / (size * ratio)));
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function layoutBox(box, width) {
  const inner = width - BOX_PAD_X * 2;
  const t = wrap(box.title, inner, TITLE, CHARS_TITLE);
  const s = box.sub ? wrap(box.sub, inner, SUB, CHARS_SUB) : [];
  const h = 22 + t.length * TITLE * LINE + (s.length ? 6 + s.length * SUB * LINE : 0) + 14;
  return { ...box, t, s, h, width };
}

function drawBox(b, x, y, h) {
  const kind = b.kind ?? 'default';
  let out = `<rect class="d-box d-${kind}" x="${x}" y="${y}" width="${b.width}" height="${h}" rx="2"/>`;
  let ty = y + 22 + TITLE * 0.8;
  for (const line of b.t) {
    out += `<text class="d-title" x="${x + BOX_PAD_X}" y="${ty}">${esc(line)}</text>`;
    ty += TITLE * LINE;
  }
  ty += 6 - TITLE * LINE + SUB * LINE;
  for (const line of b.s) {
    out += `<text class="d-sub" x="${x + BOX_PAD_X}" y="${ty}">${esc(line)}</text>`;
    ty += SUB * LINE;
  }
  return out;
}

const EDGE_CHAR = 20 * 0.6; // .d-edge-label size x mono glyph ratio

/** Edge label beside an arrow; flips to the left of it when it would overflow the viewBox. */
function edgeLabel(x, y, label) {
  const fitsRight = x + 14 + label.length * EDGE_CHAR <= W;
  return fitsRight
    ? `<text class="d-edge-label" x="${x + 14}" y="${y}">${esc(label)}</text>`
    : `<text class="d-edge-label" x="${x - 14}" y="${y}" text-anchor="end">${esc(label)}</text>`;
}

function arrow(x, y1, y2, label) {
  let out = `<line class="d-edge" x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 2}" marker-end="url(#d-arrow)"/>`;
  if (label) out += edgeLabel(x, (y1 + y2) / 2 + 7, label);
  return out;
}

export function renderDiagram(spec) {
  const usable = W - PAD * 2;
  let y = PAD;
  let body = '';
  let prevBottom = null;
  let prevCenters = [];

  for (const step of spec.steps) {
    const boxes = step.row ?? [step.box];
    const bw = (usable - GAP_X * (boxes.length - 1)) / boxes.length;
    const laid = boxes.map((b) => layoutBox(b, bw));
    const h = Math.max(...laid.map((b) => b.h));

    if (prevBottom !== null) {
      const top = prevBottom + EDGE_H;
      const centers = laid.map((_, i) => PAD + i * (bw + GAP_X) + bw / 2);
      if (prevCenters.length === 1 && centers.length > 1) {
        // fan out: trunk, then one arrow per box
        const mid = prevBottom + EDGE_H / 2;
        body += `<line class="d-edge" x1="${prevCenters[0]}" y1="${prevBottom}" x2="${prevCenters[0]}" y2="${mid}"/>`;
        body += `<line class="d-edge" x1="${centers[0]}" y1="${mid}" x2="${centers[centers.length - 1]}" y2="${mid}"/>`;
        centers.forEach((c) => (body += arrow(c, mid, top)));
        if (step.edge) body += edgeLabel(prevCenters[0], prevBottom + EDGE_H / 4 + 7, step.edge);
      } else if (prevCenters.length > 1 && centers.length === 1) {
        const mid = prevBottom + EDGE_H / 2;
        prevCenters.forEach((c) => (body += `<line class="d-edge" x1="${c}" y1="${prevBottom}" x2="${c}" y2="${mid}"/>`));
        body += `<line class="d-edge" x1="${prevCenters[0]}" y1="${mid}" x2="${prevCenters[prevCenters.length - 1]}" y2="${mid}"/>`;
        body += arrow(centers[0], mid, top, step.edge);
      } else {
        body += arrow(centers[0], prevBottom, top, step.edge);
      }
      y = top;
    }

    laid.forEach((b, i) => (body += drawBox(b, PAD + i * (bw + GAP_X), y, h)));
    prevBottom = y + h;
    prevCenters = laid.map((_, i) => PAD + i * (bw + GAP_X) + bw / 2);
  }

  const H = Math.ceil(prevBottom + PAD);
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
