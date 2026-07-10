import { ShoppingCart, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../../types";
import { useCartStore } from "../../store/cartStore";

const CATEGORY_LABEL: Record<string, string> = {
  chat: "🐱 Chat",
  chien: "🐶 Chien",
  oiseau: "🦜 Oiseau",
  autre: "🛍️ Autre",
};

function getDisplayImage(p: Product): string {
  if (p.photos && p.photos.length > 0) return p.photos[0];
  return `https://picsum.photos/seed/product-${p.id}/400/300`;
}

function formatPrice(price: number | string): string {
  return `${Number(price).toLocaleString("fr-TN")} DT`;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

export function ProductCard({ product, index = 0, onClick }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const image = getDisplayImage(product);
  const outOfStock = product.stock_quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;

    addItem(product, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 60px rgba(29,125,95,0.2), 0 4px 20px rgba(0,0,0,0.12)",
      }}
      className="flex-shrink-0 w-[82vw] sm:w-72 glass-card rounded-2xl overflow-hidden cursor-pointer group transition-all duration-400"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)", borderRadius: "20px" }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <motion.img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/product-${product.id}/400/300`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge catégorie */}
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-[var(--pc-primary)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>
        </div>

        {/* Rupture de stock */}
        {outOfStock && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
              Épuisé
            </span>
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3
              className="font-black text-[var(--pc-text-primary)] truncate"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "15px" }}
            >
              {product.name}
            </h3>
            {product.description && (
              <p
                className="text-[var(--pc-text-secondary)] truncate mt-0.5"
                style={{ fontSize: "12px" }}
              >
                {product.description}
              </p>
            )}
          </div>
          <p
            className="flex-shrink-0 font-black text-[var(--pc-primary)]"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "15px" }}
          >
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--pc-border)]/60">
          <span
            className="text-[var(--pc-text-secondary)]"
            style={{ fontSize: "11px" }}
          >
            {outOfStock ? "Indisponible" : `${product.stock_quantity} en stock`}
          </span>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontSize: "12px",
              background: justAdded
                ? "rgba(34,197,94,0.15)"
                : "var(--pc-primary)",
              color: justAdded ? "rgb(21,128,61)" : "white",
            }}
          >
            {justAdded ? (
              <>
                <Check size={13} /> Ajouté
              </>
            ) : (
              <>
                <ShoppingCart size={13} /> Ajouter
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
