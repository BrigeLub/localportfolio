"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { PublicArtwork } from "@/lib/artworks";
import "./Gallery.css";

const srcSet = (a: PublicArtwork) => a.sources.map((s) => `${s.url} ${s.width}w`).join(", ");
const largest = (a: PublicArtwork) => a.sources[a.sources.length - 1].url;

function matches(a: PublicArtwork, words: string[], tags: string[]): boolean {
  if (!tags.every((t) => a.tags.includes(t))) return false;
  const haystack = `${a.title} ${a.description} ${a.tags.join(" ")}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

export default function Gallery({
  artworks,
  initialQuery,
  initialTags,
}: {
  artworks: PublicArtwork[];
  initialQuery: string;
  initialTags: string[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<string[]>(initialTags);
  const [open, setOpen] = useState<number | null>(null);

  // Most-used tags first.
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of artworks) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
  }, [artworks]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return artworks.filter((a) => matches(a, words, selected));
  }, [artworks, query, selected]);

  // Keep the URL in sync so a filtered view can be shared as a link.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selected.length) params.set("tags", selected.join(","));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, selected]);

  const toggleTag = (tag: string) =>
    setSelected((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));

  const showAll = () => {
    setQuery("");
    setSelected([]);
  };

  return (
    <div className="gallery">
      <div className="gallery__search">
        <input
          type="search"
          placeholder="Search by title or tag…"
          aria-label="Search artwork"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="gallery__tags">
          {allTags.map(([tag, count]) => (
            <button
              key={tag}
              className={selected.includes(tag) ? "tag tag--on" : "tag"}
              aria-pressed={selected.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag} <span className="tag__count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="gallery__empty">
          {artworks.length === 0 ? (
            "Nothing here yet."
          ) : (
            <>
              Nothing matches that.{" "}
              <button className="link-button" onClick={showAll}>
                Show everything
              </button>
            </>
          )}
        </p>
      ) : (
        <ul className="gallery__grid">
          {shown.map((a, i) => (
            <li key={a.id}>
              <button className="gallery__item" onClick={() => setOpen(i)} aria-label={`Open ${a.title}`}>
                <img
                  src={a.pixelArt ? largest(a) : a.sources[0].url}
                  srcSet={a.pixelArt ? undefined : srcSet(a)}
                  sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  width={a.width}
                  height={a.height}
                  alt={a.title}
                  loading={i < 8 ? "eager" : "lazy"}
                  decoding="async"
                  className={a.pixelArt ? "pixelated" : undefined}
                  style={{ backgroundColor: a.color }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open !== null && shown[open] && (
        <Lightbox
          artworks={shown}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          onTag={(t) => {
            setOpen(null);
            setQuery("");
            setSelected([t]);
          }}
        />
      )}
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

  // Warm the cache for the neighbours so arrowing through feels instant.
  useEffect(() => {
    for (const n of [artworks[(index + 1) % count], artworks[(index - 1 + count) % count]]) {
      const img = new Image();
      img.sizes = "90vw";
      if (!n.pixelArt) img.srcset = srcSet(n);
      img.src = largest(n);
    }
  }, [artworks, index, count]);

  return (
    <dialog
      ref={ref}
      className="lightbox"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <figure className="lightbox__figure">
        <img
          key={a.id}
          src={largest(a)}
          srcSet={a.pixelArt ? undefined : srcSet(a)}
          sizes="90vw"
          width={a.width}
          height={a.height}
          alt={a.title}
          className={a.pixelArt ? "pixelated" : undefined}
          style={{ backgroundColor: a.color, "--ratio": a.width / a.height } as CSSProperties}
        />
        <figcaption>
          <h2>{a.title}</h2>
          {a.description && <p>{a.description}</p>}
          <div className="gallery__tags">
            {a.tags.map((t) => (
              <button key={t} className="tag" onClick={() => onTag(t)}>
                {t}
              </button>
            ))}
          </div>
        </figcaption>
      </figure>
      {count > 1 && (
        <>
          <button className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous">
            ‹
          </button>
          <button className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next">
            ›
          </button>
        </>
      )}
      <button className="lightbox__close" onClick={() => ref.current?.close()} aria-label="Close">
        ×
      </button>
    </dialog>
  );
}
