"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) {
          throw new Error("Không tìm thấy sản phẩm");
        }
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    const ok = await addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      quantity,
    });
    setAdding(false);

    if (ok) {
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setAdding(true);
    const ok = await addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      quantity,
    });
    setAdding(false);

    if (ok) {
      router.push("/cart");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại danh sách sản phẩm</span>
      </Link>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
          Đang tải thông tin sản phẩm...
        </div>
      ) : !product ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sản phẩm này có thể đã bị xóa hoặc đường dẫn không tồn tại.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Về trang chủ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-8">
          {/* Ảnh sản phẩm */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                Chưa có hình ảnh
              </div>
            )}
          </div>

          {/* Thông tin chi tiết */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase text-blue-600">
                  {product.brand || "CHÍNH HÃNG"}
                </span>
                {product.category && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {product.category}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-extrabold text-blue-600">
                  {product.price.toLocaleString("vi-VN")} ₫
                </p>
                <p className="mt-1 text-xs text-slate-500">Đã bao gồm thuế VAT</p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900">Mô tả sản phẩm</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {product.description || "Sản phẩm chính hãng phân phối tại SHOPDEMO."}
                </p>
              </div>

              {/* Bộ chọn số lượng */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Số lượng:</span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:shadow-xs"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-blue-50 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{adding ? "Đang xử lý..." : "Thêm vào giỏ hàng"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={adding}
                  className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Cam kết dịch vụ */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                <span>Bảo hành chính hãng 12-24 tháng</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <Truck className="h-5 w-5 shrink-0 text-blue-600" />
                <span>Freeship đơn từ 3.000.000 ₫</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <PackageCheck className="h-5 w-5 shrink-0 text-blue-600" />
                <span>Đổi trả miễn phí trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}