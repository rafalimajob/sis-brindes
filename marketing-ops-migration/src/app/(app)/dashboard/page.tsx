import { ShoppingCart, AlertTriangle, CheckCircle2, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBarChart, OrdersEvolutionChart, ProjectConsumptionChart } from "@/components/dashboard/dashboard-charts";
import { ORDER_STATUS_VALUES, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { MOVEMENT_TYPE_LABEL } from "@/lib/movement-types";
import type { MovementTypeValue } from "@/lib/movement-types";
import type { OrderStatusValue } from "@/lib/order-status";

const PURPLE = "#7C6FCB";
const WARN = "#D9A441";
const CRIT = "#D6503F";
const PRIMARY = "#3E4C6E";
const OK = "#1F9D6E";

export default async function DashboardPage() {
  const [orders, stock, movements] = await Promise.all([
    prisma.order.findMany({ include: { stockItem: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
    prisma.movement.findMany({
      include: { stockItem: { select: { name: true, code: true } } },
      orderBy: { date: "desc" },
      take: 200,
    }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  const emAndamento = orders.filter((o) => o.status !== "ENTREGUE" && o.status !== "CANCELADO").length;
  const atrasados = orders.filter(
    (o) => o.status !== "ENTREGUE" && o.status !== "CANCELADO" && o.expectedDate && o.expectedDate.toISOString().slice(0, 10) < today
  ).length;
  const entreguesMes = orders.filter(
    (o) => o.status === "ENTREGUE" && o.deliveredDate && o.deliveredDate.toISOString().slice(0, 7) === thisMonth
  ).length;
  const totalItens = stock.reduce((a, s) => a + s.quantity, 0);
  const abaixoMin = stock.filter((s) => s.quantity < s.minStock).length;

  const statusData = ORDER_STATUS_VALUES.map((s) => ({
    status: s,
    label: ORDER_STATUS_LABEL[s],
    count: orders.filter((o) => o.status === s).length,
    color: ORDER_STATUS_COLOR[s],
  })).filter((d) => d.count > 0);

  const evolMap = new Map<string, number>();
  for (const o of orders) {
    const m = o.requestDate.toISOString().slice(0, 7);
    evolMap.set(m, (evolMap.get(m) ?? 0) + 1);
  }
  const evolData = [...evolMap.entries()].sort(([a], [b]) => (a > b ? 1 : -1)).map(([month, pedidos]) => ({ month, pedidos }));

  const projMap = new Map<string, number>();
  for (const m of movements) {
    if (m.direction !== "SAIDA") continue;
    const project = m.project || "Outros";
    projMap.set(project, (projMap.get(project) ?? 0) + m.quantity);
  }
  const projData = [...projMap.entries()].map(([project, qty]) => ({ project, qty }));

  const criticalItems = stock.filter((s) => s.quantity < s.minStock).slice(0, 6);
  const latestOrders = orders.slice(0, 5);
  const latestMovements = movements.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Visão geral</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Painel executivo do Departamento de Marketing</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Pedidos em andamento" value={emAndamento} color={PRIMARY} icon={ShoppingCart} href="/pedidos" />
        <StatCard label="Pedidos atrasados" value={atrasados} color={CRIT} icon={AlertTriangle} href="/pedidos" />
        <StatCard label="Entregues no mês" value={entreguesMes} color={OK} icon={CheckCircle2} href="/pedidos" />
        <StatCard label="Itens em estoque" value={totalItens} color={PURPLE} icon={Package} href="/estoque" />
        <StatCard label="Abaixo do mínimo" value={abaixoMin} color={WARN} icon={AlertTriangle} href="/estoque" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusBarChart data={statusData} />
        <OrdersEvolutionChart data={evolData} />
        <ProjectConsumptionChart data={projData} />

        <Card>
          <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Itens com estoque crítico</div>
          <div className="space-y-2">
            {criticalItems.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">{s.name}</span>
                <span className="text-brand-crit">
                  {s.quantity} / mín. {s.minStock}
                </span>
              </div>
            ))}
            {criticalItems.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum item crítico.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Últimos pedidos cadastrados</div>
          <div className="space-y-2">
            {latestOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-zinc-700 dark:text-zinc-300">{o.stockItem.name}</span>
                <Badge color={ORDER_STATUS_COLOR[o.status as OrderStatusValue]}>
                  {ORDER_STATUS_LABEL[o.status as OrderStatusValue]}
                </Badge>
              </div>
            ))}
            {latestOrders.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum pedido cadastrado.</p>
            )}
          </div>
        </Card>
        <Card>
          <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Últimas movimentações</div>
          <div className="space-y-2">
            {latestMovements.map((m) => {
              const positive = m.direction === "ENTRADA";
              return (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    {positive ? (
                      <ArrowUpRight size={14} className="text-brand-ok" />
                    ) : (
                      <ArrowDownRight size={14} className="text-brand-crit" />
                    )}
                    {MOVEMENT_TYPE_LABEL[m.type as MovementTypeValue]} · {m.stockItem.name}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {positive ? "+" : "-"}
                    {m.quantity}
                  </span>
                </div>
              );
            })}
            {latestMovements.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhuma movimentação registrada.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
