"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Não foi possível confirmar seu e-mail.");
        setStatus("ok");
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      });
  }, [token]);

  if (!token) {
    return (
      <div className="space-y-3 text-center">
        <XCircle size={32} className="mx-auto text-brand-crit" />
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Não foi possível confirmar
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Link de verificação incompleto.</p>
        <Link href="/login" className="inline-block text-sm font-medium text-brand-primary hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-center">
      {status === "loading" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Confirmando seu e-mail...</p>
      )}
      {status === "ok" && (
        <>
          <CheckCircle2 size={32} className="mx-auto text-brand-ok" />
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">E-mail confirmado</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sua conta está pronta. Você já pode entrar.</p>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={32} className="mx-auto text-brand-crit" />
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Não foi possível confirmar
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
        </>
      )}
      <Link href="/login" className="inline-block text-sm font-medium text-brand-primary hover:underline">
        Ir para o login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-zinc-500">Carregando...</p>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
