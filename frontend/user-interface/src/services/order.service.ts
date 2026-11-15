import { CreateOrderPayload, Order } from "@/types/order";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const orderApi = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await fetch(`${GATEWAY_URL}/orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đặt hàng thất bại");
    return data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${GATEWAY_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
    return res.json();
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await fetch(`${GATEWAY_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
    return res.json();
  },

  async confirmOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${GATEWAY_URL}/orders/${orderId}/confirm`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể xác nhận đơn");
    return data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${GATEWAY_URL}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể hủy đơn hàng");
    return data;
  },
};