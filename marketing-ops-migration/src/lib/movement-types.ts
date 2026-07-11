export const ENTRADA_TYPES = ["COMPRA", "DEVOLUCAO", "AJUSTE_ENTRADA"] as const;
export const SAIDA_TYPES = ["EVENTO", "BRINDE", "KIT", "CONSUMO_INTERNO", "AJUSTE_SAIDA"] as const;

export type MovementTypeValue = (typeof ENTRADA_TYPES)[number] | (typeof SAIDA_TYPES)[number];

export const MOVEMENT_TYPE_LABEL: Record<MovementTypeValue, string> = {
  COMPRA: "Compra",
  DEVOLUCAO: "Devolução",
  AJUSTE_ENTRADA: "Ajuste de estoque",
  EVENTO: "Evento",
  BRINDE: "Brinde",
  KIT: "Kit",
  CONSUMO_INTERNO: "Consumo interno",
  AJUSTE_SAIDA: "Ajuste",
};
