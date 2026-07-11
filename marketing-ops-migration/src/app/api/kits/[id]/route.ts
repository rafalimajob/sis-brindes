import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logHistory } from "@/lib/history";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.kit.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Kit não encontrado." }, { status: 404 });

  try {
    await prisma.kit.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Este kit não pode ser excluído: existem saídas registradas para ele." },
      { status: 409 }
    );
  }

  try {
    await logHistory({
      action: "DELETE",
      entity: "KIT",
      entityId: id,
      summary: `Kit "${existing.name}" excluído`,
      userId: session.user.id,
    });
  } catch (err) {
    console.error("Falha ao gravar HistoryLog:", err);
  }

  return NextResponse.json({ ok: true });
}
