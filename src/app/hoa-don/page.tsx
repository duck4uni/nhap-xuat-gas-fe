"use client";

import { useState } from "react";
import { useGasData } from "@/hooks/use-gas-data";
import { Download, FileText, Search } from "lucide-react";
import type { Invoice } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const STATUS_MAP: Record<Invoice["status"], { label: string; className: string }> = {
  draft: { label: "Nháp", className: "bg-slate-100 text-slate-700 border-slate-200" },
  issued: { label: "Đã phát hành", className: "bg-blue-100 text-blue-800 border-blue-200" },
  paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-800 border-green-200" },
  overdue: { label: "Quá hạn", className: "bg-red-100 text-red-800 border-red-200" },
};

const TYPE_MAP: Record<Invoice["type"], { label: string; className: string }> = {
  import: { label: "Nhập", className: "bg-purple-100 text-purple-800" },
  export: { label: "Xuất", className: "bg-indigo-100 text-indigo-800" },
};

export default function HoaDonPage() {
  const { invoices } = useGasData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "import" | "export">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Invoice["status"]>("all");

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.party.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || inv.type === typeFilter;
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filtered
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filtered
    .filter((inv) => inv.status === "issued")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Hóa đơn &amp; Biên lai</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý và theo dõi toàn bộ hóa đơn giao dịch</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Download className="h-4 w-4" />
          Xuất Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Tổng giá trị</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
            <p className="mt-0.5 text-xs text-slate-400">{filtered.length} hóa đơn</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Đã thanh toán</p>
            <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Chờ thanh toán</p>
            <p className="mt-1 text-xl font-bold text-blue-600">{formatCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Tìm theo mã hóa đơn, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            >
              <option value="all">Tất cả loại</option>
              <option value="export">Hóa đơn xuất</option>
              <option value="import">Hóa đơn nhập</option>
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="issued">Đã phát hành</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Mã hóa đơn</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Đơn hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Đối tác</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ngày</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Số tiền</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy hóa đơn nào
                    </td>
                  </tr>
                )}
                {filtered
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((inv) => {
                    const status = STATUS_MAP[inv.status];
                    const type = TYPE_MAP[inv.type];
                    return (
                      <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{inv.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${type.className}`}>
                            {type.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{inv.orderNumber}</td>
                        <td className="px-4 py-3 text-slate-700">{inv.party}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(inv.date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                              Xem
                            </button>
                            <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">
                              In
                            </button>
                          </div>
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
