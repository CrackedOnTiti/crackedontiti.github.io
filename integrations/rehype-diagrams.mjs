// Replaces <div data-diagram="name"></div> in Markdown with the inline SVG from src/diagrams/specs.mjs.
import { renderDiagram } from '../src/diagrams/render.mjs';
import { specs } from '../src/diagrams/specs.mjs';

const RE = /^\s*<div data-diagram="([a-z0-9-]+)"><\/div>\s*$/;

function svgFor(name) {
  const spec = specs[name];
  if (!spec) throw new Error(`Unknown diagram "${name}"`);
  return renderDiagram(spec);
}

export default function rehypeDiagrams() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'raw') {
          const m = child.value.match(RE);
          if (m) return { type: 'raw', value: svgFor(m[1]) };
        }
        if (child.type === 'element' && child.tagName === 'div' && child.properties?.dataDiagram) {
          return { type: 'raw', value: svgFor(String(child.properties.dataDiagram)) };
        }
        visit(child);
        return child;
      });
    };
    visit(tree);
  };
}
