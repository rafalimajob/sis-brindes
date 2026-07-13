"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, AlertTriangle, CheckCircle2, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBarChart, OrdersEvolutionChart, ProjectConsumptionChart } from "@/components/dashboard/dashboard-charts";
import { DateRangeFilter, currentMonthRange, isInRange } from "@/components/ui/date-range-filter";
import { ORDER_STATUS_VALUES, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { MOVEMENT_TYPE_LABEL } from "@/lib/movement-types";
import { CHART_COLORS } from "@/lib/theme-colors";
import type { MovementTypeValue } from "@/lib/movement-types";
import type { OrderStatusValue } from "@/lib/order-status";
import type { OrderDTO } from "@/types/order";
import type { MovementDTO } from "@/types/movement";
import type { StockItemDTO } from "@/types/stock";

const { purple: PURPLE, warn: WARN, crit: CRIT, primary: PRIMARY, ok: OK } = CHART_COLORS;

export function DashboardClient({
  orders,
  stock,
  movements,
}: {
  orders: OrderDTO[];
  stock: StockItemDTO[];
  movements: MovementDTO[];
}) {
  const [range, setRange] = useState(currentMonthRange);

  const periodOrders = useMemo(
    () => orders.filter((o) => isInRange(o.requestDate, range)),
    [orders, range]
  );
  const deliveredInPeriod = useMemo(
    () => orders.filter((o) => o.status === "ENTREGUE" && o.deliveredDate && isInRange(o.deliveredDate, range)),
    [orders, range]
  );
  const periodMovements = useMemo(
    () => movements.filter((m) => isInRange(m.date, range)),
    [movements, range]
  );

  const emAndamento = periodOrders.filter((o) => o.status !== "ENTREGUE" && o.status !== "CANCELADO").length;
  const today = new Date().toISOString().slice(0, 10);
  const atrasados = periodOrders.filter(
    (o) => o.status !== "ENTREGUE" && o.status !== "CANCELADO" && o.expectedDate && o.expectedDate.slice(0, 10) < today
  ).length;
  const entregues = deliveredInPeriod.length;
  const totalItens = stock.reduce((a, s) => a + s.quantity, 0);
  const abaixoMin = stock.filter((s) => s.quantity < s.minStock).length;

  const statusData = ORDER_STATUS_VALUES.map((s) => ({
    status: s,
    label: ORDER_STATUS_LABEL[s],
    count: orders.filter((o) => o.status === s).length,
    color: ORDER_STATUS_COLOR[s],
  })).filter((d) => d.count > 0);

  const evolMap = new Map<string, number>();
  for (const o of periodOrders) {
    const m = o.requestDate.slice(0, 7);
    evolMap.set(m, (evolMap.get(m) ?? 0) + 1);
  }
  const evolData = [...evolMap.entries()].sort(([a], [b]) => (a > b ? 1 : -1)).map(([month, pedidos]) => ({ month, pedidos }));

  const projMap = new Map<string, number>();
  for (const m of periodMovements) {
    if (m.direction !== "SAIDA") continue;
    const project = m.project || "Outros";
    projMap.set(project, (projMap.get(project) ?? 0) + m.quantity);
  }
  const projData = [...projMap.entries()].map(([project, qty]) => ({ project, qty }));

  const criticalItems = stock.filter((s) => s.quantity < s.minStock).slice(0, 6);
  const latestOrders = periodOrders.slice(0, 5);
  const latestMovements = periodMovements.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description="Painel executivo do Departamento de Marketing"
        actions={<DateRangeFilter value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Pedidos em andamento" value={emAndamento} color={PRIMARY} icon={ShoppingCart} href="/pedidos" />
        <StatCard label="Pedidos atrasados" value={atrasados} color={CRIT} icon={AlertTriangle} href="/pedidos" />
        <StatCard label="Entregues no período" value={entregues} color={OK} icon={CheckCircle2} href="/pedidos" />
        <StatCard label="Itens em estoque (atual)" value={totalItens} color={PURPLE} icon={Package} href="/estoque" />
        <StatCard label="Abaixo do mínimo (atual)" value={abaixoMin} color={WARN} icon={AlertTriangle} href="/estoque" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusBarChart data={statusData} />
        <OrdersEvolutionChart data={evolData} />
        <ProjectConsumptionChart data={projData} />

        <Card>
          <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Itens com estoque crítico <span className="font-normal text-zinc-400">(situação atual)</span>
          </div>
          <div className="space-y-0.5">
            {criticalItems.map((s) => (
              <div
                key={s.id}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <span className="text-zinc-700 dark:text-zinc-300">{s.name}</span>
                <span className="font-medium text-brand-crit">
                  {s.quantity} / mín. {s.minStock}
                </span>
              </div>
            ))}
            {criticalItems.length === 0 && (
              <EmptyState message="Nenhum item crítico." />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Pedidos no período</div>
          <div className="space-y-0.5">
            {latestOrders.map((o) => (
              <div
                key={o.id}
                className="-mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <span className="truncate text-zinc-700 dark:text-zinc-300">{o.stockItem.name}</span>
                <Badge color={ORDER_STATUS_COLOR[o.status as OrderStatusValue]}>
                  {ORDER_STATUS_LABEL[o.status as OrderStatusValue]}
                </Badge>
              </div>
            ))}
            {latestOrders.length === 0 && (
              <EmptyState message="Nenhum pedido no período selecionado." />
            )}
          </div>
        </Card>
        <Card>
          <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Movimentações no período</div>
          <div className="space-y-0.5">
            {latestMovements.map((m) => {
              const positive = m.direction === "ENTRADA";
              return (
                <div
                  key={m.id}
                  className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    {positive ? (
                      <ArrowUpRight size={14} className="text-brand-ok" />
                    ) : (
                      <ArrowDownRight size={14} className="text-brand-crit" />
                    )}
                    {MOVEMENT_TYPE_LABEL[m.type as MovementTypeValue]} · {m.stockItem.name}
                  </span>
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">
                    {positive ? "+" : "-"}
                    {m.quantity}
                  </span>
                </div>
              );
            })}
            {latestMovements.length === 0 && (
              <EmptyState message="Nenhuma movimentação no período selecionado." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
