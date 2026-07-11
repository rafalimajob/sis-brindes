import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logHistory, diffFields } from "@/lib/history";
import { toErrorResponse } from "@/lib/api-errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const item = await prisma.stockItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.stockItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.category === "string") data.category = body.category.trim();
  if (body.quantity !== undefined) data.quantity = Number(body.quantity) || 0;
  if (body.minStock !== undefined) data.minStock = Number(body.minStock) || 0;
  if (body.idealStock !== undefined) data.idealStock = Number(body.idealStock) || 0;
  if (body.lastCost !== undefined) data.lastCost = body.lastCost === "" || body.lastCost === null ? null : Number(body.lastCost);
  if (body.lastPurchaseDate !== undefined) {
    data.lastPurchaseDate = body.lastPurchaseDate ? new Date(body.lastPurchaseDate) : null;
  }
  if (body.location !== undefined) data.location = typeof body.location === "string" ? body.location.trim() || null : null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  const changed = diffFields(existing as unknown as Record<string, unknown>, data);
  data.updatedById = session.user.id;

  try {
    const updated = await prisma.stockItem.update({ where: { id }, data });

    if (Object.keys(changed).length > 0) {
      await logHistory({
        action: "UPDATE",
        entity: "STOCK_ITEM",
        entityId: updated.id,
        summary: `Item de estoque ${updated.code} (${updated.name}) atualizado`,
        userId: session.user.id,
        diff: changed,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const { message, status } = toErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.stockItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });

  try {
    await prisma.stockItem.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Este item não pode ser excluído: existem pedidos, movimentações ou kits vinculados a ele." },
      { status: 409 }
    );
  }

  try {
    await logHistory({
      action: "DELETE",
      entity: "STOCK_ITEM",
      entityId: id,
      summary: `Item de estoque ${existing.code} (${existing.name}) excluído`,
      userId: session.user.id,
    });
  } catch (err) {
    console.error("Falha ao gravar HistoryLog:", err);
  }

  return NextResponse.json({ ok: true });
}
