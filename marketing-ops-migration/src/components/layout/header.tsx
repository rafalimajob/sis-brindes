"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Search, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Abrir menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="relative hidden w-full max-w-sm sm:block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Pesquisar pedidos, itens, kits..."
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-700 dark:focus:bg-zinc-900"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-solid text-sm font-medium text-white ring-2 ring-transparent transition-shadow hover:ring-zinc-200 dark:hover:ring-zinc-800"
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </button>

          {menuOpen && (
            <div className="animate-modal-in absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
                <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {session?.user?.name ?? "Usuário"}
                </div>
                <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{session?.user?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
