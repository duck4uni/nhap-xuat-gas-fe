export type GasProduct = {
  id: string;
  name: string;
  category: "cylinder-12kg" | "cylinder-45kg" | "mini" | "accessory";
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  description: string;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  address: string;
  contactPerson: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: "retail" | "agent";
  debt: number;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type ImportOrder = {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  status: "pending" | "completed" | "cancelled";
  notes: string;
};

export type ExportOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryStatus: "pending" | "delivering" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  notes: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  type: "import" | "export";
  orderId: string;
  orderNumber: string;
  date: string;
  amount: number;
  party: string;
  status: "draft" | "issued" | "paid" | "overdue";
};

// Legacy type kept for hook compatibility
export type Product = GasProduct;
export type ProductInput = Omit<GasProduct, "id">;
