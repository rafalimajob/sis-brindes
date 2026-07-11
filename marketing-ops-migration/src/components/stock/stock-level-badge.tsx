import { Badge } from "@/components/ui/badge";
import { CHART_COLORS } from "@/lib/theme-colors";

export function StockLevelBadge({ quantity, minStock }: { quantity: number; minStock: number }) {
  const level = quantity < minStock ? "crit" : quantity < minStock * 1.3 ? "warn" : "ok";
  const label = { crit: "Abaixo do mínimo", warn: "Próximo do mínimo", ok: "Estoque adequado" }[level];
  return <Badge color={CHART_COLORS[level]}>{label}</Badge>;
}
