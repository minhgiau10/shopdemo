"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderApi } from "@/services/order.service";
import { CheckCircle2, XCircle, PackageSearch } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPING: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await orderApi.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirm = async (orderId: string) => {
    try {
      await orderApi.confirmOrder(orderId);
      toast.success("Đã duyệt đơn & xuất trừ kho thành công!");
      loadOrders();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await orderApi.cancelOrder(orderId);
      toast.success("Đã hủy đơn & hoàn trả tồn kho!");
      loadOrders();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-slate-500">
            Duyệt đơn để xuất kho chính thức hoặc hủy đơn để hoàn kho tự động
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-slate-500">
          <PackageSearch className="mb-2 h-8 w-8 text-slate-400" />
          <p className="text-sm">Chưa có đơn hàng nào trên hệ thống</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Mã đơn</th>
                <th className="px-4 py-3.5">Sản phẩm đặt</th>
                <th className="px-4 py-3.5">Địa chỉ / Thanh toán</th>
                <th className="px-4 py-3.5">Tổng tiền</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-800">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1 text-xs">
                      {order.items?.map((item: any) => (
                        <li key={item.id} className="text-slate-700">
                          <span className="font-medium">{item.productName}</span>{" "}
                          <span className="text-slate-400">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">
                    <p className="max-w-[220px] truncate font-medium text-slate-800">
                      {order.shippingAddress}
                    </p>
                    <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-blue-600">
                    {order.totalAmount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLE[order.status] || STATUS_STYLE.PENDING
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {order.status === "PENDING" ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirm(order.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Duyệt & Xuất kho
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(order.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}