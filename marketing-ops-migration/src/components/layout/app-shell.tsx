"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/** Dono do estado do menu mobile — Sidebar e Header são componentes irmãos
 * (não um dentro do outro), então esse estado precisa viver aqui em cima
 * para o botão de hambúrguer do Header conseguir abrir/fechar o Sidebar.
 * O próprio Sidebar fecha o menu ao clicar em um link de navegação. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileNavOpen && (
        <div
          aria-hidden
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-zinc-900/50 backdrop-blur-[1px] md:hidden"
        />
      )}
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-6 dark:bg-zinc-950">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
