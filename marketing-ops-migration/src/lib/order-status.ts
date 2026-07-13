import { CHART_COLORS } from "@/lib/theme-colors";

/** Uma cor exclusiva por status (usada na badge da tabela de pedidos e nas
 * barras do gráfico "Pedidos por status" do dashboard — ambos leem deste
 * mesmo mapa, então esta é a única fonte para ajustar as duas visualizações
 * juntas). Antes vários status dividiam a mesma cor de `CHART_COLORS`
 * (ex.: os dois estágios de cotação ficavam idênticos ao olhar a tabela ou
 * o gráfico), o que tornava o status real ambíguo.
 *
 * Segue a paleta oficial (assets/cores.png): os 8 estágios não-terminais
 * avançam em matiz — cinza neutro (ainda não iniciado) → ciano → azul
 * periwinkle → roxo — conforme o pedido evolui, e os dois estágios finais
 * usam as cores semânticas de sucesso/erro já estabelecidas no app
 * (`CHART_COLORS.ok`/`crit`), fora da paleta de marca de propósito. */
const STATUS_PALETTE = {
  neutral: "#9B9B97",
  cyanLight: "#00DBFF",
  cyanDeep: "#01A3F8",
  periwinkleLight: "#94A5F7",
  periwinkleDeep: "#5F4AF4",
  purpleLight: "#C2AEFF",
  purpleMid: "#B27FFB",
  purpleDeep: "#6951A5",
} as const;

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
  RASCUNHO: STATUS_PALETTE.neutral,
  EM_ELABORACAO: STATUS_PALETTE.cyanLight,
  AGUARDANDO_COTACAO: STATUS_PALETTE.cyanDeep,
  COTACAO_RECEBIDA: STATUS_PALETTE.periwinkleLight,
  AGUARDANDO_EMISSAO_OC: STATUS_PALETTE.periwinkleDeep,
  PEDIDO_ENVIADO_FORNECEDOR: STATUS_PALETTE.purpleLight,
  EM_PRODUCAO: STATUS_PALETTE.purpleMid,
  EM_TRANSPORTE: STATUS_PALETTE.purpleDeep,
  ENTREGUE: CHART_COLORS.ok,
  CANCELADO: CHART_COLORS.crit,
};
