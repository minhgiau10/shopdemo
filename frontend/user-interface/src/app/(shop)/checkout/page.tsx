"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Truck,
  QrCode,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  Mail,
  ReceiptText,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { orderApi } from "@/services/order.service";
import { paymentApi } from "@/services/payment.service";
import { Order } from "@/types/order";
import { PaymentMethod } from "@/types/payment";

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr" | "vnpay">("cod");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Hồ Chí Minh",
    note: "",
  });

  // Tự động điền thông tin user đang đăng nhập (nếu có)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          fullName: u.fullName || prev.fullName,
          email: u.email || prev.email,
        }));
      } catch {
        // Bỏ qua nếu parse lỗi
      }
    }
  }, []);

  const cartItems = cart?.items || [];

  const subtotal = cartItems.reduce(
    (total: number, item: any) => total + (item.price || 0) * item.quantity,
    0
  );
  const shippingFee = subtotal > 3000000 || subtotal === 0 ? 0 : 30000;
  const totalPrice = subtotal + shippingFee;

  const mapPaymentMethod = (method: "cod" | "qr" | "vnpay"): PaymentMethod => {
    if (method === "vnpay") return "VNPAY";
    if (method === "qr") return "PAYPAL"; // Dùng luồng callback nhanh của PaymentService để demo VietQR/Online
    return "COD";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return;
    }

    setSubmitting(true);
    try {
      const backendMethod = mapPaymentMethod(paymentMethod);
      const fullShippingAddress = `${formData.fullName} (${formData.phone}) - ${formData.address}, ${formData.city}`;

      // 1. Gọi Order Service tạo đơn hàng & giữ kho bên Inventory Service
      const order = await orderApi.createOrder({
        shippingAddress: fullShippingAddress,
        paymentMethod: backendMethod,
        note: formData.note || undefined,
        items: cartItems.map((item: any) => ({
          productId: item.productId || item.product?.id,
          sku: item.sku || item.product?.sku,
          productName: item.productName || item.name || item.product?.name || "Sản phẩm",
          price: item.price || item.product?.price || 0,
          quantity: item.quantity,
        })),
      });

      // 2. Gọi Payment Service khởi tạo giao dịch
      const payment = await paymentApi.createPayment({
        orderId: order.id,
        amount: order.totalAmount,
        method: backendMethod,
      });

      await refreshCart();

      // 3. Nếu thanh toán online (VNPay / VietQR) -> chuyển sang URL thanh toán
      if (payment.paymentUrl) {
        toast.info("Đang chuyển hướng sang cổng thanh toán...");
        window.location.href = payment.paymentUrl;
        return;
      }

      // 4. Nếu COD -> hiện màn hình biên nhận thành công
      setCreatedOrder(order);
      toast.success("Đặt hàng thành công!");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Đặt hàng thành công!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Cảm ơn bạn đã mua sắm tại ShopDemo. Mã đơn hàng của bạn là{" "}
          <span className="font-mono font-semibold text-slate-800">
            #{createdOrder.id.slice(-8).toUpperCase()}
          </span>
          .
        </p>

        <div className="mt-6 w-full space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Người nhận:</span>
            <span className="font-semibold text-slate-800">{formData.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Số điện thoại:</span>
            <span className="font-medium text-slate-800">{formData.phone}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Địa chỉ giao:</span>
            <span className="font-medium text-slate-800">
              {formData.address}, {formData.city}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Phương thức:</span>
            <span className="font-medium uppercase text-blue-600">{paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-slate-900">
            <span>Tổng thanh toán:</span>
            <span className="text-blue-600">
              {createdOrder.totalAmount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/orders"
            className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Theo dõi đơn hàng
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại giỏ hàng</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Thông tin thanh toán
        </h1>
        <p className="text-sm text-slate-500">
          Vui lòng kiểm tra kỹ địa chỉ nhận hàng và thông tin đơn hàng
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cột trái: Thông tin giao hàng & Phương thức */}
          <div className="space-y-6 lg:col-span-2">
            {/* Địa chỉ giao hàng */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Địa chỉ nhận hàng</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email nhận thông báo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Địa chỉ cụ thể (Số nhà, đường, phường/xã) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Ghi chú cho đơn vị vận chuyển
                  </label>
                  <textarea
                    rows={2}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Phương thức thanh toán</span>
              </div>

              <div className="mt-4 space-y-3">
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-xs text-slate-500">
                        Kiểm tra hàng trước khi thanh toán tiền mặt
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 text-blue-600"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod("qr")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "qr"
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Chuyển khoản VietQR
                      </p>
                      <p className="text-xs text-slate-500">
                        Quét mã QR qua ứng dụng ngân hàng bất kỳ
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                    className="h-4 w-4 text-blue-600"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod("vnpay")}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    paymentMethod === "vnpay"
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Cổng thanh toán VNPay
                      </p>
                      <p className="text-xs text-slate-500">
                        Thẻ ATM nội địa, Visa, Mastercard, JCB
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                    className="h-4 w-4 text-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <ReceiptText className="h-5 w-5 text-blue-600" />
                <span>Đơn hàng ({cartItems.length} món)</span>
              </div>

              {cartItems.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  Giỏ hàng đang trống
                </p>
              ) : (
                <div className="mt-4 max-h-72 divide-y divide-slate-100 overflow-y-auto pr-1">
                  {cartItems.map((item: any, idx: number) => {
                    const name = item.productName || item.name || item.product?.name || "Sản phẩm";
                    const price = item.price || item.product?.price || 0;
                    const img = item.imageUrl || item.image || item.product?.imageUrl;

                    return (
                      <div key={item.productId || idx} className="flex items-center gap-3 py-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {img ? (
                            <Image src={img} alt={name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                              Ảnh
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">SL: x{item.quantity}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs font-bold text-slate-900">
                          {(price * item.quantity).toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-900">
                    {subtotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-900">
                    {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")} ₫`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-slate-900">Tổng thanh toán</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    {totalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Đang xử lý đơn hàng..." : "Xác nhận đặt hàng"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Bảo mật thanh toán chuẩn SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}