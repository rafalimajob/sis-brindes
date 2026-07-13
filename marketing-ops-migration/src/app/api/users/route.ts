import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { UserDTO } from "@/types/user";

export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return gate.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, status: true, mfaEnabled: true, createdAt: true },
  });

  const dto: UserDTO[] = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));
  return NextResponse.json(dto);
}
