import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { issueTicket, TRUSTED_DEVICE_COOKIE } from "@/lib/tickets";

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

/** Chamada logo após o login (setup inicial de MFA ou desafio recorrente)
 * quando o usuário marca "confiar neste navegador" — grava um cookie httpOnly
 * assinado que o login/precheck usa depois para pular o pedido de TOTP,
 * sem nunca pular a senha. */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const value = issueTicket("trusted-device", session.user.id, session.user.email ?? "");

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TRUSTED_DEVICE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
  return res;
}
