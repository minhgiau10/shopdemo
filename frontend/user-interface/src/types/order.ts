export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "VNPAY" | "PAYPAL";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sku?: string | null;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemPayload {
  productId: string;
  sku?: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  note?: string;
  items: CreateOrderItemPayload[];
}