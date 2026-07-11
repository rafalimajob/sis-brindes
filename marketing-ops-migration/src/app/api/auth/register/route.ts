import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = new URL("/verify-email", request.nextUrl.origin);
  verifyUrl.searchParams.set("token", token);
  await sendVerificationEmail(user.email, verifyUrl.toString());

  return NextResponse.json({ ok: true });
}
