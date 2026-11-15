export interface InventoryStock {
  id: string;
  productId: string;
  sku?: string | null;
  warehouseLocation?: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportStockPayload {
  productId: string;
  sku?: string;
  warehouseLocation?: string;
  quantity: number;
  lowStockThreshold?: number;
}