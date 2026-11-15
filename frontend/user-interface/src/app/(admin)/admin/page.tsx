"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderApi } from "@/services/order.service";
import { inventoryApi } from "@/services/inventory.service";
import { Order } from "@/types/order";
import { InventoryStock } from "@/types/inventory";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Warehouse,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [ordersData, stocksData] = await Promise.all([
          orderApi.getAllOrders(),
          inventoryApi.getAllStocks(),
        ]);
        setOrders(ordersData);
        setStocks(stocksData);
      } catch (err: any) {
        toast.error(err.message || "Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const lowStockItems = stocks.filter((s) => s.isLowStock);
  const totalAvailableStock = stocks.reduce((sum, s) => sum + s.availableQuantity, 0);

  if (loading) {
    return <div className="text-sm text-slate-500">Đang tổng hợp dữ liệu hệ thống...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-sm text-slate-500">
          Theo dõi doanh thu, tiến độ xử lý đơn hàng và cảnh báo tồn kho theo thời gian thực
        </p>
      </div>

      {/* 4 Thẻ KPI */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Doanh thu ước tính
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalRevenue.toLocaleString("vi-VN")}đ
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Trên {validOrders.length} đơn hợp lệ
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Đơn chờ duyệt
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{pendingCount}</p>
          <Link
            href="/admin/orders"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            Xử lý ngay <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Tổng tồn khả dụng
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalAvailableStock}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Đang quản lý {stocks.length} mã kho
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Cảnh báo sắp hết hàng
            </span>
            <div className="rounded-xl bg-red-50 p-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-red-600">
            {lowStockItems.length}
          </p>
          <Link
            href="/admin/inventory"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            Nhập thêm kho <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 2 Bảng tóm tắt dưới */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Đơn hàng mới nhất */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              Đơn hàng mới nhất
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-800">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.items.length} sản phẩm • {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {order.totalAmount.toLocaleString("vi-VN")}đ
                    </p>
                    <span className="text-[11px] font-medium text-blue-600">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cảnh báo tồn kho thấp */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Sản phẩm sắp hết hàng
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Quản lý kho
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-slate-400">
              Tất cả sản phẩm đều đang có tồn kho ổn định.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-800">
                      {item.productId}
                    </p>
                    <p className="text-xs text-slate-500">
                      SKU: {item.sku || "Chưa gắn"} • {item.warehouseLocation}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                    Còn {item.availableQuantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}