"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    router.push(redirectUrl);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Đăng nhập để tiếp tục thanh toán và quản lý đơn hàng</p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
            <Link href="#" className="text-xs font-medium text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
        >
          <span>Đăng nhập</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          href={`/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-semibold text-blue-600 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-400">Đang tải form...</div>}>
      <LoginForm />
    </Suspense>
  );
}