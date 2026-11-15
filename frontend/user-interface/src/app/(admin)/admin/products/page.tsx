"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { inventoryApi } from "@/services/inventory.service";
import { InventoryStock } from "@/types/inventory";
import {
  Package,
  Plus,
  Trash2,
  Warehouse,
  Search,
  AlertTriangle,
  X,
} from "lucide-react";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stocksMap, setStocksMap] = useState<Record<string, InventoryStock>>({});
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  // State Modal Thêm sản phẩm mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: 0,
    category: "",
    image: "",
    description: "",
    initialStock: 10,
  });
  const [creating, setCreating] = useState(false);

  // State Modal Nhập thêm kho cho 1 sản phẩm
  const [importTarget, setImportTarget] = useState<Product | null>(null);
  const [importQty, setImportQty] = useState(10);
  const [warehouseLoc, setWarehouseLoc] = useState("Kho chính HCM");
  const [importing, setImporting] = useState(false);

  const getHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, stocksData] = await Promise.all([
        fetch(`${GATEWAY_URL}/products`, { headers: getHeaders() }),
        inventoryApi.getAllStocks().catch(() => []),
      ]);

      if (!prodRes.ok) throw new Error("Không thể tải danh sách sản phẩm");
      const prodJson = await prodRes.json();
      const prodList: Product[] = Array.isArray(prodJson)
        ? prodJson
        : prodJson.data || [];

      const map: Record<string, InventoryStock> = {};
      for (const s of stocksData) {
        map[s.productId] = s;
      }

      setProducts(prodList);
      setStocksMap(map);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tạo sản phẩm mới + tự khởi tạo tồn kho ban đầu
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/products`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: newProduct.name.trim(),
          sku: newProduct.sku.trim() || undefined,
          price: Number(newProduct.price),
          category: newProduct.category.trim() || "Chung",
          image: newProduct.image.trim() || undefined,
          description: newProduct.description.trim() || undefined,
        }),
      });

      const created = await res.json();
      if (!res.ok) throw new Error(created.message || "Tạo sản phẩm thất bại");

      // Nếu có nhập số lượng tồn đầu kỳ -> gọi sang Inventory Service
      const createdId = created.id || created._id;
      if (createdId && Number(newProduct.initialStock) > 0) {
        await inventoryApi.importStock({
          productId: createdId,
          sku: newProduct.sku.trim() || undefined,
          quantity: Number(newProduct.initialStock),
          warehouseLocation: "Kho chính HCM",
        });
      }

      toast.success("Thêm sản phẩm & khởi tạo kho thành công!");
      setIsAddModalOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        price: 0,
        category: "",
        image: "",
        description: "",
        initialStock: 10,
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    try {
      const res = await fetch(`${GATEWAY_URL}/products/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Xóa sản phẩm thất bại");
      toast.success("Đã xóa sản phẩm");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Nhập thêm kho cho sản phẩm đang chọn
  const handleQuickImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTarget) return;
    setImporting(true);
    try {
      await inventoryApi.importStock({
        productId: importTarget.id,
        sku: importTarget.sku || undefined,
        warehouseLocation: warehouseLoc,
        quantity: Number(importQty),
      });
      toast.success(`Đã nhập thêm ${importQty} sản phẩm vào kho!`);
      setImportTarget(null);
      setImportQty(10);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setImporting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      p.sku?.toLowerCase().includes(keyword.toLowerCase()) ||
      p.id?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Nút thêm mới */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Package className="h-6 w-6 text-blue-600" />
            Quản lý sản phẩm & Tồn kho
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý danh mục hàng hóa (Product Service) đồng bộ tồn kho thực tế (Inventory Service)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên sản phẩm, SKU hoặc ID..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Bảng danh sách sản phẩm */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Đang tải danh sách sản phẩm và dữ liệu kho...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Không tìm thấy sản phẩm nào. Hãy bấm &ldquo;Thêm sản phẩm mới&rdquo; để bắt đầu.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Sản phẩm</th>
                <th className="px-4 py-3.5">SKU / Danh mục</th>
                <th className="px-4 py-3.5">Giá bán</th>
                <th className="px-4 py-3.5">Tồn khả dụng</th>
                <th className="px-4 py-3.5">Đang giữ đơn</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const stock = stocksMap[product.id];
                const available = stock?.availableQuantity ?? 0;
                const reserved = stock?.reservedQuantity ?? 0;
                const isLow = !stock || stock.isLowStock;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{product.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs">
                      <p className="font-mono font-medium text-slate-700">
                        {product.sku || stock?.sku || "—"}
                      </p>
                      <p className="text-slate-400">{product.category || "Chưa phân loại"}</p>
                    </td>

                    <td className="px-4 py-4 font-semibold text-blue-600">
                      {(product.price || 0).toLocaleString("vi-VN")}đ
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            available === 0
                              ? "text-red-600"
                              : isLow
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {available}
                        </span>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            {available === 0 ? "Hết hàng" : "Sắp hết"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-600">{reserved}</td>

                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setImportTarget(product)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          <Warehouse className="h-3.5 w-3.5" />
                          Nhập kho
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Thêm sản phẩm mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Thêm sản phẩm mới</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="VD: Bàn phím cơ Keychron K2 Pro"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Mã SKU
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="VD: KC-K2PRO-BLK"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Danh mục
                  </label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    placeholder="VD: Bàn phím"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Tồn kho khởi tạo
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.initialStock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        initialStock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Link hình ảnh (URL)
                </label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Nhập thêm kho nhanh cho sản phẩm */}
      {importTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Nhập kho: {importTarget.name}
              </h2>
              <button
                type="button"
                onClick={() => setImportTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleQuickImport} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Số lượng nhập thêm *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={importQty}
                  onChange={(e) => setImportQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Vị trí kho lưu trữ
                </label>
                <input
                  type="text"
                  value={warehouseLoc}
                  onChange={(e) => setWarehouseLoc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? "Đang nhập kho..." : "Xác nhận nhập kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}