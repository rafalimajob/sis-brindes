import { ButtonHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SaveStatus = "idle" | "saving" | "success";

interface SaveButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  status: SaveStatus;
  idleLabel: string;
  savingLabel: string;
}

/**
 * Botão de salvar padrão para os modais de cadastro/edição: fica verde,
 * mostra um "Salvando..." enquanto a requisição está em andamento e um
 * check animado por um instante antes do modal fechar (ver onSaved dos
 * modais, que agenda o fechamento após esse feedback).
 */
export function SaveButton({ status, idleLabel, savingLabel, className = "", disabled, ...props }: SaveButtonProps) {
  return (
    <Button
      variant="success"
      disabled={status !== "idle" || Boolean(disabled)}
      className={`min-w-36 ${className}`}
      {...props}
    >
      {status === "success" ? (
        <Check size={18} className="animate-check-pop" />
      ) : status === "saving" ? (
        savingLabel
      ) : (
        idleLabel
      )}
    </Button>
  );
}
