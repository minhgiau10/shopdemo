import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Product } from "@/types/product";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Bàn phím cơ Custom Akko Mod007 v3",
    description: "Bàn phím cơ cấu trúc Gasket Mount cao cấp, mạch xuôi hỗ trợ Hotswap 5 pin, keycap PBT Doubleshot bền bỉ, kết nối 3 chế độ (Type-C, Bluetooth 5.0, 2.4GHz) cho trải nghiệm gõ êm ái và linh hoạt.",
    price: 2450000,
    brand: "Akko",
    category: "Bàn phím",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    isActive: true,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-15"),
  },
  {
    id: "prod-2",
    name: "Chuột không dây Logitech G Pro X Superlight",
    description: "Chuột gaming chuyên nghiệp với trọng lượng siêu nhẹ dưới 63g. Tích hợp cảm biến HERO 25K độc quyền, kết nối không dây Lightspeed độ trễ cực thấp, pin dùng liên tục lên đến 70 giờ.",
    price: 2990000,
    brand: "Logitech",
    category: "Chuột",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
    isActive: true,
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-02-20"),
  },
  {
    id: "prod-3",
    name: "Tai nghe Sony WH-1000XM5 Chống ồn",
    description: "Bộ xử lý chống ồn tích hợp V1 và HD QN1, driver 30mm tinh chỉnh riêng mang lại chất âm trong trẻo, thời lượng pin lên đến 30 tiếng có hỗ trợ sạc nhanh.",
    price: 6890000,
    brand: "Sony",
    category: "Tai nghe",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    isActive: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-03-01"),
  },
  {
    id: "prod-4",
    name: "Màn hình Dell UltraSharp U2724D 27 inch 2K",
    description: "Màn hình chuyên đồ họa 27 inch độ phân giải QHD 2K, tấm nền IPS Black với tỷ lệ tương phản 2000:1, tần số quét 120Hz mượt mà, cổng kết nối đa dạng hỗ trợ sạc Type-C PD 90W.",
    price: 8490000,
    brand: "Dell",
    category: "Màn hình",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    isActive: true,
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-03-05"),
  },
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại trang chủ</span>
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Ảnh sản phẩm */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-4"
            />
          ) : (
            <span className="text-slate-400">Chưa có ảnh</span>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-slate-500">{product.category}</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 rounded-xl bg-slate-100 p-4">
              <span className="text-xs text-slate-500 block">Giá bán chính thức</span>
              <span className="text-2xl font-extrabold text-blue-600 sm:text-3xl">
                {product.price.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Mô tả sản phẩm</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white py-3.5 px-6 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Mua ngay
              </button>
            </div>

            {/* Tiện ích cam kết */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Bảo hành chính hãng 12T</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-600" />
                <span>Đổi mới trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}