import { prisma } from "@/lib/prisma";
import { OrderTable } from "@/components/orders/order-table";
import type { OrderDTO } from "@/types/order";
import type { OrderStatusValue } from "@/lib/order-status";
import type { StockOptionDTO } from "@/types/movement";

export default async function PedidosPage() {
  const [orders, stock] = await Promise.all([
    prisma.order.findMany({
      include: { attachments: true, stockItem: { select: { name: true, code: true } } },
      orderBy: { requestDate: "desc" },
    }),
    prisma.stockItem.findMany({ select: { id: true, code: true, name: true, quantity: true }, orderBy: { name: "asc" } }),
  ]);

  const dtoOrders: OrderDTO[] = orders.map((o) => ({
    id: o.id,
    stockItemId: o.stockItemId,
    stockItem: o.stockItem,
    quantity: o.quantity,
    ocNumber: o.ocNumber,
    project: o.project,
    status: o.status as OrderStatusValue,
    requestDate: o.requestDate.toISOString(),
    expectedDate: o.expectedDate ? o.expectedDate.toISOString() : null,
    deliveredDate: o.deliveredDate ? o.deliveredDate.toISOString() : null,
    notes: o.notes,
    attachments: o.attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      url: a.url,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      uploadedAt: a.uploadedAt.toISOString(),
    })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  const stockOptions: StockOptionDTO[] = stock;

  return <OrderTable initialOrders={dtoOrders} stock={stockOptions} />;
}
