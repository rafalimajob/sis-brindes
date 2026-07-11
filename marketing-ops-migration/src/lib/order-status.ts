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

const SLATE = "#94A3B8";
const { warn, accent, purple, ok, crit } = {
  warn: "#D9A441",
  accent: "#E86F3B",
  purple: "#7C6FCB",
  ok: "#1F9D6E",
  crit: "#D6503F",
};

export const ORDER_STATUS_COLOR: Record<OrderStatusValue, string> = {
  RASCUNHO: SLATE,
  EM_ELABORACAO: SLATE,
  AGUARDANDO_COTACAO: warn,
  COTACAO_RECEBIDA: warn,
  AGUARDANDO_EMISSAO_OC: accent,
  PEDIDO_ENVIADO_FORNECEDOR: accent,
  EM_PRODUCAO: purple,
  EM_TRANSPORTE: purple,
  ENTREGUE: ok,
  CANCELADO: crit,
};
