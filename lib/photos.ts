/**
 * Real photographs used on the marketing site. All from Unsplash under the
 * Unsplash License (free commercial use, no attribution required); sources are
 * listed in public/photos/CREDITS.md. A slot set to null falls back to a
 * product visual, so pages never show a gap.
 */
export type Photo = { src: string; alt: string };

export const photos: Record<string, Photo | null> = {
  trader: { src: "/photos/trader.jpg", alt: "A market trader smiles at her fruit stall, phone in hand" },
  stall: { src: "/photos/stall.jpg", alt: "A stallholder gives a thumbs up at his market stand, holding a phone" },
  agent: { src: "/photos/agent.jpg", alt: "A woman carrying a basin on her head takes a phone call in the street" },
  transit: { src: "/photos/transit.jpg", alt: "A yellow Lagos danfo bus under road signs for Ibadan and Oworonshoki" },
  school: { src: "/photos/school.jpg", alt: "Pupils in uniform working at their desks in a classroom" },
  bank: { src: "/photos/bank.jpg", alt: "A young professional on a phone call at her desk" },
  shop: { src: "/photos/shop.jpg", alt: "A shopkeeper in the doorway of a market shop full of goods" },
};
