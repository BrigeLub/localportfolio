"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = {
  file: File;
  preview: string;
  title: string;
  status: "waiting" | "uploading" | "processing" | "done" | "error";
  progress: number;
  error?: string;
};

// Listing image/heic here would make iPhones send the raw HEIC, which the
// server can't decode. Leaving it out makes Safari convert to JPEG on the way.
const ACCEPT = "image/jpeg,image/png,image/webp";

/** XHR rather than fetch: fetch still can't report upload progress. */
function send(form: FormData, onProgress: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status})`;
      try {
        message = JSON.parse(xhr.responseText).error ?? message;
      } catch {}
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and retry."));
    xhr.send(form);
  });
}

export default function Uploader({ knownTags }: { knownTags: string[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState("");
  const [pixelArt, setPixelArt] = useState(false);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const patch = (i: number, p: Partial<Item>) =>
    setItems((list) => list.map((item, j) => (j === i ? { ...item, ...p } : item)));

  const add = (files: FileList | null) => {
    if (!files) return;
    const fresh = [...files]
      .filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ""),
        status: "waiting" as const,
        progress: 0,
      }));
    setItems((list) => [...list.filter((i) => i.status !== "done"), ...fresh]);
  };

  const uploadAll = async () => {
    setBusy(true);
    // One at a time: the server processes serially anyway, and on a phone
    // connection parallel uploads just make every bar crawl.
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "done") continue;
      const form = new FormData();
      form.set("file", items[i].file);
      form.set("title", items[i].title);
      form.set("tags", tags);
      form.set("pixelArt", String(pixelArt));
      form.set("published", String(published));
      patch(i, { status: "uploading", progress: 0, error: undefined });
      try {
        await send(form, (p) => patch(i, { progress: p, status: p >= 1 ? "processing" : "uploading" }));
        patch(i, { status: "done", progress: 1 });
      } catch (err) {
        patch(i, { status: "error", error: (err as Error).message });
      }
    }
    setBusy(false);
    router.refresh();
  };

  const pending = items.filter((i) => i.status !== "done").length;

  return (
    <section className="admin__card admin__upload">
      <h2>Add artwork</h2>
      <label
        className={dragging ? "admin__drop admin__drop--over" : "admin__drop"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <input type="file" accept={ACCEPT} multiple onChange={(e) => add(e.target.files)} hidden />
        <strong>Drop images here</strong> or tap to choose. Full quality is kept.
      </label>

      {items.length > 0 && (
        <>
          <ul className="admin__queue">
            {items.map((item, i) => (
              <li key={item.preview} className={`admin__queued admin__queued--${item.status}`}>
                <img src={item.preview} alt="" />
                <div>
                  <input
                    value={item.title}
                    onChange={(e) => patch(i, { title: e.target.value })}
                    disabled={item.status !== "waiting" && item.status !== "error"}
                    aria-label="Title"
                  />
                  <progress value={item.progress} max={1} />
                  <small>
                    {item.status === "processing"
                      ? "Making web sizes…"
                      : item.status === "error"
                        ? item.error
                        : item.status === "done"
                          ? "Done"
                          : `${(item.file.size / 1024 / 1024).toFixed(1)} MB`}
                  </small>
                </div>
              </li>
            ))}
          </ul>
          <label>
            Tags for {items.length > 1 ? "these" : "this"} <small>comma separated, editable later</small>
            <input value={tags} onChange={(e) => setTags(e.target.value)} list="known-tags" placeholder={knownTags.slice(0, 3).join(", ")} />
          </label>
          <div className="admin__actions">
            <label className="admin__check">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Publish now
            </label>
            <label className="admin__check" title="Keeps hard pixel edges instead of smoothing when resized">
              <input type="checkbox" checked={pixelArt} onChange={(e) => setPixelArt(e.target.checked)} /> Pixel art
            </label>
            <button className="admin__button" onClick={uploadAll} disabled={busy || pending === 0}>
              {busy ? "Uploading…" : `Upload ${pending}`}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
