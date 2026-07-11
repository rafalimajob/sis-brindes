import { CHART_COLORS } from "@/lib/theme-colors";

// Mapeamento entre o enum OrderStatus (Prisma) e os rótulos em português usados na UI,
// portado 1:1 do protótipo (marketing-ops.jsx) para manter a mesma ordem e cores.
export const ORDER_STATUS_VALUES = [
  "RASCUNHO",
  "EM_ELABORACAO",
  "AGUARDANDO_COTACAO",
  "COTACAO_RECEBIDA",
  "AGUARDANDO_EMISSAO_OC",
  "PEDIDO_ENVIADO_FORNECEDOR",
  "EM_PRODUCAO",
  "EM_TRANSPORTE",
  "ENTREGUE",
  "CANCELADO",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatusValue, string> = {
  RASCUNHO: "Rascunho",
  EM_ELABORACAO: "Em elaboração",
  AGUARDANDO_COTACAO: "Aguardando cotação",
  COTACAO_RECEBIDA: "Cotação recebida",
  AGUARDANDO_EMISSAO_OC: "Aguardando emissão da OC",
  PEDIDO_ENVIADO_FORNECEDOR: "Pedido enviado ao fornecedor",
  EM_PRODUCAO: "Em produção",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_COLOR: Record<OrderStatusValue, string> = {
  RASCUNHO: CHART_COLORS.slate,
  EM_ELABORACAO: CHART_COLORS.slate,
  AGUARDANDO_COTACAO: CHART_COLORS.warn,
  COTACAO_RECEBIDA: CHART_COLORS.warn,
  AGUARDANDO_EMISSAO_OC: CHART_COLORS.accent,
  PEDIDO_ENVIADO_FORNECEDOR: CHART_COLORS.accent,
  EM_PRODUCAO: CHART_COLORS.purple,
  EM_TRANSPORTE: CHART_COLORS.purple,
  ENTREGUE: CHART_COLORS.ok,
  CANCELADO: CHART_COLORS.crit,
};
