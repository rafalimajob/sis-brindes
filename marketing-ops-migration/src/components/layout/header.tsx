"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Search, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative w-full max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Pesquisar pedidos, itens, kits..."
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-sm font-medium text-white"
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="truncate px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                {session?.user?.email}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
