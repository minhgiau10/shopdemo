import { ImportStockPayload, InventoryStock } from "@/types/inventory";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const inventoryApi = {
  async getAllStocks(): Promise<InventoryStock[]> {
    const res = await fetch(`${GATEWAY_URL}/inventory`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Không thể tải dữ liệu kho");
    return res.json();
  },

  async getStockByProduct(productId: string): Promise<InventoryStock | null> {
    const res = await fetch(`${GATEWAY_URL}/inventory/${productId}`);
    if (!res.ok) return null;
    return res.json();
  },

  async importStock(payload: ImportStockPayload): Promise<InventoryStock> {
    const res = await fetch(`${GATEWAY_URL}/inventory/import`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Nhập kho thất bại");
    return data;
  },
};