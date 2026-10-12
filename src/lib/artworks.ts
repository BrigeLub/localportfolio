import type { Artwork } from "@prisma/client";

/** What the public gallery needs, and nothing it shouldn't see. */
export type PublicArtwork = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  width: number;
  height: number;
  color: string;
  pixelArt: boolean;
  /** Smallest first. For pixel art, a single full-size PNG. */
  sources: { url: string; width: number }[];
};

export function toPublic(a: Artwork): PublicArtwork {
  const key = a.originalKey.split(".")[0];
  const sources = a.pixelArt
    ? [{ url: `/api/images/${key}-px.png`, width: a.width }]
    : [...a.widths].sort((x, y) => x - y).map((w) => ({ url: `/api/images/${key}-${w}.webp`, width: w }));
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    tags: a.tags,
    width: a.width,
    height: a.height,
    color: a.color,
    pixelArt: a.pixelArt,
    sources,
  };
}

/** "Oil,  Portrait, oil" -> ["oil", "portrait"] */
export function parseTags(input: string): string[] {
  const tags = input
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, " "))
    .filter((t) => t.length > 0 && t.length <= 40);
  return [...new Set(tags)].slice(0, 30);
}
