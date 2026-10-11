"use client";

export default function DeleteButton({ action, title }: { action: () => Promise<void>; title: string }) {
  return (
    <button
      type="button"
      className="admin__delete"
      onClick={async () => {
        if (confirm(`Delete "${title}"? This removes the original too and can't be undone.`)) await action();
      }}
    >
      Delete
    </button>
  );
}
