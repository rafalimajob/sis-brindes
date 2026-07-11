"use client";

import { useState, FormEvent, DragEvent, useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SaveButton, type SaveStatus } from "@/components/ui/save-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ORDER_STATUS_VALUES, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderDTO, OrderFormValues, AttachmentDTO } from "@/types/order";
import type { OrderStatusValue } from "@/lib/order-status";
import type { StockOptionDTO } from "@/types/movement";

function toFormValues(order?: OrderDTO, stock?: StockOptionDTO[]): OrderFormValues {
  return {
    stockItemId: order?.stockItemId ?? stock?.[0]?.id ?? "",
    quantity: order?.quantity ?? 1,
    ocNumber: order?.ocNumber ?? "",
    project: order?.project ?? "",
    status: order?.status ?? "RASCUNHO",
    requestDate: order?.requestDate ? order.requestDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    expectedDate: order?.expectedDate ? order.expectedDate.slice(0, 10) : "",
    deliveredDate: order?.deliveredDate ? order.deliveredDate.slice(0, 10) : "",
    notes: order?.notes ?? "",
  };
}

export function OrderModal({
  order,
  stock,
  onClose,
  onSaved,
}: {
  order?: OrderDTO;
  stock: StockOptionDTO[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<OrderFormValues>(() => toFormValues(order, stock));
  const [currentOrder, setCurrentOrder] = useState<OrderDTO | undefined>(order);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [confirmingDeliverySaving, setConfirmingDeliverySaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleStatusChange(nextStatus: OrderStatusValue) {
    if (nextStatus === "ENTREGUE" && form.status !== "ENTREGUE") {
      setConfirmingDelivery(true);
      return;
    }
    set("status", nextStatus);
  }

  async function confirmDelivery() {
    set("status", "ENTREGUE");

    if (!currentOrder) {
      // Pedido ainda não existe: a confirmação só marca o status localmente,
      // o crédito no estoque acontece ao criar o pedido (POST).
      setConfirmingDelivery(false);
      return;
    }

    setConfirmingDeliverySaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENTREGUE", ...(form.deliveredDate ? { deliveredDate: form.deliveredDate } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível confirmar a entrega.");
      setCurrentOrder(data);
      setForm((f) => ({ ...f, status: "ENTREGUE", deliveredDate: data.deliveredDate?.slice(0, 10) ?? f.deliveredDate }));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setConfirmingDeliverySaving(false);
      setConfirmingDelivery(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("saving");
    try {
      const res = await fetch(currentOrder ? `/api/orders/${currentOrder.id}` : "/api/orders", {
        method: currentOrder ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível salvar o pedido.");
      setCurrentOrder(data);
      onSaved();
      setStatus("success");
      setTimeout(onClose, 550);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setStatus("idle");
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!currentOrder) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`/api/orders/${currentOrder.id}/attachments`, { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Não foi possível anexar o arquivo.");
        setCurrentOrder((prev) => (prev ? { ...prev, attachments: [...prev.attachments, data as AttachmentDTO] } : prev));
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao anexar arquivo.");
    } finally {
      setUploading(false);
    }
  }

  async function removeAttachment(attachment: AttachmentDTO) {
    if (!currentOrder) return;
    const res = await fetch(`/api/orders/${currentOrder.id}/attachments/${attachment.id}`, { method: "DELETE" });
    if (res.ok) {
      setCurrentOrder((prev) =>
        prev ? { ...prev, attachments: prev.attachments.filter((a) => a.id !== attachment.id) } : prev
      );
      onSaved();
    }
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }

  return (
    <Modal title={currentOrder ? "Editar pedido" : "Novo pedido de compra"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Item do estoque"
            value={form.stockItemId}
            onChange={(e) => set("stockItemId", e.target.value)}
            required
          >
            {stock.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </Select>
          <Input
            label="Quantidade"
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
            required
          />
          <Input label="Número da OC" value={form.ocNumber} onChange={(e) => set("ocNumber", e.target.value)} required />
          <Input label="Projeto/Campanha" value={form.project} onChange={(e) => set("project", e.target.value)} required />
          <Select label="Status" value={form.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatusValue)}>
            {ORDER_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          <Input
            label="Data da solicitação"
            type="date"
            value={form.requestDate}
            onChange={(e) => set("requestDate", e.target.value)}
            required
          />
          <Input
            label="Previsão de entrega"
            type="date"
            value={form.expectedDate}
            onChange={(e) => set("expectedDate", e.target.value)}
          />
          <Input
            label="Data efetiva de entrega"
            type="date"
            value={form.deliveredDate}
            onChange={(e) => set("deliveredDate", e.target.value)}
          />

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Anexos</span>
            {currentOrder ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs transition-colors ${
                  dragOver
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                <Paperclip size={14} />
                {uploading ? "Enviando..." : "Arraste ou clique para anexar"}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                />
              </label>
            ) : (
              <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-400 dark:border-zinc-800">
                Salve o pedido para anexar arquivos.
              </p>
            )}
            {currentOrder && currentOrder.attachments.length > 0 && (
              <ul className="space-y-1 text-xs">
                {currentOrder.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 text-zinc-500 dark:text-zinc-400">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                      {a.filename}
                    </a>
                    <button type="button" onClick={() => removeAttachment(a)} className="text-brand-crit hover:opacity-70">
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <TextArea label="Observações" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={status !== "idle"}>
            Fechar
          </Button>
          <SaveButton type="submit" status={status} idleLabel="Salvar pedido" savingLabel="Salvando..." />
        </div>
      </form>

      {confirmingDelivery && (
        <ConfirmDialog
          title="Confirmar entrega"
          message="Esse pedido realmente foi entregue? A quantidade será somada automaticamente ao estoque."
          confirmLabel="Sim"
          cancelLabel="Não"
          loading={confirmingDeliverySaving}
          onConfirm={confirmDelivery}
          onCancel={() => setConfirmingDelivery(false)}
        />
      )}
    </Modal>
  );
}
