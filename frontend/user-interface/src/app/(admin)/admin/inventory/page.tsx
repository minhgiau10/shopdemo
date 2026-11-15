"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { inventoryApi } from "@/services/inventory.service";
import { Warehouse, PlusCircle, AlertTriangle } from "lucide-react";

export default function AdminInventoryPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [warehouseLocation, setWarehouseLocation] = useState("Kho chính HCM");
  const [submitting, setSubmitting] = useState(false);

  const loadStocks = async () => {
    try {
      const data = await inventoryApi.getAllStocks();
      setStocks(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) return;
    setSubmitting(true);
    try {
      await inventoryApi.importStock({
        productId: productId.trim(),
        sku: sku.trim() || undefined,
        warehouseLocation,
        quantity: Number(quantity),
      });
      toast.success("Nhập kho thành công!");
      setProductId("");
      setSku("");
      setQuantity(10);
      loadStocks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Warehouse className="h-6 w-6 text-blue-600" />
        Quản lý Tồn kho (Inventory)
      </h1>

      {/* Form nhập kho nhanh */}
      <form
        onSubmit={handleImport}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-5"
      >
        <input
          type="text"
          required
          placeholder="Product ID *"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Mã SKU (VD: IP15-BLK)"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Vị trí kho"
          value={warehouseLocation}
          onChange={(e) => setWarehouseLocation(e.target.value)}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="number"
          min={1}
          required
          placeholder="Số lượng nhập"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <PlusCircle className="h-4 w-4" />
          {submitting ? "Đang nhập..." : "Nhập kho"}
        </button>
      </form>

      {/* Bảng tồn kho */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3.5">Product ID</th>
              <th className="px-4 py-3.5">SKU</th>
              <th className="px-4 py-3.5">Vị trí kho</th>
              <th className="px-4 py-3.5">Khả dụng (Available)</th>
              <th className="px-4 py-3.5">Đang giữ (Reserved)</th>
              <th className="px-4 py-3.5">Cảnh báo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stocks.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">
                  {s.productId}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{s.sku || "—"}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{s.warehouseLocation}</td>
                <td className="px-4 py-3.5 font-bold text-emerald-600">{s.availableQuantity}</td>
                <td className="px-4 py-3.5 font-semibold text-amber-600">{s.reservedQuantity}</td>
                <td className="px-4 py-3.5">
                  {s.isLowStock ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Sắp hết hàng
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Ổn định</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}