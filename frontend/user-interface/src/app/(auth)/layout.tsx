import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-blue-600">
          <Store className="h-7 w-7 stroke-[2.5]" />
          <span>SHOP<span className="text-slate-900">DEMO</span></span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}