"use client";

import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-900/60">
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Visualização em grade"
        aria-pressed={view === "grid"}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          view === "grid"
            ? "bg-white text-brand-primary shadow-sm dark:bg-zinc-800"
            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        }`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="Visualização em lista"
        aria-pressed={view === "list"}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          view === "list"
            ? "bg-white text-brand-primary shadow-sm dark:bg-zinc-800"
            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        }`}
      >
        <List size={16} />
      </button>
    </div>
  );
}
