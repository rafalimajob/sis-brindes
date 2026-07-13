"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível entrar.");

      const target = data.mfaEnabled ? "/mfa-challenge" : "/mfa-setup";
      router.push(`${target}?ticket=${encodeURIComponent(data.ticket)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Entrar</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Acesse sua conta do Marketing Ops</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-medium text-brand-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
