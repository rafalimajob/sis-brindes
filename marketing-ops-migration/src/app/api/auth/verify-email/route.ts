import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  const verification = await prisma.verificationToken.findUnique({ where: { token } });
  if (
    !verification ||
    verification.purpose !== "EMAIL_VERIFICATION" ||
    verification.expiresAt < new Date()
  ) {
    return NextResponse.json({ error: "Link de verificação inválido ou expirado." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: verification.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
