import { CreatePaymentPayload, Payment } from "@/types/payment";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const paymentApi = {
  async createPayment(payload: CreatePaymentPayload): Promise<Payment> {
    const res = await fetch(`${GATEWAY_URL}/payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Khởi tạo thanh toán thất bại");
    return data;
  },

  async getAllPayments(): Promise<Payment[]> {
    const res = await fetch(`${GATEWAY_URL}/payments`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Không thể tải lịch sử giao dịch");
    return res.json();
  },

  async getPaymentByOrder(orderId: string): Promise<Payment | null> {
    const res = await fetch(`${GATEWAY_URL}/payments/order/${orderId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },
};