"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Search, ShoppingCart, Tag, PackageOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Không thể tải danh sách sản phẩm");
        }

        const data: Product[] = await res.json();
        setProducts(data.filter((item) => item.isActive !== false));
      } catch (error) {
        console.error("Fetch products error:", error);
        setErrorMessage("Không thể kết nối đến máy chủ sản phẩm. Vui lòng kiểm tra API Gateway.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["ALL", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "ALL" || product.category === selectedCategory;
      const keyword = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.brand.toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tất cả sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">
            Khám phá linh kiện, gear và phụ kiện chính hãng
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc thương hiệu..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {!isLoading && categories.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {category === "ALL" ? "Tất cả" : category}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm">Đang tải danh sách sản phẩm...</p>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
          {errorMessage}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <PackageOpen className="h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-800">Không tìm thấy sản phẩm</h3>
          <p className="mt-1 text-xs text-slate-500">
            Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
                    Chưa có hình ảnh
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                  {product.brand}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-600">
                  <Tag className="h-3 w-3" />
                  <span>{product.category}</span>
                </div>

                <h2 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                  {product.name}
                </h2>

                {product.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                    {product.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(product.price)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}