export const teamLabel = (n?: number) => (n === undefined ? undefined : n === 1 ? 'Solo' : `Team of ${n}`);

/** Projects in one section, in display order. */
export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** The project's write-up page, if it has one: every featured project, plus any with `writeup: true`. */
export const writeupHref = (p: { status: string; slug: string; writeup?: boolean }) =>
  p.status === 'featured' || p.writeup ? `/projects/${p.slug}/` : null;
