export type PaymentMethod = "COD" | "VNPAY" | "PAYPAL";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  paymentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}