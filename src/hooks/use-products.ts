"use client";

// Legacy hook - kept for compatibility, use use-gas-data instead
export function useProducts() {
  return {
    products: [],
    isReady: true,
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
    sellProduct: () => false,
  };
}
