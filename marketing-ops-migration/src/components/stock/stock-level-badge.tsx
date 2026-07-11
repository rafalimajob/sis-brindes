import { Badge } from "@/components/ui/badge";

const COLORS = { crit: "#D6503F", warn: "#D9A441", ok: "#1F9D6E" } as const;

export function StockLevelBadge({ quantity, minStock }: { quantity: number; minStock: number }) {
  const level = quantity < minStock ? "crit" : quantity < minStock * 1.3 ? "warn" : "ok";
  const label = { crit: "Abaixo do mínimo", warn: "Próximo do mínimo", ok: "Estoque adequado" }[level];
  return <Badge color={COLORS[level]}>{label}</Badge>;
}
