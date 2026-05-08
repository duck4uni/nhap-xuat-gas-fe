"use client";

import { useState } from "react";
import { useGasData } from "@/hooks/use-gas-data";
import { CheckCircle2, ChevronDown, ChevronUp, Package, Plus, Search, Trash2, Truck, X } from "lucide-react";
import { toast } from "sonner";
import type { ImportOrder, OrderItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const STATUS_MAP = {
  pending: { label: "Chờ xử lý", className: "bg-amber-100 text-amber-800 border-amber-200" },
  completed: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200" },
};

const RESET_ITEMS = (products: { id: string; purchasePrice: number }[]) => [
  { productId: products[0]?.id ?? "", quantity: 1, unitPrice: products[0]?.purchasePrice ?? 0 },
];

export default function NhapGasPage() {
  const { products, importOrders, addImportOrder, updateImportStatus } = useGasData();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailOrder, setDetailOrder] = useState<ImportOrder | null>(null);

  // Form state
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState(RESET_ITEMS(products));

  const filtered = importOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = importOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount + o.shippingCost, 0);
  const pendingCount = importOrders.filter((o) => o.status === "pending").length;

  const addItem = () => {
    setOrderItems((prev) => [
      ...prev,
      { productId: products[0]?.id ?? "", quantity: 1, unitPrice: products[0]?.purchasePrice ?? 0 },
    ]);
  };

  const removeItem = (idx: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: string | number) => {
    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          return { ...item, productId: value as string, unitPrice: product?.purchasePrice ?? 0 };
        }
        return { ...item, [field]: Number(value) };
      })
    );
  };

  const subtotal = orderItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const grandTotal = subtotal + shippingCost;

  const handleCreate = () => {
    if (!supplierName.trim()) { toast.error("Vui lòng nhập tên nhà cung cấp"); return; }
    if (orderItems.length === 0) { toast.error("Vui lòng thêm ít nhất 1 sản phẩm"); return; }
    for (const item of orderItems) {
      if (!item.productId || item.quantity <= 0) {
        toast.error("Thông tin sản phẩm không hợp lệ"); return;
      }
    }

    const items: OrderItem[] = orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      };
    });

    const orderNumber = `NK-${new Date().getFullYear()}-${String(importOrders.length + 1).padStart(3, "0")}`;
    addImportOrder({
      orderNumber,
      supplierId: "",
      supplierName: supplierName.trim(),
      date,
      items,
      totalAmount: subtotal,
      shippingCost,
      status: "pending",
      notes,
    });

    toast.success(`Đã tạo phiếu nhập ${orderNumber}`);
    setShowCreate(false);
    setSupplierName("");
    setSupplierPhone("");
    setShippingCost(0);
    setNotes("");
    setOrderItems(RESET_ITEMS(products));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Nhập gas</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu nhập
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Tổng phiếu nhập</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{importOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Chờ xử lý</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Tổng chi phí nhập</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Tìm theo mã phiếu, nhà cung cấp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Mã phiếu</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ngày nhập</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Số tiền</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      Không tìm thấy phiếu nhập nào
                    </td>
                  </tr>
                )}
                {filtered.map((order) => {
                  const status = STATUS_MAP[order.status];
                  return (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-800">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700">{order.supplierName}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount + order.shippingCost)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Chi tiết
                          </button>
                          {order.status === "pending" && (
                            <button
                              onClick={() => {
                                updateImportStatus(order.id, "completed");
                                toast.success("Đã xác nhận hoàn thành");
                              }}
                              className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                            >
                              Xác nhận
                            </button>
                          )}
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

      {/* ===== Create Dialog ===== */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col overflow-hidden p-0 gap-0">
          <DialogHeader className="shrink-0 px-6 py-5 border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              Tạo phiếu nhập gas
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Section: Nhà cung cấp */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Thông tin nhà cung cấp
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="VD: Công ty Gas Petrolimex"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Số điện thoại</Label>
                  <Input
                    placeholder="VD: 0901 234 567"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Ngày nhập</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Phí vận chuyển (₫)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={shippingCost || ""}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Section: Sản phẩm */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Danh sách sản phẩm
                </h3>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm dòng
                </button>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-[520px] rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center px-4 py-3 gap-3 text-xs font-semibold text-slate-500">
                    <span className="flex-[3]">Sản phẩm</span>
                    <span className="w-24 text-center">Số lượng</span>
                    <span className="w-36 text-right">Giá nhập (₫)</span>
                    <span className="w-32 text-right">Thành tiền</span>
                    <span className="w-8" />
                  </div>
                </div>

                {orderItems.map((item, idx) => {
                  const total = item.quantity * item.unitPrice;
                  return (
                    <div
                      key={idx}
                      className="flex items-center px-4 py-3 gap-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-[3] min-w-0">
                        <select
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          value={item.productId}
                          onChange={(e) => updateItem(idx, "productId", e.target.value)}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="text-center h-10"
                        />
                      </div>
                      <div className="w-36">
                        <Input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                          className="text-right h-10"
                        />
                      </div>
                      <div className="w-32 text-right">
                        <span className="text-sm font-bold text-indigo-700">{formatCurrency(total)}</span>
                      </div>
                      <div className="w-8 flex justify-center">
                        {orderItems.length > 1 && (
                          <button
                            onClick={() => removeItem(idx)}
                            className="rounded-md p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>

            {/* Section: Ghi chú + tổng */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Ghi chú</Label>
              <Input
                placeholder="Ghi chú thêm về đơn hàng..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tiền hàng</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium">{formatCurrency(shippingCost)}</span>
              </div>
              <div className="h-px bg-indigo-200" />
              <div className="flex justify-between text-lg font-bold text-indigo-700">
                <span>Tổng cộng</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              <X className="mr-2 h-4 w-4" /> Hủy
            </Button>
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Truck className="mr-2 h-4 w-4" /> Tạo phiếu nhập
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Detail Dialog ===== */}
      {detailOrder && (
        <Dialog open onOpenChange={() => setDetailOrder(null)}>
          <DialogContent className="max-w-xl p-0 gap-0">
            <DialogHeader className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    Phiếu nhập {detailOrder.orderNumber}
                  </DialogTitle>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(detailOrder.date).toLocaleDateString("vi-VN", { dateStyle: "long" })}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_MAP[detailOrder.status].className}`}>
                  {STATUS_MAP[detailOrder.status].label}
                </span>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              {/* Nhà cung cấp */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Nhà cung cấp</p>
                  <p className="mt-1 font-semibold text-slate-800">{detailOrder.supplierName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Ngày nhập</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {new Date(detailOrder.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Danh sách hàng */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Hàng nhập</p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[380px] text-sm">
                    <tbody>
                      {detailOrder.items.map((item, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-4 py-2.5 font-medium text-slate-800">{item.productName}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tổng */}
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tiền hàng</span>
                  <span>{formatCurrency(detailOrder.totalAmount)}</span>
                </div>
                {detailOrder.shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(detailOrder.shippingCost)}</span>
                  </div>
                )}
                <div className="h-px bg-indigo-200" />
                <div className="flex justify-between font-bold text-indigo-700">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(detailOrder.totalAmount + detailOrder.shippingCost)}</span>
                </div>
              </div>

              {detailOrder.notes && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Ghi chú</p>
                  <p className="mt-1 text-sm text-slate-700">{detailOrder.notes}</p>
                </div>
              )}
            </div>

            {detailOrder.status === "pending" && (
              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                <Button
                  onClick={() => {
                    updateImportStatus(detailOrder.id, "completed");
                    toast.success("Đã xác nhận hoàn thành");
                    setDetailOrder(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Xác nhận hoàn thành
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
