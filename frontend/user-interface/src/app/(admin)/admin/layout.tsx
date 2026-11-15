"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  Store,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan (Dashboard)", icon: LayoutDashboard },
  { href: "/admin/products", label: "Quản lý sản phẩm", icon: Package },
  { href: "/admin/inventory", label: "Quản lý tồn kho", icon: Warehouse },
  { href: "/admin/orders", label: "Quản lý đơn hàng", icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      toast.error("Vui lòng đăng nhập tài khoản quản trị");
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "ADMIN") {
        toast.error("Bạn không có quyền truy cập trang quản trị");
        router.replace("/");
        return;
      }
      setAdminUser(parsed);
      setAuthorized(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
    toast.info("Đã đăng xuất");
    router.push("/login");
  };

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Đang xác thực quyền quản trị...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar trái */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">
              SHOP<span className="text-blue-600">ADMIN</span>
            </p>
            <p className="text-[11px] text-slate-400">Hệ thống quản trị</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-slate-100 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <Store className="h-4 w-4 text-slate-400" />
            <span>Về trang cửa hàng</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Khung nội dung bên phải */}
      <div className="flex flex-1 flex-col pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <p className="text-sm font-medium text-slate-500">
            Xin chào,{" "}
            <span className="font-semibold text-slate-900">
              {adminUser?.fullName || adminUser?.email}
            </span>
          </p>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            ROLE: {adminUser?.role}
          </span>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}