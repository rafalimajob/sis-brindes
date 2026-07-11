"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface DateRange {
  from: string;
  to: string;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export const ALL_TIME_RANGE: DateRange = { from: "", to: "" };

export function currentMonthRange(): DateRange {
  const today = new Date();
  return { from: isoDate(startOfMonth(today)), to: isoDate(today) };
}

export function isInRange(dateIso: string, range: DateRange): boolean {
  const d = dateIso.slice(0, 10);
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: "Tudo", range: () => ALL_TIME_RANGE },
  { label: "Mês atual", range: currentMonthRange },
  {
    label: "Mês anterior",
    range: () => {
      const today = new Date();
      const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: isoDate(startOfMonth(prevMonthEnd)), to: isoDate(prevMonthEnd) };
    },
  },
  {
    label: "Últimos 3 meses",
    range: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      return { from: isoDate(start), to: isoDate(today) };
    },
  },
  {
    label: "Este ano",
    range: () => {
      const today = new Date();
      return { from: isoDate(new Date(today.getFullYear(), 0, 1)), to: isoDate(today) };
    },
  },
];

export function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        type="date"
        label="De"
        value={value.from}
        max={value.to || undefined}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="w-auto"
      />
      <Input
        type="date"
        label="Até"
        value={value.to}
        min={value.from || undefined}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="w-auto"
      />
      <div className="flex flex-wrap gap-1.5 pb-0.5">
        {PRESETS.map((p) => (
          <Button key={p.label} type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={() => onChange(p.range())}>
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
