import { createHmac, timingSafeEqual } from "crypto";

/**
 * Tickets HMAC assinados e de curta duração usados para encadear as etapas do
 * login com MFA (precheck -> setup/challenge -> NextAuth authorize) sem
 * precisar retransmitir a senha do usuário entre requisições.
 */

const SECRET = process.env.AUTH_SECRET;
if (!SECRET) throw new Error("AUTH_SECRET não configurado");

/** Nome do cookie httpOnly de "confiar neste navegador" (30 dias) — mesma
 * constante usada para gravar (trust-device) e ler (login/precheck). */
export const TRUSTED_DEVICE_COOKIE = "atlas_trusted_device";

export type TicketPurpose =
  | "mfa-setup-bootstrap" // precheck (1º login) -> tela de setup do MFA
  | "mfa-setup-pending" // setup/init -> setup/confirm (carrega o secret TOTP ainda não persistido)
  | "mfa-challenge" // precheck (login normal) -> desafio de código TOTP/backup
  | "mfa-verified" // setup/confirm (após validar o 1º código) -> cria a sessão
  | "trusted-device" // cookie de "confiar neste navegador" — vida longa (30 dias), guardado no browser
  | "trusted-device-login"; // precheck (cookie de confiança válido) -> authorize() cria a sessão direto, sem pedir TOTP

interface TicketPayload {
  purpose: TicketPurpose;
  userId: string;
  email: string;
  secret?: string;
  exp: number;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: TicketPayload): string {
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET!).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(ticket: string): TicketPayload | null {
  const [body, sig] = ticket.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", SECRET!).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TicketPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

const TTL = {
  "mfa-setup-bootstrap": 5 * 60_000,
  "mfa-setup-pending": 10 * 60_000,
  "mfa-challenge": 5 * 60_000,
  "mfa-verified": 5 * 60_000,
  "trusted-device": 30 * 24 * 60 * 60_000,
  "trusted-device-login": 5 * 60_000,
} as const satisfies Record<TicketPurpose, number>;

export function issueTicket(
  purpose: TicketPurpose,
  userId: string,
  email: string,
  extra?: { secret?: string }
): string {
  return sign({ purpose, userId, email, secret: extra?.secret, exp: Date.now() + TTL[purpose] });
}

export function verifyTicket(ticket: string, purpose: TicketPurpose): TicketPayload | null {
  const payload = verify(ticket);
  if (!payload || payload.purpose !== purpose) return null;
  return payload;
}
