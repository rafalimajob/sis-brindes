import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Gate compartilhado pelas rotas de gestão de usuários — nenhuma outra rota
 * da API hoje distingue papel (role), então este helper concentra a única
 * checagem de ADMIN do app em vez de repetir `session.user.role !== "ADMIN"`
 * em cada arquivo. */
export async function requireAdmin(): Promise<{ session: Session } | { error: NextResponse }> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Apenas administradores podem acessar este recurso." }, { status: 403 }) };
  }
  return { session };
}
