"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  type TooltipContentProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { Card } from "@/components/ui/card";
import { CHART_COLORS, categoryColor } from "@/lib/theme-colors";

const AXIS_TICK = { fontSize: 11, fill: "#94A3B8" };

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipContentProps<ValueType, NameType> & { valueFormatter?: (value: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {label != null && <div className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: (p.color ?? p.fill) as string }} />
          {valueFormatter ? valueFormatter(Number(p.value)) : String(p.value)}
        </div>
      ))}
    </div>
  );
}

export function StatusBarChart({ data }: { data: { status: string; label: string; count: number; color: string }[] }) {
  return (
    <Card>
      <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Pedidos por status <span className="font-normal text-zinc-400">(situação atual)</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={140} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((d) => (
              <Cell key={d.status} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function OrdersEvolutionChart({ data }: { data: { month: string; pedidos: number }[] }) {
  return (
    <Card>
      <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Evolução de pedidos (por mês de solicitação)
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} />
          <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={{ stroke: "#94A3B8", strokeOpacity: 0.3 }} />
          <Line
            type="monotone"
            dataKey="pedidos"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ProjectConsumptionChart({
  data,
  title = "Consumo por Projeto/Campanha",
  valueFormatter,
}: {
  data: { project: string; qty: number }[];
  title?: string;
  valueFormatter?: (value: number) => string;
}) {
  return (
    <Card>
      <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="project"
            tick={AXIS_TICK}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            tickFormatter={valueFormatter}
            width={valueFormatter ? 64 : 40}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} valueFormatter={valueFormatter} />}
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
          />
          <Bar dataKey="qty" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((d, i) => (
              <Cell key={d.project} fill={categoryColor(i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
