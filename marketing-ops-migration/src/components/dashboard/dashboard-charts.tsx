"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card } from "@/components/ui/card";

const PRIMARY = "#3E4C6E";
const ACCENT = "#E86F3B";

export function StatusBarChart({ data }: { data: { status: string; label: string; count: number; color: string }[] }) {
  return (
    <Card>
      <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Pedidos por status</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
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
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="pedidos" stroke={PRIMARY} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ProjectConsumptionChart({ data }: { data: { project: string; qty: number }[] }) {
  return (
    <Card>
      <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">Consumo por Projeto/Campanha</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="project" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="qty" fill={ACCENT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
