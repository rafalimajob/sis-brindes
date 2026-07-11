export interface StockItemDTO {
  id: string;
  code: string;
  name: string;
  category: string;
  photoUrl: string | null;
  quantity: number;
  minStock: number;
  idealStock: number;
  lastCost: string | null;
  lastPurchaseDate: string | null;
  location: string | null;
  createdById: string;
  updatedById: string;
  updatedBy?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface StockItemFormValues {
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  idealStock: number;
  lastCost: string;
  lastPurchaseDate: string;
  location: string;
}
