import type { CollectionEntry } from 'astro:content';

export type MediaItem = CollectionEntry<'projects'>['data']['media'][number];
export type ImageMedia = Extract<MediaItem, { image: unknown }>;

export const isImage = (m: MediaItem): m is ImageMedia => 'image' in m;

/** Requested widths that do not upscale the source; the source width itself if all of them would. */
export function widthsFor(source: { width: number }, wanted: number[]): number[] {
  const ok = wanted.filter((w) => w <= source.width);
  return ok.length > 0 ? ok : [source.width];
}

/** Phone screenshots and A4 pages: capped in height so they do not dominate a column. */
export const isTall = (m: ImageMedia) => m.image.height > m.image.width * 1.2;

/** Short label for a thumbnail button or a list. */
export const mediaLabel = (m: MediaItem) => (isImage(m) ? (m.caption ?? m.alt) : m.title);
