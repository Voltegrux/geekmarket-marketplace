import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        const exists = items.find((i) => i.product.id === product.id);
        if (!exists) {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
      isInCart: (productId) =>
        get().items.some((i) => i.product.id === productId),
      total: () =>
        get().items.reduce((sum, item) => sum + item.product.price, 0),
      count: () => get().items.length,
    }),
    { name: "cart-storage" }
  )
);
