import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  color,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  color: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex cursor-pointer items-center justify-between transition-shadow hover:shadow-md">
        <div>
          <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </Card>
    </Link>
  );
}
