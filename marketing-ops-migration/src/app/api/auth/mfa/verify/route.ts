import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTicket, issueTicket } from "@/lib/tickets";
import { verifyTotpCode, encryptMfaSecret, generateBackupCodes } from "@/lib/mfa";

// Confirma o setup do MFA: valida o 1º código digitado contra o secret pendente
// (transportado no setupTicket) e só então persiste mfaSecret/mfaEnabled/backup
// codes — a partir daqui o MFA passa a ser exigido em todo login, sem exceção.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const setupTicket = typeof body?.setupTicket === "string" ? body.setupTicket : "";
  const code = typeof body?.code === "string" ? body.code : "";

  const payload = verifyTicket(setupTicket, "mfa-setup-pending");
  if (!payload || !payload.secret) {
    return NextResponse.json({ error: "Sessão de configuração expirada. Comece de novo." }, { status: 401 });
  }

  const ok = await verifyTotpCode(payload.secret, code);
  if (!ok) {
    return NextResponse.json({ error: "Código inválido. Confira o app autenticador e tente de novo." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const { plain: backupCodes, hashed } = await generateBackupCodes();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: true,
      mfaSecret: encryptMfaSecret(payload.secret),
      mfaBackupCodes: hashed,
    },
  });

  const loginTicket = issueTicket("mfa-verified", user.id, user.email);
  return NextResponse.json({ backupCodes, loginTicket });
}
