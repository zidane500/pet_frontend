import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function toNumber(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          const price = toNumber(product.price);

          if (existing) {
            // ← On ne dépasse jamais le stock connu au moment de
            // l'ajout (le stock réel est de toute façon revérifié côté
            // serveur à la commande, ceci n'est qu'un confort visuel).
            const newQuantity = Math.min(
              existing.quantity + quantity,
              product.stock_quantity,
            );
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? {
                      ...i,
                      quantity: newQuantity,
                      stockQuantity: product.stock_quantity,
                    }
                  : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price,
                photo: product.photos?.[0] ?? null,
                quantity: Math.min(quantity, product.stock_quantity),
                stockQuantity: product.stock_quantity,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: Math.min(Math.max(quantity, 0), i.stockQuantity),
                  }
                : i,
            )
            // ← Passer la quantité à 0 retire l'article du panier
            .filter((i) => i.quantity > 0),
        }));
      },

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      // ← localStorage (pas sessionStorage comme le token d'auth) : le
      // panier doit survivre même si l'utilisateur ferme l'onglet, pour
      // qu'il retrouve ses articles en revenant plus tard, même sans
      // compte.
      name: "animali_cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
