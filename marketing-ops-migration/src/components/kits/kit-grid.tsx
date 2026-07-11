"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KitModal } from "@/components/kits/kit-modal";
import { KitOutputModal } from "@/components/kits/kit-output-modal";
import type { KitDTO } from "@/types/kit";
import type { StockOptionDTO } from "@/types/movement";

export function KitGrid({ initialKits, stock }: { initialKits: KitDTO[]; stock: StockOptionDTO[] }) {
  const [kits, setKits] = useState(initialKits);
  const [showModal, setShowModal] = useState(false);
  const [outputKit, setOutputKit] = useState<KitDTO | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/kits");
    if (res.ok) setKits(await res.json());
  }

  async function handleDelete(kit: KitDTO) {
    if (!confirm(`Excluir o kit "${kit.name}"? Essa ação não pode ser desfeita.`)) return;
    setError(null);
    setDeletingId(kit.id);
    try {
      const res = await fetch(`/api/kits/${kit.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível excluir o kit.");
      setKits((prev) => prev.filter((k) => k.id !== kit.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Kits</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo kit
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kits.map((k) => (
          <Card key={k.id}>
            <div className="mb-2 flex items-start justify-between">
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{k.name}</div>
              <button
                type="button"
                onClick={() => handleDelete(k)}
                disabled={deletingId === k.id}
                className="text-brand-crit hover:opacity-70 disabled:opacity-40"
                aria-label="Excluir kit"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <ul className="mb-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {k.items.map((ci) => (
                <li key={ci.id}>
                  {ci.quantity}x {ci.stockItem.name}
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="w-full justify-center" onClick={() => setOutputKit(k)}>
              Registrar saída de kit
            </Button>
          </Card>
        ))}
        {kits.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum kit cadastrado.</p>}
      </div>

      {showModal && <KitModal stock={stock} onClose={() => setShowModal(false)} onSaved={refresh} />}
      {outputKit && <KitOutputModal kit={outputKit} onClose={() => setOutputKit(undefined)} onSaved={refresh} />}
    </div>
  );
}
