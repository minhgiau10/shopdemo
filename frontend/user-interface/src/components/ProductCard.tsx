import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-sm font-medium text-slate-400">Chưa có ảnh</span>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition duration-200 group-hover:opacity-100">
            <Link
              href={`/products/${product.id}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition hover:bg-blue-600 hover:text-white"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-blue-600">{product.brand}</span>
          <span>{product.category}</span>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800 transition hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <span className="text-xs text-slate-400 block">Giá bán</span>
          <span className="text-base font-bold text-slate-900">
            {product.price.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          <span>Xem</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}