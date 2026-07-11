import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { REPORT_TYPES, REPORT_LABEL } from "@/lib/reports";

export default function RelatoriosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Relatórios</h1>
      <p className="-mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Exportação em Excel (.xlsx), pronta para abrir direto ou importar em outras planilhas.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {REPORT_TYPES.map((type) => (
          <Card key={type} className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{REPORT_LABEL[type]}</span>
            <a
              href={`/api/reports/${type}`}
              download
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Download size={14} /> Exportar
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
