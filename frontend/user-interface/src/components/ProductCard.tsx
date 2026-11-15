"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    const ok = await addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      quantity: 1,
    });
    setAdding(false);

    if (ok) {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Không có ảnh
            </div>
          )}
        </div>

        <div className="p-4 pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
              {product.brand || "SHOPDEMO"}
            </span>
            {product.category && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {product.category}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-blue-600">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2">
        <span className="text-base font-extrabold text-slate-900">
          {product.price.toLocaleString("vi-VN")} ₫
        </span>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{adding ? "Đang thêm..." : "Thêm"}</span>
        </button>
      </div>
    </div>
  );
}