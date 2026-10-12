import fs from "node:fs/promises";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { originalPath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download the untouched upload. Admin-only: originals keep their EXIF. */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const { name } = await ctx.params;
  const full = originalPath(name);
  const artwork = full ? await prisma.artwork.findFirst({ where: { originalKey: name } }) : null;
  if (!full || !artwork) return new Response("Not found", { status: 404 });

  const file = await fs.readFile(full);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": artwork.mimeType,
      "Content-Length": String(file.length),
      "Content-Disposition": `attachment; filename="${artwork.originalName.replace(/[^\w.\- ]/g, "_")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
