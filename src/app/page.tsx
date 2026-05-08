"use client";

import { useGasData } from "@/hooks/use-gas-data";
import { AlertTriangle, Package, Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  "cylinder-12kg": "Bình 12kg",
  "cylinder-45kg": "Bình 45kg",
  mini: "Gas mini",
  accessory: "Phụ kiện",
};

export default function DashboardPage() {
  const { products, isReady } = useGasData();

  if (!isReady) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const totalInventoryValue = products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);
  const lowStockProducts = products.filter((p) => p.quantity <= p.lowStockThreshold);
  const outOfStock = products.filter((p) => p.quantity === 0);
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tổng quan kho hàng</h1>
        <p className="mt-1 text-sm text-slate-500">Tình trạng hàng hóa gas hiện tại</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng mặt hàng</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{products.length}</p>
                <p className="mt-1 text-xs text-slate-400">loại sản phẩm</p>
              </div>
              <div className="rounded-xl bg-indigo-100 p-3">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng số lượng tồn</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{totalUnits}</p>
                <p className="mt-1 text-xs text-slate-400">sản phẩm các loại</p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3">
                <Warehouse className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Giá trị tồn kho</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totalInventoryValue)}</p>
                <p className="mt-1 text-xs text-slate-400">theo giá nhập</p>
              </div>
              <div className="rounded-xl bg-purple-100 p-3">
                <Warehouse className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Cảnh báo tồn kho</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
                <p className="mt-1 text-xs text-slate-400">{outOfStock.length} hết hàng</p>
              </div>
              <div className="rounded-xl bg-yellow-100 p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Cảnh báo tồn kho thấp</p>
            <p className="mt-1 text-sm text-yellow-700">
              {lowStockProducts.map((p) => `${p.name} (con ${p.quantity} ${p.unit})`).join(" - ")}
            </p>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Danh sách hàng hóa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Sản phẩm</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Danh mục</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Tồn kho</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Giá nhập</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Giá bán</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLow = product.quantity <= product.lowStockThreshold;
                  const isOut = product.quantity === 0;
                  return (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="max-w-xs truncate text-xs text-slate-400">{product.description}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${isOut ? "text-red-600" : isLow ? "text-yellow-600" : "text-slate-900"}`}>
                          {product.quantity}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">{product.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(product.purchasePrice)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-4 py-3">
                        {isOut ? (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Hết hàng</span>
                        ) : isLow ? (
                          <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Sắp hết</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Còn hàng</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
