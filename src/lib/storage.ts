import "server-only";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Artwork files on a Railway volume (adapted from vy's storage.ts).
 *
 *   UPLOAD_DIR/originals/<key>.<ext>   the untouched upload, admin-only
 *   UPLOAD_DIR/variants/<key>-<w>.webp resized copies the public site uses
 *   UPLOAD_DIR/variants/<key>-px.png   pixel art: one lossless copy
 *
 * Resizing happens once, at upload. Doing it per request (next/image style)
 * costs ~1.5s of CPU per 2400px WebP from one of her 18MP phone photos, which
 * is a slow first view for every size of every piece.
 */

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const ORIGINALS = path.join(UPLOAD_DIR, "originals");
const VARIANTS = path.join(UPLOAD_DIR, "variants");

/**
 * Gallery thumbnails use 480/960 (1x/2x), the lightbox 1600/2400. Measured on
 * her sample photos: ~47 KB, ~180 KB, ~500 KB, ~1 MB.
 */
const WIDTHS = [480, 960, 1600, 2400];
const WEBP_QUALITY = 82;

// Uploads above this are almost certainly a mistake (an 48MP JPEG is ~25 MB).
export const MAX_UPLOAD_BYTES = 80 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Sniff the type from magic bytes rather than trusting the browser's label. */
export function sniffMime(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return "image/webp";
  return null;
}

/**
 * iPhones shoot HEIC by default, and sharp's prebuilt binaries can't decode it
 * (no HEVC codec, for patent reasons). Safari converts HEIC to JPEG on upload
 * when the file input doesn't list image/heic, so this mostly catches uploads
 * from a desktop browser.
 */
export function isHeic(buf: Buffer): boolean {
  if (buf.length < 12 || buf.subarray(4, 8).toString("ascii") !== "ftyp") return false;
  return ["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(buf.subarray(8, 12).toString("ascii"));
}

/** Volume keys are generated here, never taken from the client. */
const SAFE_NAME = /^[a-z0-9]+(-(\d+|px))?\.(jpg|png|webp)$/;

function resolveIn(dir: string, name: string): string | null {
  if (!SAFE_NAME.test(name)) return null;
  const full = path.resolve(dir, name);
  return full.startsWith(path.resolve(dir) + path.sep) ? full : null;
}

export const variantPath = (name: string) => resolveIn(VARIANTS, name);
export const originalPath = (name: string) => resolveIn(ORIGINALS, name);

export type Processed = {
  key: string;
  originalKey: string;
  width: number;
  height: number;
  color: string;
  widths: number[];
};

// One upload at a time: decoding an 18MP photo holds ~150 MB, and a batch of
// twenty in parallel would be a good way to get the container OOM-killed.
let queue: Promise<unknown> = Promise.resolve();
function serially<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.catch(() => {});
  return run;
}

export function storeArtwork(buf: Buffer, mime: string, pixelArt: boolean): Promise<Processed> {
  return serially(async () => {
    await fs.mkdir(ORIGINALS, { recursive: true });
    await fs.mkdir(VARIANTS, { recursive: true });

    const key = randomBytes(10).toString("hex");
    const originalKey = `${key}.${EXT_BY_MIME[mime]}`;
    await fs.writeFile(path.join(ORIGINALS, originalKey), buf);

    // rotate() applies the EXIF orientation. keepIccProfile() keeps her
    // phone's Display P3 profile: converting to sRGB would dull saturated
    // paint colours on any modern screen. Everything else in EXIF (camera,
    // GPS, timestamps) is stripped from the public copies by default.
    const base = sharp(buf, { failOn: "error" }).rotate().keepIccProfile();
    const meta = await base.clone().metadata();
    const swap = (meta.orientation ?? 1) >= 5;
    const width = (swap ? meta.height : meta.width) ?? 0;
    const height = (swap ? meta.width : meta.height) ?? 0;

    let widths: number[] = [];
    let colorSource: Buffer;
    if (pixelArt) {
      colorSource = await base.clone().png({ compressionLevel: 9 }).toBuffer();
      await fs.writeFile(path.join(VARIANTS, `${key}-px.png`), colorSource);
    } else {
      // Every width below the original, plus the original width itself if
      // it's smaller than the largest step, so a 2000px image still gets a
      // full-size copy.
      widths = WIDTHS.filter((w) => w < width);
      if (width <= WIDTHS[WIDTHS.length - 1]) widths.push(width);
      colorSource = Buffer.alloc(0);
      for (const w of widths) {
        const out = await base.clone().resize({ width: w }).webp({ quality: WEBP_QUALITY }).toBuffer();
        await fs.writeFile(path.join(VARIANTS, `${key}-${w}.webp`), out);
        if (colorSource.length === 0) colorSource = out;
      }
    }

    const { dominant } = await sharp(colorSource).stats();
    const color = `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`;

    return { key, originalKey, width, height, color, widths };
  });
}

export async function deleteArtworkFiles(originalKey: string, widths: number[], pixelArt: boolean): Promise<void> {
  const key = originalKey.split(".")[0];
  const names = pixelArt ? [`${key}-px.png`] : widths.map((w) => `${key}-${w}.webp`);
  const paths = [originalPath(originalKey), ...names.map(variantPath)];
  await Promise.all(
    paths.map((p) =>
      p
        ? fs.unlink(p).catch((err) => {
            if (err.code !== "ENOENT") throw err;
          })
        : null,
    ),
  );
}
