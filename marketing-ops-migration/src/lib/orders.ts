import type { Prisma } from "@/generated/prisma/client";

/**
 * Credita o estoque quando um pedido é confirmado como entregue: incrementa
 * StockItem.quantity e grava a Movement (ENTRADA/COMPRA) correspondente,
 * vinculada ao pedido via orderId. Deve sempre rodar dentro da mesma
 * transação que grava a mudança de status do pedido (ver rotas de orders).
 */
export async function creditStockForDelivery(
  tx: Prisma.TransactionClient,
  order: { id: string; stockItemId: string; quantity: number; project: string; ocNumber: string },
  performedById: string
) {
  await tx.stockItem.update({
    where: { id: order.stockItemId },
    data: { quantity: { increment: order.quantity }, updatedById: performedById },
  });

  await tx.movement.create({
    data: {
      direction: "ENTRADA",
      type: "COMPRA",
      quantity: order.quantity,
      project: order.project,
      notes: `Recebimento do pedido OC ${order.ocNumber}`,
      stockItemId: order.stockItemId,
      orderId: order.id,
      performedById,
    },
  });
}
