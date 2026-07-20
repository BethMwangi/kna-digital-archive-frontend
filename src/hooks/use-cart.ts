import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemOut } from "@/lib/api/types";

interface CartState {
  items: CartItemOut[];
  addItem: (item: CartItemOut) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // prevent duplicate asset + license pairs
          const exists = state.items.find(
            (i) => i.asset.id === item.asset.id && i.license.id === item.license.id
          );
          if (exists) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "kna-cart-storage" }
  )
);

// Adapt to the previous hooks API so components don't need huge rewrites:
export function useCart() {
  const items = useCartStore((state) => state.items);
  // simulate React Query object
  return { data: items, isPending: false, isError: false };
}

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);
  return {
    mutate: (item: CartItemOut, options?: { onSuccess?: () => void; onError?: () => void }) => {
      addItem(item);
      options?.onSuccess?.();
    },
    isPending: false,
  };
}

export function useRemoveFromCart() {
  const removeItem = useCartStore((state) => state.removeItem);
  return {
    mutate: (id: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
      removeItem(id);
      options?.onSuccess?.();
    },
    isPending: false,
  };
}
