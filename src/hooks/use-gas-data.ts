"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_CUSTOMERS,
  DEFAULT_EXPORT_ORDERS,
  DEFAULT_IMPORT_ORDERS,
  DEFAULT_INVOICES,
  DEFAULT_PRODUCTS,
  DEFAULT_SUPPLIERS,
} from "@/lib/seed-data";
import type {
  Customer,
  ExportOrder,
  GasProduct,
  ImportOrder,
  Invoice,
  Supplier,
} from "@/lib/types";

const KEYS = {
  products: "gas-products",
  suppliers: "gas-suppliers",
  customers: "gas-customers",
  importOrders: "gas-import-orders",
  exportOrders: "gas-export-orders",
  invoices: "gas-invoices",
};

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useGasData() {
  const [products, setProducts] = useState<GasProduct[]>(DEFAULT_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [importOrders, setImportOrders] = useState<ImportOrder[]>(DEFAULT_IMPORT_ORDERS);
  const [exportOrders, setExportOrders] = useState<ExportOrder[]>(DEFAULT_EXPORT_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(DEFAULT_INVOICES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setProducts(loadFromStorage(KEYS.products, DEFAULT_PRODUCTS));
      setSuppliers(loadFromStorage(KEYS.suppliers, DEFAULT_SUPPLIERS));
      setCustomers(loadFromStorage(KEYS.customers, DEFAULT_CUSTOMERS));
      setImportOrders(loadFromStorage(KEYS.importOrders, DEFAULT_IMPORT_ORDERS));
      setExportOrders(loadFromStorage(KEYS.exportOrders, DEFAULT_EXPORT_ORDERS));
      setInvoices(loadFromStorage(KEYS.invoices, DEFAULT_INVOICES));
      setIsReady(true);
    });
  }, []);

  useEffect(() => { if (isReady) saveToStorage(KEYS.products, products); }, [isReady, products]);
  useEffect(() => { if (isReady) saveToStorage(KEYS.suppliers, suppliers); }, [isReady, suppliers]);
  useEffect(() => { if (isReady) saveToStorage(KEYS.customers, customers); }, [isReady, customers]);
  useEffect(() => { if (isReady) saveToStorage(KEYS.importOrders, importOrders); }, [isReady, importOrders]);
  useEffect(() => { if (isReady) saveToStorage(KEYS.exportOrders, exportOrders); }, [isReady, exportOrders]);
  useEffect(() => { if (isReady) saveToStorage(KEYS.invoices, invoices); }, [isReady, invoices]);

  // --- Products ---
  const addProduct = (data: Omit<GasProduct, "id">) => {
    setProducts((prev) => [{ ...data, id: generateId("prod") }, ...prev]);
  };
  const updateProduct = (id: string, data: Omit<GasProduct, "id">) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Suppliers ---
  const addSupplier = (data: Omit<Supplier, "id">) => {
    setSuppliers((prev) => [{ ...data, id: generateId("sup") }, ...prev]);
  };

  // --- Customers ---
  const addCustomer = (data: Omit<Customer, "id">) => {
    setCustomers((prev) => [{ ...data, id: generateId("cus") }, ...prev]);
  };
  const updateCustomerDebt = (customerId: string, delta: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, debt: Math.max(0, c.debt + delta) } : c))
    );
  };

  // --- Import Orders ---
  const addImportOrder = (data: Omit<ImportOrder, "id">) => {
    const order: ImportOrder = { ...data, id: generateId("imp") };
    setImportOrders((prev) => [order, ...prev]);
    // Update product quantities
    for (const item of data.items) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.productId ? { ...p, quantity: p.quantity + item.quantity } : p
        )
      );
    }
    // Auto-create invoice
    const invNumber = `HD-NK-${Date.now()}`;
    setInvoices((prev) => [
      {
        id: generateId("inv"),
        invoiceNumber: invNumber,
        type: "import",
        orderId: order.id,
        orderNumber: data.orderNumber,
        date: data.date,
        amount: data.totalAmount + data.shippingCost,
        party: data.supplierName,
        status: "issued",
      },
      ...prev,
    ]);
  };
  const updateImportStatus = (id: string, status: ImportOrder["status"]) => {
    setImportOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  // --- Export Orders ---
  const addExportOrder = (data: Omit<ExportOrder, "id">) => {
    const order: ExportOrder = { ...data, id: generateId("exp") };
    setExportOrders((prev) => [order, ...prev]);
    // Deduct product quantities
    for (const item of data.items) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.productId
            ? { ...p, quantity: Math.max(0, p.quantity - item.quantity) }
            : p
        )
      );
    }
    // Auto-create invoice
    const invNumber = `HD-XK-${Date.now()}`;
    setInvoices((prev) => [
      {
        id: generateId("inv"),
        invoiceNumber: invNumber,
        type: "export",
        orderId: order.id,
        orderNumber: data.orderNumber,
        date: data.date,
        amount: data.totalAmount,
        party: data.customerName,
        status: data.paymentStatus === "paid" ? "paid" : "issued",
      },
      ...prev,
    ]);
  };
  const updateExportDelivery = (id: string, deliveryStatus: ExportOrder["deliveryStatus"]) => {
    setExportOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deliveryStatus } : o)));
  };
  const updateExportPayment = (id: string, paymentStatus: ExportOrder["paymentStatus"]) => {
    setExportOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o)));
    // Update invoice status
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.orderId === id
          ? { ...inv, status: paymentStatus === "paid" ? "paid" : "issued" }
          : inv
      )
    );
  };

  return {
    products,
    suppliers,
    customers,
    importOrders,
    exportOrders,
    invoices,
    isReady,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    addCustomer,
    updateCustomerDebt,
    addImportOrder,
    updateImportStatus,
    addExportOrder,
    updateExportDelivery,
    updateExportPayment,
  };
}
