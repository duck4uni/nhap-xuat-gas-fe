"use client";

import { useGasData } from "@/hooks/use-gas-data";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function BaoCaoPage() {
  const { products, importOrders, exportOrders, customers } = useGasData();

  const totalImportCost = importOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount + o.shippingCost, 0);

  const totalRevenue = exportOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidRevenue = exportOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const unpaidRevenue = totalRevenue - paidRevenue;

  const grossProfit = paidRevenue - totalImportCost;

  // Top customers by revenue
  const customerRevenue = customers.map((c) => ({
    ...c,
    totalRevenue: exportOrders
      .filter((o) => o.customerId === c.id)
      .reduce((sum, o) => sum + o.totalAmount, 0),
    orderCount: exportOrders.filter((o) => o.customerId === c.id).length,
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Product sales
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const order of exportOrders) {
    for (const item of order.items) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.total;
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

  // Monthly data (simplified - use seed + orders)
  const monthlyExport = [
    { month: "Th12/2025", import: 15200000, export: 18500000 },
    { month: "Th1/2026", import: 18000000, export: 22000000 },
    { month: "Th2/2026", import: 16500000, export: 19800000 },
    { month: "Th3/2026", import: 21000000, export: 25600000 },
    { month: "Th4/2026", import: 19000000, export: 23100000 },
    { month: "Th5/2026", import: totalImportCost || 14500000, export: totalRevenue || 11570000 },
  ];
  const maxBar = Math.max(...monthlyExport.flatMap((m) => [m.import, m.export]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Báo cáo &amp; Thống kê</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng hợp tình hình kinh doanh theo thời gian</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng doanh thu</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-xl bg-indigo-100 p-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng chi phí nhập</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalImportCost)}</p>
              </div>
              <div className="rounded-xl bg-red-100 p-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Lợi nhuận gộp</p>
            <p className={`mt-1 text-xl font-bold ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(grossProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Công nợ chưa thu</p>
            <p className="mt-1 text-xl font-bold text-yellow-600">{formatCurrency(unpaidRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Import/Export Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Nhập xuất 6 tháng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-indigo-400" /> Doanh thu xuất
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-slate-300" /> Chi phí nhập
            </span>
          </div>
          <div className="overflow-x-auto">
          <div className="flex h-52 items-end gap-2 min-w-[360px]">
            {monthlyExport.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full gap-1 items-end" style={{ height: "150px" }}>
                  <div
                    className="flex-1 rounded-t bg-indigo-400 transition-all hover:bg-indigo-500"
                    style={{ height: `${Math.round((d.export / maxBar) * 100)}%`, minHeight: "4px" }}
                    title={formatCurrency(d.export)}
                  />
                  <div
                    className="flex-1 rounded-t bg-slate-300 transition-all hover:bg-slate-400"
                    style={{ height: `${Math.round((d.import / maxBar) * 100)}%`, minHeight: "4px" }}
                    title={formatCurrency(d.import)}
                  />
                </div>
                <span className="text-[10px] text-slate-400 text-center">{d.month}</span>
              </div>
            ))}
          </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerRevenue.filter((c) => c.totalRevenue > 0).slice(0, 5).map((c, idx) => {
                const maxRev = customerRevenue[0]?.totalRevenue || 1;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-xs text-slate-400">({c.orderCount} đơn)</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatCurrency(c.totalRevenue)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-indigo-400"
                        style={{ width: `${Math.round((c.totalRevenue / maxRev) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {customerRevenue.filter((c) => c.totalRevenue > 0).length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((p, idx) => {
                const maxRev = topProducts[0]?.revenue || 1;
                return (
                  <div key={p.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{p.name}</span>
                        <span className="text-xs text-slate-400">({p.quantity} sp)</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatCurrency(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-blue-400"
                        style={{ width: `${Math.round((p.revenue / maxRev) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {topProducts.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debt Summary */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Công nợ khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Loại</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Tổng mua</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Công nợ</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const cr = customerRevenue.find((r) => r.id === c.id);
                    return (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {c.type === "agent" ? "Đại lý" : "Khách lẻ"}
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(cr?.totalRevenue ?? 0)}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {c.debt > 0 ? (
                            <span className="text-red-600">{formatCurrency(c.debt)}</span>
                          ) : (
                            <span className="text-green-600">{formatCurrency(0)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.debt > 0 ? (
                            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                              Còn nợ
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              Đã thanh toán
                            </span>
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
    </div>
  );
}
