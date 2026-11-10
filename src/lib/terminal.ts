// Terminal captures (src/assets/terminal/*.txt): verbatim output, rendered as text, never as images.
const files = import.meta.glob<string>('../assets/terminal/*.txt', { query: '?raw', import: 'default', eager: true });

const byName = new Map(
  Object.entries(files).map(([path, text]) => [path.replace(/^.*\/(.+)\.txt$/, '$1'), text]),
);

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Escaped HTML for a capture: `$ ` lines are commands, `###` lines are notes from the run.
 * Only our own classes are added, so the result is safe for set:html.
 */
export function terminalHtml(name: string): string {
  const text = byName.get(name);
  if (text === undefined) throw new Error(`No terminal capture "${name}" in src/assets/terminal/`);
  return text
    .replace(/^\s*\n|\n\s*$/g, '')
    .split('\n')
    .map((line) => {
      const html = escape(line);
      if (line.startsWith('$ ')) return `<span class="t-cmd"><span class="t-prompt">$</span>${html.slice(1)}</span>`;
      if (line.startsWith('###')) return `<span class="t-note">${html}</span>`;
      return html;
    })
    .join('\n');
}
