import { prisma } from "@/lib/prisma";
import type { MovementDirection, MovementType } from "@/generated/prisma/client";

interface ApplyMovementInput {
  direction: MovementDirection;
  type: MovementType;
  quantity: number; // sempre positivo; o sinal é dado por `direction`
  stockItemId: string;
  project?: string | null;
  notes?: string | null;
  orderId?: string | null;
  performedById: string;
}

/**
 * Grava uma Movement e atualiza StockItem.quantity numa única transação —
 * o saldo nunca é calculado apenas no cliente. Lança erro se a saída deixaria
 * o estoque negativo.
 */
export async function applyMovement(input: ApplyMovementInput) {
  return prisma.$transaction(async (tx) => {
    const stockItem = await tx.stockItem.findUniqueOrThrow({ where: { id: input.stockItemId } });
    const delta = input.direction === "ENTRADA" ? input.quantity : -input.quantity;

    if (stockItem.quantity + delta < 0) {
      throw new Error(
        `Estoque insuficiente: "${stockItem.name}" tem ${stockItem.quantity} disponível, saída pede ${input.quantity}.`
      );
    }

    const updatedItem = await tx.stockItem.update({
      where: { id: input.stockItemId },
      data: { quantity: { increment: delta }, updatedById: input.performedById },
    });

    const movement = await tx.movement.create({
      data: {
        direction: input.direction,
        type: input.type,
        quantity: input.quantity,
        project: input.project || null,
        notes: input.notes || null,
        stockItemId: input.stockItemId,
        orderId: input.orderId || null,
        performedById: input.performedById,
      },
    });

    return { movement, updatedItem };
  });
}

interface RegisterKitOutputInput {
  kitId: string;
  quantity: number; // número de kits retirados
  project?: string | null;
  notes?: string | null;
  performedById: string;
}

/**
 * Cria um KitOutput e uma Movement (SAIDA/KIT) por item componente do kit,
 * decrementando cada StockItem — tudo numa única transação.
 */
export async function registerKitOutput(input: RegisterKitOutputInput) {
  return prisma.$transaction(async (tx) => {
    const kit = await tx.kit.findUniqueOrThrow({
      where: { id: input.kitId },
      include: { items: { include: { stockItem: true } } },
    });

    for (const line of kit.items) {
      const needed = line.quantity * input.quantity;
      if (line.stockItem.quantity < needed) {
        throw new Error(
          `Estoque insuficiente para "${line.stockItem.name}": disponível ${line.stockItem.quantity}, necessário ${needed}.`
        );
      }
    }

    const kitOutput = await tx.kitOutput.create({
      data: {
        kitId: kit.id,
        quantity: input.quantity,
        project: input.project || null,
        notes: input.notes || `Saída de ${input.quantity}x ${kit.name}`,
        performedById: input.performedById,
      },
    });

    for (const line of kit.items) {
      const needed = line.quantity * input.quantity;
      await tx.stockItem.update({
        where: { id: line.stockItemId },
        data: { quantity: { decrement: needed }, updatedById: input.performedById },
      });
      await tx.movement.create({
        data: {
          direction: "SAIDA",
          type: "KIT",
          quantity: needed,
          project: input.project || kit.name,
          notes: input.notes || `Saída de ${input.quantity}x ${kit.name}`,
          stockItemId: line.stockItemId,
          kitOutputId: kitOutput.id,
          performedById: input.performedById,
        },
      });
    }

    return kitOutput;
  });
}
