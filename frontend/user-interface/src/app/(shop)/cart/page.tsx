"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { Product } from "@/types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

const INITIAL_CART_ITEMS: CartItem[] = [
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 0 ? (subtotal > 3000000 ? 0 : 30000) : 0;
  const totalPrice = subtotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Hãy dạo quanh cửa hàng và chọn những món đồ bạn yêu thích nhé!
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tiếp tục mua hàng</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Giỏ hàng của bạn
        </h1>
        <p className="text-sm text-slate-500">
          Bạn đang có {cartItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm trong giỏ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Danh sách mặt hàng */}
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No img
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase text-blue-600">
                    {product.brand}
                  </span>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-800 transition hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>

              {/* Điều khiển số lượng & Xóa */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:shadow-xs"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Xóa khỏi giỏ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tiếp tục chọn thêm sản phẩm</span>
            </Link>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-900">Tóm tắt đơn hàng</h2>

          <div className="mt-4 space-y-3 text-sm">
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

            {shippingFee === 0 && (
              <p className="text-[11px] text-emerald-600 font-medium">
                ✓ Miễn phí vận chuyển cho đơn trên 3.000.000 ₫
              </p>
            )}

            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-900">Tổng cộng</span>
                <span className="text-xl font-extrabold text-blue-600">
                  {totalPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Đã bao gồm thuế VAT (nếu có)</p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <span>Tiến hành thanh toán</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}