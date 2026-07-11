"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { StockCardGrid } from "@/components/stock/stock-card-grid";
import { StockListView } from "@/components/stock/stock-list-view";
import { StockModal } from "@/components/stock/stock-modal";
import { matchesSearch } from "@/lib/search";
import type { StockItemDTO } from "@/types/stock";

const VIEW_STORAGE_KEY = "estoque-view";

export function StockGrid({ initialItems }: { initialItems: StockItemDTO[] }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [editing, setEditing] = useState<StockItemDTO | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Deferido a um microtask para não disparar setState de forma síncrona
    // no corpo do efeito (ver react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "list" || stored === "grid") setView(stored);
    });
  }, []);

  function changeView(next: ViewMode) {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  const filtered = useMemo(
    () => items.filter((s) => matchesSearch([s.name, s.category, s.code], search)),
    [items, search]
  );

  async function refresh() {
    const res = await fetch("/api/stock");
    if (res.ok) setItems(await res.json());
  }

  function openEdit(item: StockItemDTO) {
    setEditing(item);
    setShowModal(true);
  }

  async function handleDelete(item: StockItemDTO) {
    if (!confirm(`Excluir "${item.name}" (${item.code})? Essa ação não pode ser desfeita.`)) return;
    setError(null);
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/stock/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível excluir o item.");
      setItems((prev) => prev.filter((s) => s.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Estoque</h1>
        <Button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Novo item
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Buscar por nome, código ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <ViewToggle view={view} onChange={changeView} />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {view === "grid" ? (
        <StockCardGrid items={filtered} onEdit={openEdit} onDelete={handleDelete} deletingId={deletingId} />
      ) : (
        <StockListView items={filtered} onEdit={openEdit} onDelete={handleDelete} deletingId={deletingId} />
      )}

      {showModal && (
        <StockModal
          item={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(undefined);
          }}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
