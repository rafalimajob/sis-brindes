import { AlertCircle } from "lucide-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950 dark:text-red-400">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}
