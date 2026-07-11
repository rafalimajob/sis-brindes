export interface KitItemDTO {
  id: string;
  stockItemId: string;
  quantity: number;
  stockItem: { name: string; code: string };
}

export interface KitDTO {
  id: string;
  name: string;
  items: KitItemDTO[];
}
