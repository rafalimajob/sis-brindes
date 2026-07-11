"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível criar a conta.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Confira seu e-mail</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enviamos um link de confirmação para <strong>{email}</strong>. Em ambiente de
          desenvolvimento, o link aparece no console do servidor (terminal do <code>npm run dev</code>).
        </p>
        <Link href="/login" className="text-sm font-medium text-brand-primary hover:underline dark:text-blue-300">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Criar conta</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Marketing Ops</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">E-mail</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Senha</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <p className="text-xs text-zinc-400">Mínimo de 8 caracteres.</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-brand-primary hover:underline dark:text-blue-300">
          Entrar
        </Link>
      </p>
    </form>
  );
}
