"use client";

import { useMemo, useState } from "react";
import { Plus, Settings2, Boxes, Wallet, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangeFilter, ALL_TIME_RANGE, isInRange } from "@/components/ui/date-range-filter";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectConsumptionChart } from "@/components/dashboard/dashboard-charts";
import { AreaWithdrawalModal } from "@/components/area-consumption/area-withdrawal-modal";
import { AreaManagerModal } from "@/components/area-consumption/area-manager-modal";
import { matchesSearch } from "@/lib/search";
import type { AreaDTO } from "@/types/area";
import type { MovementDTO, StockOptionDTO } from "@/types/movement";

const PURPLE = "#7C6FCB";
const PRIMARY = "#3E4C6E";
const CRIT = "#D6503F";

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AreaConsumptionView({
  initialWithdrawals,
  areas,
  stock,
}: {
  initialWithdrawals: MovementDTO[];
  areas: AreaDTO[];
  stock: StockOptionDTO[];
}) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [areaList, setAreaList] = useState(areas);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(ALL_TIME_RANGE);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);

  async function refreshWithdrawals() {
    const res = await fetch("/api/area-withdrawals");
    if (res.ok) setWithdrawals(await res.json());
  }

  async function refreshAreas() {
    const res = await fetch("/api/areas");
    if (res.ok) setAreaList(await res.json());
  }

  const filtered = useMemo(
    () =>
      withdrawals.filter(
        (m) =>
          isInRange(m.date, range) &&
          matchesSearch([m.area?.name, m.stockItem.name, m.stockItem.code, m.project, m.performedBy.name, m.notes], search)
      ),
    [withdrawals, search, range]
  );

  const totalQty = filtered.reduce((a, m) => a + m.quantity, 0);
  const totalValue = filtered.reduce((a, m) => a + (m.totalCost ? Number(m.totalCost) : 0), 0);

  const byAreaValue = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of filtered) {
      const name = m.area?.name ?? "Sem área";
      map.set(name, (map.get(name) ?? 0) + (m.totalCost ? Number(m.totalCost) : 0));
    }
    return [...map.entries()].map(([project, qty]) => ({ project, qty }));
  }, [filtered]);

  const byAreaQty = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of filtered) {
      const name = m.area?.name ?? "Sem área";
      map.set(name, (map.get(name) ?? 0) + m.quantity);
    }
    return [...map.entries()].map(([project, qty]) => ({ project, qty }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Consumo por área</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Retiradas de materiais realizadas pelas áreas da instituição
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowManagerModal(true)}>
            <Settings2 size={16} /> Gerenciar áreas
          </Button>
          <Button onClick={() => setShowWithdrawalModal(true)}>
            <Plus size={16} /> Nova retirada
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Retiradas no período" value={filtered.length} color={PRIMARY} icon={ArrowDownRight} />
        <StatCard label="Itens retirados (qtd.)" value={totalQty} color={PURPLE} icon={Boxes} />
        <Card className="flex items-center justify-between">
          <div>
            <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Valor consumido no período</div>
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{fmtBRL(totalValue)}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${CRIT}1A` }}>
            <Wallet size={18} style={{ color: CRIT }} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectConsumptionChart data={byAreaQty} title="Quantidade de itens consumida por área" />
        <ProjectConsumptionChart data={byAreaValue} title="Valor consumido por área" valueFormatter={fmtBRL} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <Input
          placeholder="Buscar por área, item, projeto, responsável ou observação..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Data</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Área</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Item</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Quantidade</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Custo unit.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Valor total</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Responsável</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Observação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{fmtDate(m.date)}</td>
                <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-50">{m.area?.name ?? "—"}</td>
                <td className="px-3 py-2.5 text-zinc-900 dark:text-zinc-50">{m.stockItem.name}</td>
                <td className="px-3 py-2.5 font-medium text-brand-crit">-{m.quantity}</td>
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{m.unitCost ? fmtBRL(Number(m.unitCost)) : "—"}</td>
                <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">{m.totalCost ? fmtBRL(Number(m.totalCost)) : "—"}</td>
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{m.performedBy.name}</td>
                <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{m.notes ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {withdrawals.length === 0
                    ? "Nenhuma retirada registrada."
                    : "Nenhuma retirada encontrada para os filtros selecionados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showWithdrawalModal && (
        <AreaWithdrawalModal
          areas={areaList}
          stock={stock}
          onClose={() => setShowWithdrawalModal(false)}
          onSaved={refreshWithdrawals}
        />
      )}
      {showManagerModal && (
        <AreaManagerModal
          areas={areaList}
          onClose={() => setShowManagerModal(false)}
          onChanged={refreshAreas}
        />
      )}
    </div>
  );
}
