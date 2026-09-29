/**
 * Real photographs used on the marketing site, with their licence source.
 * A slot set to null falls back to a product visual, so pages never show a gap.
 * Files live in /public/photos; see public/photos/CREDITS.md.
 */
export type Photo = { src: string; alt: string };

export const photos: Record<string, Photo | null> = {
  trader: null,
  shop: null,
  bank: null,
  agent: null,
  transit: null,
  school: null,
};
