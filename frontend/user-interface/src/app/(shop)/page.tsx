import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Bàn phím cơ Custom Akko Mod007 v3",
    description: "Layout 75%, Gasket mount, RGB mạch xuôi",
    price: 2450000,
    brand: "Akko",
    category: "Bàn phím",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    isActive: true,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-15"),
  },
  {
    id: "prod-2",
    name: "Chuột không dây Logitech G Pro X Superlight",
    description: "Trọng lượng siêu nhẹ dưới 63g, cảm biến HERO 25K",
    price: 2990000,
    brand: "Logitech",
    category: "Chuột",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
    isActive: true,
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-02-20"),
  },
  {
    id: "prod-3",
    name: "Tai nghe Sony WH-1000XM5 Chống ồn",
    description: "Công nghệ chống ồn chủ động hàng đầu, pin 30 giờ",
    price: 6890000,
    brand: "Sony",
    category: "Tai nghe",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    isActive: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-03-01"),
  },
  {
    id: "prod-4",
    name: "Màn hình Dell UltraSharp U2724D 27 inch 2K",
    description: "Tấm nền IPS Black, 120Hz, độ phủ màu 100% sRGB",
    price: 8490000,
    brand: "Dell",
    category: "Màn hình",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    isActive: true,
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-03-05"),
  },
];

export default function HomePage() {
  const activeProducts = MOCK_PRODUCTS.filter((p) => p.isActive);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-12 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-white shadow-lg md:p-12">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            🔥 Thiết bị công nghệ chính hãng
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Nâng tầm không gian làm việc của bạn.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
            Cung cấp linh kiện, gaming gear và thiết bị công nghệ chính hãng với chế độ bảo hành uy tín.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 shadow-sm"
            >
              <span>Khám phá sản phẩm</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Sản phẩm nổi bật
            </h2>
            <p className="text-sm text-slate-500">Các sản phẩm đang sẵn hàng tại kho</p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Tất cả</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}