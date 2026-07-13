"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

function MfaChallengeInner() {
  const router = useRouter();
  const ticket = useSearchParams().get("ticket");

  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ticket) {
      setError("Sessão de login expirada. Volte e entre novamente.");
      return;
    }
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      ticket,
      totpCode: useBackupCode ? undefined : code,
      backupCode: useBackupCode ? code : undefined,
      redirect: false,
    });

    if (result?.error) {
      setError("Código inválido. Tente novamente.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Verificação em duas etapas
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {useBackupCode
            ? "Digite um dos seus códigos de backup."
            : "Digite o código de 6 dígitos do seu app autenticador."}
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <Input
        label={useBackupCode ? "Código de backup" : "Código de 6 dígitos"}
        value={code}
        onChange={(e) =>
          setCode(useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        inputMode={useBackupCode ? "text" : "numeric"}
        maxLength={useBackupCode ? 11 : 6}
        className={useBackupCode ? undefined : "text-center font-mono text-lg tracking-[0.4em]"}
        required
        autoFocus
      />

      <Button type="submit" disabled={loading || !code} className="w-full">
        {loading ? "Verificando..." : "Entrar"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setUseBackupCode((v) => !v);
          setCode("");
          setError(null);
        }}
        className="w-full text-center text-sm font-medium text-brand-primary hover:underline"
      >
        {useBackupCode ? "Usar código do autenticador" : "Usar um código de backup"}
      </button>
    </form>
  );
}

export default function MfaChallengePage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-zinc-500">Carregando...</p>}>
      <MfaChallengeInner />
    </Suspense>
  );
}
