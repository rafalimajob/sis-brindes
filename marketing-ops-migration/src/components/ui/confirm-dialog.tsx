"use client";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Sim",
  cancelLabel = "Não",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Confirmando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
