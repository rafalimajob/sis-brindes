import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTicket, issueTicket } from "@/lib/tickets";
import { generateTotpSecret, totpQrCodeDataUrl } from "@/lib/mfa";

// Inicia o setup do MFA (1º login): gera um secret TOTP novo a cada chamada,
// mas só grava no banco depois que o usuário provar posse do autenticador em
// /api/auth/mfa/setup/confirm — até lá o secret viaja apenas no setupTicket assinado.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const bootstrapTicket = typeof body?.ticket === "string" ? body.ticket : "";

  const payload = verifyTicket(bootstrapTicket, "mfa-setup-bootstrap");
  if (!payload) {
    return NextResponse.json({ error: "Sessão de login expirada. Faça login novamente." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  if (user.mfaEnabled) {
    return NextResponse.json({ error: "MFA já está configurado para este usuário." }, { status: 409 });
  }

  const secret = generateTotpSecret();
  const qrCodeDataUrl = await totpQrCodeDataUrl(user.email, secret);
  const setupTicket = issueTicket("mfa-setup-pending", user.id, user.email, { secret });

  return NextResponse.json({ qrCodeDataUrl, manualEntryKey: secret, setupTicket });
}
