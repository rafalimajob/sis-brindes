import { Download, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { REPORT_TYPES, REPORT_LABEL } from "@/lib/reports";

export default function RelatoriosPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Relatórios"
        description="Exportação em Excel (.xlsx), pronta para abrir direto ou importar em outras planilhas."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {REPORT_TYPES.map((type) => (
          <Card key={type} className="flex items-center justify-between gap-3 transition-shadow hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-ok/10 text-brand-ok">
                <FileSpreadsheet size={18} />
              </span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{REPORT_LABEL[type]}</span>
            </span>
            <a
              href={`/api/reports/${type}`}
              download
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Download size={14} /> Exportar
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
