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
  // ← Resynchronise le panier avec les données à jour du catalogue
  // (prix effectif, stock, nom, photo). Retourne les changements
  // détectés pour pouvoir prévenir le client visuellement.
  syncWithCatalog: (
    freshProducts: Product[],
    removedIds: number[],
  ) => {
    priceChanged: {
      productId: number;
      name: string;
      oldPrice: number;
      newPrice: number;
    }[];
    removed: { productId: number; name: string }[];
  };
}

function toNumber(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

// ← Le prix RÉEL à payer : effective_price si le serveur l'a fourni
// (toujours le cas depuis la correction de Product::effective_price),
// avec un repli sur `price` par sécurité si jamais l'API renvoie un
// produit sans ce champ (ancien cache, etc.).
function getEffectivePrice(product: Product): number {
  if (
    product.effective_price !== undefined &&
    product.effective_price !== null
  ) {
    return toNumber(product.effective_price);
  }
  return toNumber(product.price);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          const price = getEffectivePrice(product);

          if (existing) {
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
                      // ← Bug corrigé : le prix (y compris promo) est
                      // resynchronisé même en rajoutant un produit déjà
                      // présent dans le panier.
                      price,
                      name: product.name,
                      photo: product.photos?.[0] ?? null,
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

      syncWithCatalog: (freshProducts, removedIds) => {
        const priceChanged: {
          productId: number;
          name: string;
          oldPrice: number;
          newPrice: number;
        }[] = [];
        const removed: { productId: number; name: string }[] = [];

        set((state) => {
          const items = state.items
            .filter((item) => {
              if (removedIds.includes(item.productId)) {
                removed.push({ productId: item.productId, name: item.name });
                return false;
              }
              return true;
            })
            .map((item) => {
              const fresh = freshProducts.find((p) => p.id === item.productId);
              if (!fresh) return item;

              const newPrice = getEffectivePrice(fresh);
              if (newPrice !== item.price) {
                priceChanged.push({
                  productId: item.productId,
                  name: fresh.name,
                  oldPrice: item.price,
                  newPrice,
                });
              }

              return {
                ...item,
                price: newPrice,
                name: fresh.name,
                photo: fresh.photos?.[0] ?? null,
                stockQuantity: fresh.stock_quantity,
                quantity: Math.min(item.quantity, fresh.stock_quantity),
              };
            });

          return { items };
        });

        return { priceChanged, removed };
      },
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
