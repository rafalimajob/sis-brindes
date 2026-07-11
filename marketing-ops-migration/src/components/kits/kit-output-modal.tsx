"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SaveButton, type SaveStatus } from "@/components/ui/save-button";
import type { KitDTO } from "@/types/kit";

export function KitOutputModal({
  kit,
  onClose,
  onSaved,
}: {
  kit: KitDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("saving");
    try {
      const res = await fetch(`/api/kits/${kit.id}/output`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, project, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível registrar a saída do kit.");
      onSaved();
      setStatus("success");
      setTimeout(onClose, 550);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setStatus("idle");
    }
  }

  return (
    <Modal title={`Saída de kit: ${kit.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="grid gap-3">
          <Input
            label="Quantidade de kits"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <Input label="Projeto/Campanha" value={project} onChange={(e) => setProject(e.target.value)} />
          <TextArea label="Observação" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Isso reduzirá automaticamente o estoque de todos os itens que compõem o kit.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={status !== "idle"}>
            Cancelar
          </Button>
          <SaveButton type="submit" status={status} idleLabel="Confirmar saída" savingLabel="Confirmando..." />
        </div>
      </form>
    </Modal>
  );
}
