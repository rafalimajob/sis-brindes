"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Verificação em duas etapas</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {useBackupCode
            ? "Digite um dos seus códigos de backup."
            : "Digite o código de 6 dígitos do seu app autenticador."}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {useBackupCode ? "Código de backup" : "Código de 6 dígitos"}
        </label>
        <Input
          value={code}
          onChange={(e) =>
            setCode(useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          inputMode={useBackupCode ? "text" : "numeric"}
          maxLength={useBackupCode ? 11 : 6}
          required
          autoFocus
        />
      </div>

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
        className="w-full text-center text-sm font-medium text-brand-primary hover:underline dark:text-blue-300"
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
