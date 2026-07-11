import { prisma } from "@/lib/prisma";
import { StockGrid } from "@/components/stock/stock-grid";
import type { StockItemDTO } from "@/types/stock";

export default async function EstoquePage() {
  const items = await prisma.stockItem.findMany({
    include: { updatedBy: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const dtoItems: StockItemDTO[] = items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    photoUrl: item.photoUrl,
    quantity: item.quantity,
    minStock: item.minStock,
    idealStock: item.idealStock,
    lastCost: item.lastCost ? item.lastCost.toString() : null,
    lastPurchaseDate: item.lastPurchaseDate ? item.lastPurchaseDate.toISOString() : null,
    location: item.location,
    createdById: item.createdById,
    updatedById: item.updatedById,
    updatedBy: item.updatedBy,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <StockGrid initialItems={dtoItems} />;
}
