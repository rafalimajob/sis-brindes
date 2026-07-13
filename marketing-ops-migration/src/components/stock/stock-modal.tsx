"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SaveButton, type SaveStatus } from "@/components/ui/save-button";
import { ErrorBanner } from "@/components/ui/error-banner";
import type { StockItemDTO, StockItemFormValues } from "@/types/stock";

const CATEGORIES = ["Brindes", "Materiais Gráficos", "Camisetas", "Kits", "Outros"];

function toFormValues(item?: StockItemDTO): StockItemFormValues {
  return {
    name: item?.name ?? "",
    category: item?.category ?? CATEGORIES[0],
    quantity: item?.quantity ?? 0,
    minStock: item?.minStock ?? 0,
    idealStock: item?.idealStock ?? 0,
    lastCost: item?.lastCost ?? "",
    lastPurchaseDate: item?.lastPurchaseDate ? item.lastPurchaseDate.slice(0, 10) : "",
    location: item?.location ?? "",
  };
}

export function StockModal({
  item,
  onClose,
  onSaved,
}: {
  item?: StockItemDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<StockItemFormValues>(() => toFormValues(item));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof StockItemFormValues>(key: K, value: StockItemFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("saving");
    try {
      const res = await fetch(item ? `/api/stock/${item.id}` : "/api/stock", {
        method: item ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível salvar o item.");
      onSaved();
      setStatus("success");
      setTimeout(onClose, 550);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setStatus("idle");
    }
  }

  return (
    <Modal title={item ? "Editar item de estoque" : "Novo item de estoque"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nome" value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus />

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Categoria</span>
            <input
              list="categorias-estoque"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <datalist id="categorias-estoque">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <Input
            label="Quantidade disponível"
            type="number"
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
          />
          <Input
            label="Estoque mínimo"
            type="number"
            value={form.minStock}
            onChange={(e) => set("minStock", Number(e.target.value))}
          />
          <Input
            label="Estoque ideal"
            type="number"
            value={form.idealStock}
            onChange={(e) => set("idealStock", Number(e.target.value))}
          />
          <Input
            label="Último custo (R$)"
            type="number"
            step="0.01"
            value={form.lastCost}
            onChange={(e) => set("lastCost", e.target.value)}
          />
          <Input
            label="Data da última compra"
            type="date"
            value={form.lastPurchaseDate}
            onChange={(e) => set("lastPurchaseDate", e.target.value)}
          />
          <Input
            label="Localização física"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={status !== "idle"}>
            Cancelar
          </Button>
          <SaveButton type="submit" status={status} idleLabel="Salvar item" savingLabel="Salvando..." />
        </div>
      </form>
    </Modal>
  );
}
