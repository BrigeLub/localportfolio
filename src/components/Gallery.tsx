"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { PublicArtwork } from "@/lib/artworks";
import "./Gallery.css";

const srcSet = (a: PublicArtwork) => a.sources.map((s) => `${s.url} ${s.width}w`).join(", ");
const largest = (a: PublicArtwork) => a.sources[a.sources.length - 1].url;
const ratio = (a: PublicArtwork) => a.width / a.height;

function matches(a: PublicArtwork, words: string[], tag: string | null): boolean {
  if (tag && !a.tags.includes(tag)) return false;
  const haystack = `${a.title} ${a.description} ${a.tags.join(" ")}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

export default function Gallery({
  artworks,
  initialQuery,
  initialTag,
}: {
  artworks: PublicArtwork[];
  initialQuery: string;
  initialTag: string | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [tag, setTag] = useState<string | null>(initialTag);
  const [open, setOpen] = useState<number | null>(null);

  // Most-used tags first, so the broad ones (painting, pixel art) lead.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of artworks) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([t]) => t);
  }, [artworks]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return artworks.filter((a) => matches(a, words, tag));
  }, [artworks, query, tag]);

  // Keep the URL in sync so a filtered view can be shared as a link.
  useEffect(() => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (query) params.set("q", query);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, tag]);

  const filtered = tag !== null || query.trim() !== "";
  const showAll = () => {
    setTag(null);
    setQuery("");
  };

  return (
    <div className="gallery">
      <div className="filters">
        <ul className="filters__tags" aria-label="Filter by tag">
          <li>
            <button className="filter" aria-pressed={tag === null} onClick={() => setTag(null)}>
              all
            </button>
          </li>
          {tags.map((t) => (
            <li key={t}>
              <button className="filter" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                {t}
              </button>
            </li>
          ))}
        </ul>
        <label className="filters__search">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.75" />
            <path d="M13 13l4.5 4.5" />
          </svg>
          <input
            type="search"
            placeholder="search"
            aria-label="Search artwork"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {filtered && (
        <p className="gallery__status" role="status">
          {shown.length === 0
            ? "Nothing matches that. "
            : `${shown.length} ${shown.length === 1 ? "piece" : "pieces"}${tag ? ` tagged ${tag}` : ""}${
                query.trim() ? ` matching “${query.trim()}”` : ""
              }. `}
          <button className="gallery__reset" onClick={showAll}>
            Show everything
          </button>
        </p>
      )}

      {artworks.length === 0 && <p className="gallery__status">New work is on its way.</p>}

      <Wall artworks={shown} onOpen={setOpen} />

      {open !== null && shown[open] && (
        <Lightbox
          artworks={shown}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          onTag={(t) => {
            setOpen(null);
            setQuery("");
            setTag(t);
          }}
        />
      )}
    </div>
  );
}

type Row = { items: { artwork: PublicArtwork; index: number }[]; full: boolean };

/**
 * Justified rows: every piece keeps its real proportions, each row shares one
 * height and spans the full width, and the order reads left to right, newest
 * first. Pieces are added to a row until it would be at least as wide as the
 * container at the target height; the row is then scaled down to fit exactly.
 * The last row stays at the target height rather than blowing up one piece.
 */
function pack(artworks: PublicArtwork[], width: number, height: number, gap: number): Row[] {
  const rows: Row[] = [];
  let row: Row["items"] = [];
  let ratios = 0;
  artworks.forEach((artwork, index) => {
    row.push({ artwork, index });
    ratios += ratio(artwork);
    if (ratios * height + gap * (row.length - 1) >= width) {
      rows.push({ items: row, full: true });
      row = [];
      ratios = 0;
    }
  });
  if (row.length) rows.push({ items: row, full: false });
  return rows;
}

function Wall({ artworks, onOpen }: { artworks: PublicArtwork[]; onOpen: (index: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const phone = width > 0 && width < 600;
  const height = phone ? 150 : 300;
  const gap = phone ? 6 : 12;
  // Before the first measurement (the server render) there's no width to pack
  // against, so everything goes in one wrapping row at the target height.
  const rows = width ? pack(artworks, width, height, gap) : [{ items: artworks.map((artwork, index) => ({ artwork, index })), full: false }];

  return (
    <div ref={ref} className="wall" style={{ "--gap": `${gap}px` } as CSSProperties}>
      {rows.map((row) => (
        <div key={row.items[0].artwork.id} className={row.full ? "wall__row" : "wall__row wall__row--last"}>
          {row.items.map(({ artwork: a, index }) => (
            <button
              key={a.id}
              className="piece"
              onClick={() => onOpen(index)}
              aria-label={a.title}
              style={{ flex: row.full ? `${ratio(a)} 1 0` : `0 1 ${ratio(a) * height}px` }}
            >
              <img
                src={a.pixelArt ? largest(a) : a.sources[0].url}
                srcSet={a.pixelArt ? undefined : srcSet(a)}
                sizes={`(max-width: 600px) ${Math.ceil(ratio(a) * 170)}px, ${Math.ceil(ratio(a) * 340)}px`}
                width={a.width}
                height={a.height}
                alt=""
                loading={index < 9 ? "eager" : "lazy"}
                decoding="async"
                className={a.pixelArt ? "pixelated" : undefined}
                style={{ backgroundColor: a.color }}
              />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Lightbox({
  artworks,
  index,
  onIndex,
  onClose,
  onTag,
}: {
  artworks: PublicArtwork[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  onTag: (tag: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const a = artworks[index];
  const count = artworks.length;
  const prev = () => onIndex((index - 1 + count) % count);
  const next = () => onIndex((index + 1) % count);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Warm the cache for the neighbours so stepping through feels instant.
  useEffect(() => {
    for (const n of [artworks[(index + 1) % count], artworks[(index - 1 + count) % count]]) {
      const img = new Image();
      img.sizes = "(min-width: 900px) 70vw, 100vw";
      if (!n.pixelArt) img.srcset = srcSet(n);
      img.src = largest(n);
    }
  }, [artworks, index, count]);

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={a.title}
      onClose={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
      }}
    >
      <div
        className="lightbox__stage"
        onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      >
        <div className="lightbox__frame" onClick={(e) => e.target === e.currentTarget && ref.current?.close()}>
          <img
            key={a.id}
            src={largest(a)}
            srcSet={a.pixelArt ? undefined : srcSet(a)}
            sizes="(min-width: 900px) 70vw, 100vw"
            width={a.width}
            height={a.height}
            alt={a.title}
            className={a.pixelArt ? "pixelated" : undefined}
            style={{ backgroundColor: a.color, "--ar": ratio(a) } as CSSProperties}
          />
        </div>
      </div>

      <aside className="lightbox__info">
        <button className="lightbox__close filter" onClick={() => ref.current?.close()}>
          close
        </button>
        <h2>{a.title}</h2>
        {a.description && <p className="lightbox__description">{a.description}</p>}
        {a.tags.length > 0 && (
          <ul className="lightbox__tags" aria-label="Tags">
            {a.tags.map((t) => (
              <li key={t}>
                <button className="filter" onClick={() => onTag(t)}>
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
        {count > 1 && (
          <div className="lightbox__steps">
            <button className="filter" onClick={prev}>
              previous
            </button>
            <span>
              {index + 1} of {count}
            </span>
            <button className="filter" onClick={next}>
              next
            </button>
          </div>
        )}
      </aside>
    </dialog>
  );
}
