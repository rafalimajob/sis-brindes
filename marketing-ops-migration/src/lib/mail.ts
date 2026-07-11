/**
 * Em dev (sem EMAIL_API_KEY configurada) o link de verificação é apenas
 * logado no console em vez de enviado por e-mail de verdade — dá para testar
 * o fluxo completo de cadastro sem depender de uma conta no Resend.
 * Basta preencher EMAIL_API_KEY no .env para passar a enviar de verdade.
 */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const apiKey = process.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.log(
      `\n[dev] E-mail de verificação de cadastro para ${to}:\n  ${verifyUrl}\n`
    );
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Marketing Ops <no-reply@marketingops.local>",
    to,
    subject: "Confirme seu cadastro — Marketing Ops",
    html: `<p>Olá! Clique no link abaixo para confirmar seu cadastro no Marketing Ops:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Se você não solicitou este cadastro, ignore este e-mail.</p>`,
  });
}
