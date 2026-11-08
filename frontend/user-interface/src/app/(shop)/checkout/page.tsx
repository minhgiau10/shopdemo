"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ReceiptText
} from "lucide-react";
import { Product } from "@/types/product";

interface OrderItem {
  product: Product;
  quantity: number;
}

const CHECKOUT_ITEMS: OrderItem[] = [
  {
    product: {
      id: "prod-1",
      name: "Bàn phím cơ Custom Akko Mod007 v3",
      description: "Layout 75%, Gasket mount",
      price: 2450000,
      brand: "Akko",
      category: "Bàn phím",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
      isActive: true,
      createdAt: new Date("2026-01-10"),
      updatedAt: new Date("2026-02-15"),
    },
    quantity: 1,
  },
  {
    product: {
      id: "prod-2",
      name: "Chuột không dây Logitech G Pro X Superlight",
      description: "Cảm biến HERO 25K",
      price: 2990000,
      brand: "Logitech",
      category: "Chuột",
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
      isActive: true,
      createdAt: new Date("2026-01-12"),
      updatedAt: new Date("2026-02-20"),
    },
    quantity: 2,
  },
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr" | "vnpay">("cod");
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Hồ Chí Minh",
    note: "",
  });

  const subtotal = CHECKOUT_ITEMS.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 3000000 ? 0 : 30000;
  const totalPrice = subtotal + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
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
          <span className="font-semibold text-slate-800">#DH-849204</span>.
        </p>

        <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm shadow-sm space-y-3">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Người nhận:</span>
            <span className="font-semibold text-slate-800">{formData.fullName || "Nguyễn Văn A"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Số điện thoại:</span>
            <span className="font-medium text-slate-800">{formData.phone || "0987654321"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Địa chỉ giao:</span>
            <span className="font-medium text-slate-800">{formData.address || "123 Đường Số 1"}, {formData.city}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Phương thức:</span>
            <span className="font-medium text-blue-600 uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-slate-900">
            <span>Tổng thanh toán:</span>
            <span className="text-blue-600">{totalPrice.toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Tiếp tục mua hàng
          </Link>
          <Link
            href="/cart"
            className="rounded-xl border border-slate-200 bg-white py-3 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
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

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Họ và tên *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Số điện thoại *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email nhận thông báo</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                     

                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Địa chỉ cụ thể (Số nhà, đường, phường/xã) *</label>
                  <input
                    type="text"
                    required
                  
                    
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Ghi chú cho đơn vị vận chuyển</label>
                  <textarea
                    rows={2}
                
                    
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                      <p className="text-sm font-semibold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-slate-500">Kiểm tra hàng trước khi thanh toán tiền mặt</p>
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
                      <p className="text-sm font-semibold text-slate-800">Chuyển khoản VietQR</p>
                      <p className="text-xs text-slate-500">Quét mã QR qua ứng dụng ngân hàng bất kỳ</p>
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
                      <p className="text-sm font-semibold text-slate-800">Cổng thanh toán VNPay</p>
                      <p className="text-xs text-slate-500">Thẻ ATM nội địa, Visa, Mastercard, JCB</p>
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
                <span>Đơn hàng ({CHECKOUT_ITEMS.length} món)</span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {CHECKOUT_ITEMS.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          Ảnh
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800">{product.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">SL: x{quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                      {(product.price * quantity).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-900">{subtotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-900">
                    {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")} ₫`}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-900">Tổng thanh toán</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    {totalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Xác nhận đặt hàng
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