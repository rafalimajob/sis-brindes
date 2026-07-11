import { prisma } from "@/lib/prisma";
import { KitGrid } from "@/components/kits/kit-grid";
import type { KitDTO } from "@/types/kit";
import type { StockOptionDTO } from "@/types/movement";

export default async function KitsPage() {
  const [kits, stock] = await Promise.all([
    prisma.kit.findMany({
      include: { items: { include: { stockItem: { select: { name: true, code: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.stockItem.findMany({ select: { id: true, code: true, name: true, quantity: true }, orderBy: { name: "asc" } }),
  ]);

  const dtoKits: KitDTO[] = kits;
  const stockOptions: StockOptionDTO[] = stock;

  return <KitGrid initialKits={dtoKits} stock={stockOptions} />;
}
