"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MovementModal } from "@/components/movements/movement-modal";
import { MOVEMENT_TYPE_LABEL } from "@/lib/movement-types";
import type { MovementDTO, StockOptionDTO } from "@/types/movement";

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function MovementTable({
  initialMovements,
  stock,
}: {
  initialMovements: MovementDTO[];
  stock: StockOptionDTO[];
}) {
  const [movements, setMovements] = useState(initialMovements);
  const [showModal, setShowModal] = useState(false);

  async function refresh() {
    const res = await fetch("/api/movements");
    if (res.ok) setMovements(await res.json());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Movimentações</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nova movimentação
        </Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Data</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Item</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Quantidade</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Projeto/Campanha</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Responsável</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Observação</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => {
              const signed = m.direction === "ENTRADA" ? m.quantity : -m.quantity;
              return (
                <tr key={m.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{fmtDateTime(m.date)}</td>
                  <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-50">{MOVEMENT_TYPE_LABEL[m.type]}</td>
                  <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-50">{m.stockItem.name}</td>
                  <td className={`px-3 py-2.5 font-medium ${signed > 0 ? "text-brand-ok" : "text-brand-crit"}`}>
                    {signed > 0 ? "+" : ""}
                    {signed}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{m.project ?? "—"}</td>
                  <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{m.performedBy.name}</td>
                  <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{m.notes ?? "—"}</td>
                </tr>
              );
            })}
            {movements.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Nenhuma movimentação registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showModal && <MovementModal stock={stock} onClose={() => setShowModal(false)} onSaved={refresh} />}
    </div>
  );
}
