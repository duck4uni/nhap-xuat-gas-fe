"use client";

import { useState } from "react";
import { useGasData } from "@/hooks/use-gas-data";
import { AlertTriangle, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { GasProduct } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const CATEGORY_LABELS: Record<GasProduct["category"], string> = {
  "cylinder-12kg": "Bình 12kg",
  "cylinder-45kg": "Bình 45kg",
  mini: "Gas mini",
  accessory: "Phụ kiện",
};

const EMPTY_FORM: Omit<GasProduct, "id"> = {
  name: "",
  category: "cylinder-12kg",
  unit: "bình",
  purchasePrice: 0,
  sellingPrice: 0,
  quantity: 0,
  lowStockThreshold: 5,
  description: "",
};

export default function TonKhoPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useGasData();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<GasProduct | null>(null);
  const [form, setForm] = useState<Omit<GasProduct, "id">>(EMPTY_FORM);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      CATEGORY_LABELS[p.category].toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter((p) => p.quantity <= p.lowStockThreshold);
  const outOfStock = products.filter((p) => p.quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowCreate(true);
  };

  const openEdit = (product: GasProduct) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      description: product.description,
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên sản phẩm"); return; }
    if (form.purchasePrice < 0 || form.sellingPrice < 0) { toast.error("Giá không hợp lệ"); return; }

    if (editProduct) {
      updateProduct(editProduct.id, form);
      toast.success("Đã cập nhật sản phẩm");
      setEditProduct(null);
    } else {
      addProduct(form);
      toast.success("Đã thêm sản phẩm mới");
      setShowCreate(false);
    }
  };

  const handleDelete = (product: GasProduct) => {
    deleteProduct(product.id);
    toast.success(`Đã xóa ${product.name}`);
  };

  const ProductForm = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Tên sản phẩm - full width */}
      <div className="col-span-2 sm:col-span-4 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Tên sản phẩm <span className="text-red-500">*</span></Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ví dụ: Bình gas Shell 12kg"
          className="h-10"
        />
      </div>

      {/* Danh mục */}
      <div className="col-span-2 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Danh mục</Label>
        <select
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GasProduct["category"] }))}
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Đơn vị */}
      <div className="col-span-1 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Đơn vị</Label>
        <Input
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          placeholder="bình, hộp..."
          className="h-10"
        />
      </div>

      {/* Mô tả */}
      <div className="col-span-1 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Mô tả</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Mô tả ngắn..."
          className="h-10"
        />
      </div>

      {/* Giá nhập */}
      <div className="col-span-1 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Giá nhập (₫)</Label>
        <Input
          type="number"
          min={0}
          value={form.purchasePrice}
          onChange={(e) => setForm((f) => ({ ...f, purchasePrice: Number(e.target.value) }))}
          className="h-10"
        />
      </div>

      {/* Giá bán */}
      <div className="col-span-1 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Giá bán (₫)</Label>
        <Input
          type="number"
          min={0}
          value={form.sellingPrice}
          onChange={(e) => setForm((f) => ({ ...f, sellingPrice: Number(e.target.value) }))}
          className="h-10"
        />
      </div>

      {/* Số lượng tồn */}
      <div className="col-span-1 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Số lượng tồn</Label>
        <Input
          type="number"
          min={0}
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
          className="h-10"
        />
      </div>

      {/* Ngưỡng cảnh báo */}
      <div className="col-span-1 space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Ngưỡng cảnh báo</Label>
        <Input
          type="number"
          min={0}
          value={form.lowStockThreshold}
          onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
          className="h-10"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Tồn kho</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và quản lý kho hàng gas</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Tổng mặt hàng</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Sắp hết hàng</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Hết hàng</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{outOfStock.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Giá trị tồn kho</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Cảnh báo tồn kho thấp</p>
            <p className="mt-1 text-sm text-yellow-700">
              {lowStock.map((p) => `${p.name} (còn ${p.quantity} ${p.unit})`).join(" • ")}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Sản phẩm</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Danh mục</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Tồn kho</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Giá nhập</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Giá bán</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Giá trị tồn</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
                {filtered.map((product) => {
                  const isLow = product.quantity <= product.lowStockThreshold;
                  const isOut = product.quantity === 0;
                  return (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-48">{product.description}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{CATEGORY_LABELS[product.category]}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${isOut ? "text-red-600" : isLow ? "text-yellow-600" : "text-slate-900"}`}>
                          {product.quantity}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">{product.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(product.purchasePrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(product.quantity * product.purchasePrice)}
                      </td>
                      <td className="px-4 py-3">
                        {isOut ? (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Hết hàng
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Sắp hết
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Còn hàng
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Xóa
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent showCloseButton={false} className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
          <DialogTitle className="sr-only">Thêm sản phẩm mới</DialogTitle>
          <div className="shrink-0 flex items-center justify-between bg-linear-to-r from-indigo-600 to-indigo-500 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-white">Thêm sản phẩm mới</h2>
              <p className="mt-0.5 text-sm text-indigo-100">Điền đầy đủ thông tin sản phẩm</p>
            </div>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-full p-1.5 text-indigo-200 hover:bg-indigo-700 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ProductForm />
          </div>
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Thêm sản phẩm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent showCloseButton={false} className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
          <DialogTitle className="sr-only">Chỉnh sửa sản phẩm</DialogTitle>
          <div className="shrink-0 flex items-center justify-between bg-linear-to-r from-indigo-600 to-indigo-500 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-white">Chỉnh sửa sản phẩm</h2>
              <p className="mt-0.5 text-sm text-indigo-100">{editProduct?.name}</p>
            </div>
            <button
              onClick={() => setEditProduct(null)}
              className="rounded-full p-1.5 text-indigo-200 hover:bg-indigo-700 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ProductForm />
          </div>
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button variant="outline" onClick={() => setEditProduct(null)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
