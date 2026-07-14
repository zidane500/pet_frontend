import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "../../types";

// ← Même logique que BoutiquePage.tsx (isPromotionActive/getDisplayPrice),
// dupliquée volontairement ici pour que cette carte reste un composant
// autonome et léger, indépendant de la grosse page Boutique.
function isPromotionActive(product: Product): boolean {
  if (!product.promotion_price || Number(product.promotion_price) <= 0)
    return false;
  if (!product.promotion_ends_at) return true;
  return new Date(product.promotion_ends_at) > new Date();
}

function getDisplayPrice(product: Product): {
  current: number;
  original: number | null;
  isPromo: boolean;
} {
  const original = Number(product.price ?? 0);
  if (isPromotionActive(product)) {
    return {
      current: Number(product.promotion_price!),
      original,
      isPromo: true,
    };
  }
  return { current: original, original: null, isPromo: false };
}

const CATEGORY_LABEL: Record<string, string> = {
  chat: "Chat",
  chien: "Chien",
  oiseau: "Oiseau",
  autre: "Autre",
};

export function BoutiqueProductCard({
  product,
  index = 0,
  onClick,
}: {
  product: Product;
  index?: number;
  onClick?: () => void;
}) {
  const image = product.photos?.[0] ?? null;
  const { current, original, isPromo } = getDisplayPrice(product);
  const outOfStock = product.stock_quantity <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden border border-[var(--pc-border)]/60 cursor-pointer group transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
    >
      <div className="relative h-36 overflow-hidden bg-[var(--pc-surface-alt)] dark:bg-[#161B22]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎁
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[var(--pc-primary)] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
          {CATEGORY_LABEL[product.category] ?? product.category}
        </span>

        {isPromo && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
            Promo
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wide">
              Épuisé
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-bold text-[var(--pc-text-primary)] text-sm truncate mb-1">
          {product.name}
        </p>

        <div className="flex items-center gap-1.5 mb-3">
          <span
            className={`font-black text-sm ${isPromo ? "text-red-500" : "text-[var(--pc-primary)]"}`}
          >
            {current.toLocaleString("fr-TN")} DT
          </span>
          {isPromo && original && (
            <span className="text-xs text-[var(--pc-text-secondary)] line-through">
              {original.toLocaleString("fr-TN")} DT
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[var(--pc-primary)] text-[var(--pc-primary)] font-semibold text-xs hover:bg-[var(--pc-primary)] hover:text-white transition-colors"
        >
          Voir dans la boutique <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
