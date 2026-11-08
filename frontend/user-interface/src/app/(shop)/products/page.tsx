import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Tất cả sản phẩm</h1>
        <p className="mt-2 text-sm text-slate-500">
          Danh mục sản phẩm đầy đủ đang được cập nhật.
        </p>
      </div>
    </div>
  );
}