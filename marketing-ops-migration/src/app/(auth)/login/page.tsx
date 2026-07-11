"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Entrar</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Marketing Ops</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Senha</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-medium text-brand-primary hover:underline dark:text-blue-300">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
