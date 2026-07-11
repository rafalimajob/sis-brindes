import { Prisma } from "@/generated/prisma/client";

/**
 * Traduz erros do Prisma para uma resposta amigável. Em especial, P2003
 * (violação de chave estrangeira) em campos como createdById/performedById
 * normalmente significa que a sessão aponta para um usuário que não existe
 * mais no banco (ex: banco de dev resetado) — orientamos a logar de novo em
 * vez de expor o erro cru do Prisma.
 */
export function toErrorResponse(err: unknown): { message: string; status: number } {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    return { message: "Sua sessão está desatualizada. Saia e faça login novamente.", status: 401 };
  }
  if (err instanceof Error) {
    return { message: err.message, status: 400 };
  }
  return { message: "Erro inesperado.", status: 400 };
}
