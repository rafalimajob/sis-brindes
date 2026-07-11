"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowLeftRight,
  Gift,
  FileBarChart,
  Building2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/consumo-area", label: "Consumo por área", icon: Building2 },
  { href: "/kits", label: "Kits", icon: Gift },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Marketing Ops
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-blue-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        className="m-2 flex h-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </aside>
  );
}
