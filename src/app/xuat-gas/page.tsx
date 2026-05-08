"use client";

import { useState } from "react";
import { useGasData } from "@/hooks/use-gas-data";
import { CheckCircle2, Package, Plus, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { ExportOrder, OrderItem } from "@/lib/types";
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

const DELIVERY_MAP: Record<ExportOrder["deliveryStatus"], { label: string; className: string }> = {
  pending:    { label: "Chờ giao",   className: "bg-amber-100 text-amber-800 border-amber-200" },
  delivering: { label: "Đang giao",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered:  { label: "Đã giao",    className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled:  { label: "Đã hủy",     className: "bg-red-100 text-red-800 border-red-200" },
};

const PAYMENT_MAP: Record<ExportOrder["paymentStatus"], { label: string; className: string }> = {
  unpaid:  { label: "Chưa TT",  className: "bg-red-100 text-red-800 border-red-200" },
  partial: { label: "Còn nợ",   className: "bg-amber-100 text-amber-800 border-amber-200" },
  paid:    { label: "Đã TT",    className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const RESET_ITEMS = (products: { id: string; sellingPrice: number }[]) => [
  { productId: products[0]?.id ?? "", quantity: 1, unitPrice: products[0]?.sellingPrice ?? 0 },
];

export default function XuatGasPage() {
  const { products, exportOrders, addExportOrder, updateExportDelivery, updateExportPayment } = useGasData();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailOrder, setDetailOrder] = useState<ExportOrder | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentStatus, setPaymentStatus] = useState<ExportOrder["paymentStatus"]>("paid");
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState(RESET_ITEMS(products));

  const filtered = exportOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = exportOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidRevenue = exportOrders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingDeliveries = exportOrders.filter((o) => o.deliveryStatus === "pending" || o.deliveryStatus === "delivering").length;

  const addItem = () => {
    setOrderItems((prev) => [
      ...prev,
      { productId: products[0]?.id ?? "", quantity: 1, unitPrice: products[0]?.sellingPrice ?? 0 },
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
          return { ...item, productId: value as string, unitPrice: product?.sellingPrice ?? 0 };
        }
        return { ...item, [field]: Number(value) };
      })
    );
  };

  const grandTotal = orderItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleCreate = () => {
    if (!customerName.trim()) { toast.error("Vui lòng nhập tên khách hàng"); return; }
    if (orderItems.length === 0) { toast.error("Vui lòng thêm ít nhất 1 sản phẩm"); return; }

    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) { toast.error("Sản phẩm không hợp lệ"); return; }
      if (item.quantity <= 0) { toast.error("Số lượng phải lớn hơn 0"); return; }
      if (item.quantity > product.quantity) {
        toast.error(`Không đủ tồn kho cho "${product.name}" (còn ${product.quantity})`);
        return;
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

    const orderNumber = `XK-${new Date().getFullYear()}-${String(exportOrders.length + 1).padStart(3, "0")}`;
    addExportOrder({
      orderNumber,
      customerId: "",
      customerName: customerName.trim(),
      date,
      items,
      totalAmount: grandTotal,
      deliveryStatus: "pending",
      paymentStatus,
      notes,
    });

    toast.success(`Đã tạo phiếu xuất ${orderNumber}`);
    setShowCreate(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setNotes("");
    setPaymentStatus("paid");
    setOrderItems(RESET_ITEMS(products));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Xuất gas</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý phiếu xuất hàng cho khách hàng</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu xuất
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Tổng đơn xuất</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{exportOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Chờ / Đang giao</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{pendingDeliveries}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Doanh thu đã thu</p>
            <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(paidRevenue)}</p>
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
              placeholder="Tìm theo mã phiếu, khách hàng..."
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Khách hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ngày xuất</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Số tiền</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Giao hàng</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Thanh toán</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      Không tìm thấy phiếu xuất nào
                    </td>
                  </tr>
                )}
                {filtered.map((order) => {
                  const delivery = DELIVERY_MAP[order.deliveryStatus];
                  const payment = PAYMENT_MAP[order.paymentStatus];
                  return (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-800">{order.orderNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{order.customerName}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className={`rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${delivery.className}`}
                          value={order.deliveryStatus}
                          onChange={(e) => {
                            updateExportDelivery(order.id, e.target.value as ExportOrder["deliveryStatus"]);
                            toast.success("Đã cập nhật trạng thái giao hàng");
                          }}
                        >
                          <option value="pending">Chờ giao</option>
                          <option value="delivering">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Hủy</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className={`rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${payment.className}`}
                          value={order.paymentStatus}
                          onChange={(e) => {
                            updateExportPayment(order.id, e.target.value as ExportOrder["paymentStatus"]);
                            toast.success("Đã cập nhật thanh toán");
                          }}
                        >
                          <option value="unpaid">Chưa TT</option>
                          <option value="partial">Còn nợ</option>
                          <option value="paid">Đã TT</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailOrder(order)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Chi tiết
                        </button>
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
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              Tạo phiếu xuất gas
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Section: Khách hàng */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Thông tin khách hàng / đối tác
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="VD: Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Số điện thoại</Label>
                  <Input
                    placeholder="VD: 0901 234 567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Địa chỉ</Label>
                  <Input
                    placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Ngày xuất</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Thanh toán</Label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as ExportOrder["paymentStatus"])}
                  >
                    <option value="paid">Đã thanh toán</option>
                    <option value="partial">Thanh toán một phần</option>
                    <option value="unpaid">Chưa thanh toán</option>
                  </select>
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
                    <span className="w-36 text-right">Giá bán (₫)</span>
                    <span className="w-32 text-right">Thành tiền</span>
                    <span className="w-8" />
                  </div>
                </div>

                {orderItems.map((item, idx) => {
                  const product = products.find((p) => p.id === item.productId);
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
                            <option key={p.id} value={p.id}>
                              {p.name} (tồn: {p.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min={1}
                          max={product?.quantity}
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

            {/* Ghi chú */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Ghi chú</Label>
              <Input
                placeholder="Ghi chú thêm về đơn hàng..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {/* Tổng */}
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Số dòng sản phẩm</span>
                <span className="font-medium">{orderItems.length} dòng</span>
              </div>
              <div className="h-px bg-indigo-200" />
              <div className="flex justify-between text-lg font-bold text-indigo-700">
                <span>Tổng cộng</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              <X className="mr-2 h-4 w-4" /> Hủy
            </Button>
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <ShoppingCart className="mr-2 h-4 w-4" /> Tạo phiếu xuất
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
                    Phiếu xuất {detailOrder.orderNumber}
                  </DialogTitle>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(detailOrder.date).toLocaleDateString("vi-VN", { dateStyle: "long" })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${DELIVERY_MAP[detailOrder.deliveryStatus].className}`}>
                    {DELIVERY_MAP[detailOrder.deliveryStatus].label}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${PAYMENT_MAP[detailOrder.paymentStatus].className}`}>
                    {PAYMENT_MAP[detailOrder.paymentStatus].label}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Khách hàng</p>
                  <p className="mt-1 font-semibold text-slate-800">{detailOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Ngày xuất</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {new Date(detailOrder.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Hàng xuất</p>
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

              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                <div className="flex justify-between font-bold text-indigo-700">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(detailOrder.totalAmount)}</span>
                </div>
              </div>

              {detailOrder.notes && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Ghi chú</p>
                  <p className="mt-1 text-sm text-slate-700">{detailOrder.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
