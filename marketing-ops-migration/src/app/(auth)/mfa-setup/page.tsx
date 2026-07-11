"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

type Step = "loading" | "scan" | "backup-codes" | "error";

function MfaSetupInner() {
  const router = useRouter();
  const bootstrapTicket = useSearchParams().get("ticket");

  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [setupTicket, setSetupTicket] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loginTicket, setLoginTicket] = useState("");
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!bootstrapTicket) return;
    fetch("/api/auth/mfa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket: bootstrapTicket }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Não foi possível iniciar o MFA.");
        setQrCodeDataUrl(data.qrCodeDataUrl);
        setManualEntryKey(data.manualEntryKey);
        setSetupTicket(data.setupTicket);
        setStep("scan");
      })
      .catch((err) => {
        setStep("error");
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      });
  }, [bootstrapTicket]);

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupTicket, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Código inválido.");
      setBackupCodes(data.backupCodes);
      setLoginTicket(data.loginTicket);
      setStep("backup-codes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    const result = await signIn("credentials", { ticket: loginTicket, redirect: false });
    if (result?.error) {
      setError("Não foi possível concluir o login. Tente entrar novamente.");
      setFinishing(false);
      return;
    }
    router.push("/dashboard");
  }

  if (!bootstrapTicket) {
    return <ErrorBanner message="Sessão de login expirada. Volte e entre novamente." />;
  }

  if (step === "loading") {
    return <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">Preparando o MFA...</p>;
  }

  if (step === "error") {
    return <ErrorBanner message={error ?? "Erro inesperado."} />;
  }

  if (step === "backup-codes") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Guarde seus códigos de backup
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Use um destes códigos se perder acesso ao seu app autenticador. Cada um só funciona uma vez —
            eles não serão exibidos de novo.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm tracking-wide text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
          {backupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {error && <ErrorBanner message={error} />}
        <Button onClick={handleFinish} disabled={finishing} className="w-full">
          {finishing ? "Entrando..." : "Já salvei meus códigos, continuar"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Configure o autenticador
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Escaneie o QR code com o Google Authenticator, Authy ou similar.
        </p>
      </div>

      {qrCodeDataUrl && (
        <div className="flex justify-center rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800">
          <Image src={qrCodeDataUrl} alt="QR code para configurar o MFA" width={180} height={180} unoptimized />
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Ou digite manualmente:</p>
        <code className="block break-all rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
          {manualEntryKey}
        </code>
      </div>

      {error && <ErrorBanner message={error} />}

      <Input
        label="Código de 6 dígitos"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        className="text-center font-mono text-lg tracking-[0.4em]"
        required
        autoFocus
      />

      <Button type="submit" disabled={submitting || code.length !== 6} className="w-full">
        {submitting ? "Confirmando..." : "Confirmar e ativar MFA"}
      </Button>
    </form>
  );
}

export default function MfaSetupPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-zinc-500">Carregando...</p>}>
      <MfaSetupInner />
    </Suspense>
  );
}
