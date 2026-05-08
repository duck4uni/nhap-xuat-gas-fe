"use client";

import { useState } from "react";
import { useGasData } from "@/hooks/use-gas-data";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function KhachHangPage() {
  const { customers, exportOrders, addCustomer } = useGasData();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<Omit<Customer, "id" | "debt">>({
    name: "",
    phone: "",
    address: "",
    type: "retail",
  });

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên khách hàng"); return; }
    if (!form.phone.trim()) { toast.error("Vui lòng nhập số điện thoại"); return; }
    addCustomer({ ...form, debt: 0 });
    toast.success("Đã thêm khách hàng");
    setShowCreate(false);
    setForm({ name: "", phone: "", address: "", type: "retail" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý danh sách khách hàng và đại lý</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Tổng khách hàng</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{customers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Đại lý</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {customers.filter((c) => c.type === "agent").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Còn nợ</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {customers.filter((c) => c.debt > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Tìm theo tên, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Điện thoại</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Địa chỉ</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Tổng đơn</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Công nợ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                )}
                {filtered.map((c) => {
                  const orderCount = exportOrders.filter((o) => o.customerId === c.id).length;
                  return (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.type === "agent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.type === "agent" ? "Đại lý" : "Khách lẻ"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{c.address}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{orderCount} đơn</td>
                      <td className="px-4 py-3 text-right">
                        {c.debt > 0 ? (
                          <span className="font-semibold text-red-600">{formatCurrency(c.debt)}</span>
                        ) : (
                          <span className="text-green-600 font-medium">Không nợ</span>
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tên khách hàng / Tên cửa hàng</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ví dụ: Quán ăn Hương Quê"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Loại khách hàng</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Customer["type"] }))}
              >
                <option value="retail">Khách lẻ</option>
                <option value="agent">Đại lý</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="09x xxx xxxx"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Địa chỉ</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Địa chỉ giao hàng..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
              Thêm khách hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
