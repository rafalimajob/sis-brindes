import type { OrderStatusValue } from "@/lib/order-status";

export interface AttachmentDTO {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface OrderDTO {
  id: string;
  stockItemId: string;
  stockItem: { name: string; code: string };
  quantity: number;
  ocNumber: string;
  project: string;
  status: OrderStatusValue;
  requestDate: string;
  expectedDate: string | null;
  deliveredDate: string | null;
  notes: string | null;
  attachments: AttachmentDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFormValues {
  stockItemId: string;
  quantity: number;
  ocNumber: string;
  project: string;
  status: OrderStatusValue;
  requestDate: string;
  expectedDate: string;
  deliveredDate: string;
  notes: string;
}
