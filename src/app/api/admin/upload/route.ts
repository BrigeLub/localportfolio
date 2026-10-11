import { revalidatePath } from "next/cache";
import { parseTags } from "@/lib/artworks";
import { isAdmin, isSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MAX_UPLOAD_BYTES, isHeic, sniffMime, storeArtwork } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One artwork per request; the admin page sends a batch one file at a time so
 * each gets its own progress bar and a failure doesn't sink the rest.
 *
 * This is a route handler rather than a server action because server actions
 * cap request bodies at 1 MB by default and her photos are 6-8 MB. Keep it out
 * of any proxy/middleware matcher too: Next buffers proxied bodies and
 * truncates them past 10 MB.
 */
export async function POST(req: Request) {
  if (!(await isAdmin()) || !(await isSameOrigin())) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "File is over 80 MB" }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  if (isHeic(buf)) {
    return Response.json(
      {
        error:
          "HEIC photos can't be processed. Upload from your phone's browser (it converts to JPEG automatically), or export as JPEG first.",
      },
      { status: 415 },
    );
  }
  const mime = sniffMime(buf);
  if (!mime) return Response.json({ error: "Not a JPEG, PNG or WebP image" }, { status: 415 });

  const title = String(form.get("title") ?? "").trim() || file.name.replace(/\.[^.]+$/, "");
  const tags = parseTags(String(form.get("tags") ?? ""));
  const pixelArt = form.get("pixelArt") === "true";

  let processed;
  try {
    processed = await storeArtwork(buf, mime, pixelArt);
  } catch (err) {
    console.error("Image processing failed:", err);
    return Response.json({ error: "Couldn't read that image. Is the file damaged?" }, { status: 422 });
  }

  const artwork = await prisma.artwork.create({
    data: {
      title: title.slice(0, 200),
      tags,
      pixelArt,
      published: form.get("published") !== "false",
      width: processed.width,
      height: processed.height,
      color: processed.color,
      originalKey: processed.originalKey,
      originalName: file.name.slice(0, 200),
      originalSize: buf.length,
      mimeType: mime,
      widths: processed.widths,
    },
  });

  revalidatePath("/gallery");
  return Response.json({ id: artwork.id });
}
