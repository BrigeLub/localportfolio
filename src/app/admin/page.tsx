import Link from "next/link";
import { toPublic } from "@/lib/artworks";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteArtwork, logout, updateArtwork } from "./actions";
import DeleteButton from "./DeleteButton";
import Uploader from "./Uploader";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Brigitte Lubker", robots: { index: false } };

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default async function AdminPage() {
  await requireAdmin();
  const artworks = await prisma.artwork.findMany({ orderBy: { createdAt: "desc" } });
  const knownTags = [...new Set(artworks.flatMap((a) => a.tags))].sort();

  return (
    <main className="admin">
      <header className="admin__header">
        <h1>Admin</h1>
        <nav>
          <Link href="/gallery">View gallery</Link>
          <form action={logout}>
            <button className="link-button">Sign out</button>
          </form>
        </nav>
      </header>

      <Uploader knownTags={knownTags} />

      <h2>
        {artworks.length} piece{artworks.length === 1 ? "" : "s"}
      </h2>
      <ul className="admin__list">
        {artworks.map((a) => {
          const pub = toPublic(a);
          return (
            <li key={a.id} className="admin__card admin__row">
              <img
                src={pub.sources[0].url}
                alt=""
                width={a.width}
                height={a.height}
                loading="lazy"
                className={a.pixelArt ? "pixelated" : undefined}
                style={{ backgroundColor: a.color }}
              />
              <form action={updateArtwork.bind(null, a.id)} className="admin__fields">
                <label>
                  Title
                  <input name="title" defaultValue={a.title} required />
                </label>
                <label>
                  Tags <small>comma separated</small>
                  <input name="tags" defaultValue={a.tags.join(", ")} list="known-tags" />
                </label>
                <label>
                  Description
                  <textarea name="description" defaultValue={a.description} rows={2} />
                </label>
                <div className="admin__actions">
                  <label className="admin__check">
                    <input type="checkbox" name="published" defaultChecked={a.published} /> Published
                  </label>
                  <button className="admin__button">Save</button>
                  <a href={`/api/admin/original/${a.originalKey}`}>
                    Original ({a.width}×{a.height}, {mb(a.originalSize)})
                  </a>
                  <DeleteButton action={deleteArtwork.bind(null, a.id)} title={a.title} />
                </div>
              </form>
            </li>
          );
        })}
      </ul>
      <datalist id="known-tags">
        {knownTags.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </main>
  );
}
