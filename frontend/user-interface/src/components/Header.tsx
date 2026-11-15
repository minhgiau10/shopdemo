"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import {
  Search,
  ShoppingBag,
  LogIn,
  Store,
  User,
  LogOut,
  MapPin,
  Package,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

interface UserInfo {
  id: string;
  email: string;
  fullName?: string;
  role: string;
}

export function Header() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        refreshCart();
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, [refreshCart]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
    setUser(null);
    setIsDropdownOpen(false);
    refreshCart();
    toast.info("Đã đăng xuất khỏi tài khoản");
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600">
          <Store className="h-6 w-6 stroke-[2.5]" />
          <span>
            SHOP<span className="text-slate-900">DEMO</span>
          </span>
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
              {cart.totalItems}
            </span>
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 shadow-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {avatarInitial}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Trang quản trị (Admin)</span>
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>

                    <Link
                      href="/profile/addresses"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>Sổ địa chỉ nhận hàng</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="h-4 w-4 text-slate-400" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}