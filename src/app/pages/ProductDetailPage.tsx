import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Truck,
  Banknote,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useProduct, useProducts } from "../../hooks/useProducts";
import { useCartStore } from "../../store/cartStore";
import type { Product } from "../../types";

interface ProductDetailPageProps {
  productId?: string;
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  chat: "Chat",
  chien: "Chien",
  oiseau: "Oiseau",
  autre: "Autre",
};

function isPromotionActive(product: Product): boolean {
  if (!product.promotion_price || Number(product.promotion_price) <= 0)
    return false;
  if (!product.promotion_ends_at) return true;
  return new Date(product.promotion_ends_at) > new Date();
}

function getDisplayPrice(product: Product) {
  const original = Number(product.price ?? 0);
  if (isPromotionActive(product)) {
    return {
      current: Number(product.promotion_price!),
      original,
      isPromo: true,
      percentOff: Math.round(
        ((original - Number(product.promotion_price)) / original) * 100,
      ),
    };
  }
  return { current: original, original: null, isPromo: false, percentOff: 0 };
}

export function ProductDetailPage({
  productId,
  onBack,
  onNavigate,
}: ProductDetailPageProps) {
  const id = Number(productId);
  const { data: product, isLoading, isError } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // ← Remonte en haut et réinitialise la sélection à chaque changement
  // de produit (sinon en passant d'un produit à un autre depuis "Produits
  // similaires", on garde l'image/quantité du précédent).
  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [id]);

  const { data: similarData } = useProducts({
    category: product?.category,
    per_page: 5,
  });
  const similarProducts = (similarData?.data ?? []).filter((p) => p.id !== id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] p-4">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-9 w-9 rounded-xl bg-[var(--pc-surface)]" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl bg-[var(--pc-surface)]" />
            <div className="space-y-3">
              <div className="h-6 w-2/3 rounded bg-[var(--pc-surface)]" />
              <div className="h-4 w-1/3 rounded bg-[var(--pc-surface)]" />
              <div className="h-24 rounded bg-[var(--pc-surface)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--pc-surface-alt)] dark:bg-[#060C12]">
        <div className="text-6xl mb-4">🔍</div>
        <p
          className="font-bold text-[var(--pc-text-primary)] mb-1"
          style={{ fontSize: "18px" }}
        >
          Produit introuvable
        </p>
        <p
          className="text-[var(--pc-text-secondary)] mb-4"
          style={{ fontSize: "14px" }}
        >
          Il n'existe plus ou a été retiré de la boutique.
        </p>
        <button
          onClick={() => onNavigate("boutique")}
          className="px-4 py-2 bg-[var(--pc-primary)] text-white rounded-xl font-semibold"
          style={{ fontSize: "13px" }}
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const images =
    product.photos && product.photos.length > 0 ? product.photos : [];
  const { current, original, isPromo, percentOff } = getDisplayPrice(product);
  const outOfStock = product.stock_quantity <= 0;
  const maxQty = Math.min(product.stock_quantity, 20);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(product, quantity);
    setJustAdded(true);
    setQuantity(1);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] pb-16">
      {/* Header + fil d'Ariane */}
      <header className="sticky top-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-[var(--pc-border)] hover:bg-[var(--pc-surface-alt)] transition-colors"
          >
            <ArrowLeft size={18} className="text-[var(--pc-text-primary)]" />
          </motion.button>

          <nav
            className="flex items-center gap-1.5 text-[var(--pc-text-secondary)] overflow-hidden"
            style={{ fontSize: "12px" }}
          >
            <button
              onClick={() => onNavigate("boutique")}
              className="hover:text-[var(--pc-primary)] flex-shrink-0"
            >
              Boutique
            </button>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="flex-shrink-0">
              {CATEGORY_LABEL[product.category] ?? product.category}
            </span>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="truncate text-[var(--pc-text-primary)] font-medium">
              {product.name}
            </span>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* ── Galerie ── */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--pc-surface)] dark:bg-[#0D1117] border border-[var(--pc-border)]/60 relative">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  🎁
                </div>
              )}
              {isPromo && (
                <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                  -{percentOff}%
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImage === i
                        ? "border-[var(--pc-primary)]"
                        : "border-[var(--pc-border)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos + achat ── */}
          <div>
            <span className="inline-block bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              {CATEGORY_LABEL[product.category] ?? product.category}
            </span>

            <h1
              className="text-[var(--pc-text-primary)] font-black mb-2"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(22px, 4vw, 30px)",
              }}
            >
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2.5 mb-4">
              <span
                className={`font-black ${isPromo ? "text-red-500" : "text-[var(--pc-primary)]"}`}
                style={{ fontFamily: "Sora, sans-serif", fontSize: "28px" }}
              >
                {current.toLocaleString("fr-TN")} DT
              </span>
              {isPromo && original && (
                <span
                  className="text-[var(--pc-text-secondary)] line-through"
                  style={{ fontSize: "16px" }}
                >
                  {original.toLocaleString("fr-TN")} DT
                </span>
              )}
            </div>

            <p
              className={`font-semibold mb-5 ${outOfStock ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
              style={{ fontSize: "13px" }}
            >
              {outOfStock
                ? "Rupture de stock"
                : `✓ En stock — ${product.stock_quantity} disponible${product.stock_quantity > 1 ? "s" : ""}`}
            </p>

            {product.description && (
              <p
                className="text-[var(--pc-text-secondary)] leading-relaxed mb-6"
                style={{ fontSize: "14px" }}
              >
                {product.description}
              </p>
            )}

            {/* Quantité + Ajouter au panier */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center rounded-xl border border-[var(--pc-border)] overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={outOfStock}
                  className="w-10 h-11 flex items-center justify-center hover:bg-[var(--pc-surface-alt)] disabled:opacity-40 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span
                  className="w-10 text-center font-bold"
                  style={{ fontSize: "14px" }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={outOfStock || quantity >= maxQty}
                  className="w-10 h-11 flex items-center justify-center hover:bg-[var(--pc-surface-alt)] disabled:opacity-40 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  fontSize: "14px",
                  background: justAdded ? "#16a34a" : "var(--pc-primary)",
                }}
              >
                {justAdded ? (
                  <>
                    <Check size={17} /> Ajouté au panier
                  </>
                ) : (
                  <>
                    <ShoppingCart size={17} />
                    {outOfStock ? "Indisponible" : "Ajouter au panier"}
                  </>
                )}
              </motion.button>
            </div>

            {/* Réassurance */}
            <div className="grid grid-cols-3 gap-2 pt-5 border-t border-[var(--pc-border)]">
              {[
                { icon: Truck, label: "Livraison partout en Tunisie" },
                { icon: Banknote, label: "Paiement à la livraison" },
                { icon: ShieldCheck, label: "Produit vérifié" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-1.5"
                >
                  <Icon size={20} className="text-[var(--pc-primary)]" />
                  <span
                    className="text-[var(--pc-text-secondary)]"
                    style={{ fontSize: "10.5px" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2
              className="text-[var(--pc-text-primary)] font-black mb-5"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "20px" }}
            >
              Produits similaires
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarProducts.slice(0, 4).map((p, i) => {
                const dp = getDisplayPrice(p);
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() =>
                      onNavigate("boutique-detail", { id: String(p.id) })
                    }
                    className="text-left glass-card rounded-2xl overflow-hidden border border-[var(--pc-border)]/60 hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-[var(--pc-surface-alt)] dark:bg-[#161B22]">
                      {p.photos?.[0] ? (
                        <img
                          src={p.photos[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🎁
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-[var(--pc-text-primary)] text-xs truncate mb-1">
                        {p.name}
                      </p>
                      <span
                        className={`font-black text-xs ${dp.isPromo ? "text-red-500" : "text-[var(--pc-primary)]"}`}
                      >
                        {dp.current.toLocaleString("fr-TN")} DT
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
