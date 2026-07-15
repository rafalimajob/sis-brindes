import { prisma } from "@/lib/prisma";
import { StockGrid } from "@/components/stock/stock-grid";
import type { StockItemDTO } from "@/types/stock";
import type { CategoryDTO } from "@/types/category";

export default async function EstoquePage() {
  const [items, categories] = await Promise.all([
    prisma.stockItem.findMany({
      include: { updatedBy: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

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

  const dtoCategories: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <StockGrid initialItems={dtoItems} initialCategories={dtoCategories} />;
}
