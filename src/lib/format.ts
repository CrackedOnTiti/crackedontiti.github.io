export const teamLabel = (n?: number) => (n === undefined ? undefined : n === 1 ? 'Solo' : `Team of ${n}`);

/** Projects in one section, in display order. */
export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;
