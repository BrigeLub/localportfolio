import fs from "node:fs/promises";
import { variantPath } from "@/lib/storage";

export const runtime = "nodejs";
// Reads from the mounted volume, so it can't be prerendered at build time.
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { webp: "image/webp", png: "image/png" };

/**
 * Public resized copies. Keys are random and never reused, so a given URL's
 * bytes never change: cache forever. With Cloudflare proxying the domain,
 * most requests never reach Railway at all.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const full = variantPath(name);
  const type = TYPES[name.split(".").pop() ?? ""];
  if (!full || !type) return new Response("Not found", { status: 404 });

  let file: Buffer;
  try {
    file = await fs.readFile(full);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(file.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
