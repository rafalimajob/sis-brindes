import type { MovementTypeValue } from "@/lib/movement-types";

export interface MovementDTO {
  id: string;
  date: string;
  direction: "ENTRADA" | "SAIDA";
  type: MovementTypeValue;
  quantity: number;
  project: string | null;
  notes: string | null;
  stockItemId: string;
  stockItem: { name: string; code: string };
  performedBy: { name: string };
}

export interface StockOptionDTO {
  id: string;
  code: string;
  name: string;
  quantity: number;
}
