import { randomBytes, randomInt, createCipheriv, createDecipheriv } from "crypto";
import { generateSecret, verify, generateURI } from "otplib";
import bcrypt from "bcrypt";

const ISSUER = "Marketing Ops";
const ENCRYPTION_KEY = Buffer.from(process.env.MFA_ENCRYPTION_KEY ?? "", "hex");

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    "MFA_ENCRYPTION_KEY precisa ser uma chave hex de 32 bytes (64 caracteres). Gere com: openssl rand -hex 32"
  );
}

/** Criptografa o secret TOTP antes de gravar em `User.mfaSecret` (AES-256-GCM). */
export function encryptMfaSecret(plainSecret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainSecret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

/** Reverte `encryptMfaSecret` para validar um código TOTP. */
export function decryptMfaSecret(stored: string): string {
  const [ivHex, authTagHex, dataHex] = stored.split(":");
  const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

/** Gera um novo secret TOTP (Base32) — usar apenas em memória/QR code, nunca logar. */
export function generateTotpSecret(): string {
  return generateSecret();
}

/** URI otpauth:// para exibir como QR code no app autenticador. */
export function generateTotpUri(email: string, plainSecret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret: plainSecret });
}

export async function totpQrCodeDataUrl(email: string, plainSecret: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(generateTotpUri(email, plainSecret));
}

/** Valida um código de 6 dígitos digitado pelo usuário contra o secret (já descriptografado). */
export async function verifyTotpCode(plainSecret: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false;
  const result = await verify({ secret: plainSecret, token });
  return result.valid;
}

const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos (0/O, 1/I/L)

function generateBackupCode(): string {
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)];
    if (i === 4) code += "-";
  }
  return code;
}

/**
 * Gera N backup codes. Retorna os códigos em texto puro (exibir uma única vez ao
 * usuário) e seus hashes bcrypt (o que efetivamente é gravado em `User.mfaBackupCodes`).
 */
export async function generateBackupCodes(count = 10): Promise<{ plain: string[]; hashed: string[] }> {
  const plain = Array.from({ length: count }, generateBackupCode);
  const hashed = await Promise.all(plain.map((code) => bcrypt.hash(code, 12)));
  return { plain, hashed };
}

/**
 * Verifica um backup code contra a lista de hashes armazenada e retorna o hash
 * consumido (para removê-lo da lista, já que cada código é de uso único).
 */
export async function consumeBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; consumedHash?: string }> {
  const normalized = code.trim().toUpperCase();
  for (const hash of hashedCodes) {
    if (await bcrypt.compare(normalized, hash)) {
      return { valid: true, consumedHash: hash };
    }
  }
  return { valid: false };
}
