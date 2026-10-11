import Header from "@/components/Header";
import Gallery from "@/components/Gallery";
import { toPublic } from "@/lib/artworks";
import { prisma } from "@/lib/db";

// Reads the database on each request: a few hundred rows is nothing, and it
// means a new upload shows up immediately.
export const dynamic = "force-dynamic";

export const metadata = { title: "Gallery · Brigitte Lubker" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tags?: string }>;
}) {
  const { q = "", tags = "" } = await searchParams;
  const artworks = await prisma.artwork.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <main className="contents">
        <h1>GALLERY</h1>
        <Gallery
          artworks={artworks.map(toPublic)}
          initialQuery={q}
          initialTags={tags ? tags.split(",") : []}
        />
      </main>
    </>
  );
}
