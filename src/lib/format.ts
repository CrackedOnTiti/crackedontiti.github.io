export const teamLabel = (n?: number) => (n === undefined ? undefined : n === 1 ? 'Solo' : `Team of ${n}`);

export const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export const dayMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Projects in one section, in display order. */
export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;
