import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Marketing Ops
        </span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {children}
        </div>
      </main>
    </div>
  );
}
