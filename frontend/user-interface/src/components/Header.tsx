import Link from "next/link";
import { Search, ShoppingBag, LogIn, Store } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600">
          <Store className="h-6 w-6 stroke-[2.5]" />
          <span>SHOP<span className="text-slate-900">DEMO</span></span>
        </Link>

        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm linh kiện, gear, phụ kiện..."
              className="w-full rounded-full border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <ShoppingBag className="h-5 w-5 text-slate-600" />
            <span className="hidden sm:inline font-medium">Giỏ hàng</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
              3
            </span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Đăng nhập</span>
          </Link>
        </div>
      </div>
    </header>
  );
}