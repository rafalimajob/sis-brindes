"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowLeftRight,
  Gift,
  FileBarChart,
  Building2,
  Users,
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

const ADMIN_NAV_ITEM = { href: "/usuarios", label: "Usuários", icon: Users } as const;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = session?.user?.role === "ADMIN" ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <aside
      className={`flex h-screen flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-solid text-xs font-bold text-white">
          A
        </div>
        {!collapsed && (
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Atlas
            </span>
            <span className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">Marketing Ops</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2 pt-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-primary-subtle text-brand-primary"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-primary" />
              )}
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
        className="m-2 flex h-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </aside>
  );
}
