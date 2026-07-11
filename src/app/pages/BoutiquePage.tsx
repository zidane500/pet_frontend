import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  ArrowLeft,
  Search,
  X,
  Loader2,
  ShoppingBag,
  SlidersHorizontal,
  PackageOpen,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts } from "../../hooks/useProducts";
import { useCartStore } from "../../store/cartStore";
import { CategoryChip } from "../components/CategoryChip";
import type { Product, ProductCategory } from "../../types";

interface BoutiquePageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

/* ─── Constants ─── */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const PER_PAGE = 12;

const CATEGORIES: {
  value: ProductCategory | "all";
  icon: string;
  label: string;
}[] = [
  { value: "all", icon: "🛍️", label: "Tous" },
  { value: "chat", icon: "🐱", label: "Chat" },
  { value: "chien", icon: "🐶", label: "Chien" },
  { value: "oiseau", icon: "🦜", label: "Oiseau" },
  { value: "autre", icon: "🎁", label: "Autre" },
];

/* ─── Extended Product type (no more "as any") ─── */
type ProductDetails = Omit<Product, "category"> & {
  description?: string;
  stock_quantity?: number;
  stock?: number;
  category?: ProductCategory | string;
  image?: string;
  image_url?: string;
  photo?: string;
  thumbnail?: string;
  cover_image?: string;
  photos?: string | string[] | null;
  images?: string | string[] | null;
};

/* ─── Helpers ─── */
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  )
    return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getProductImages(product: ProductDetails): string[] {
  const raw: (string | null | undefined)[] = [];

  if (product.image) raw.push(product.image);
  if (product.image_url) raw.push(product.image_url);
  if (product.photo) raw.push(product.photo);
  if (product.thumbnail) raw.push(product.thumbnail);
  if (product.cover_image) raw.push(product.cover_image);

  if (Array.isArray(product.photos)) raw.push(...product.photos);
  else if (typeof product.photos === "string") {
    try {
      raw.push(...JSON.parse(product.photos));
    } catch {
      raw.push(product.photos);
    }
  }

  if (Array.isArray(product.images)) raw.push(...product.images);
  else if (typeof product.images === "string") {
    try {
      raw.push(...JSON.parse(product.images));
    } catch {
      raw.push(product.images);
    }
  }

  return [...new Set(raw)]
    .filter((u): u is string => Boolean(u))
    .map(resolveImageUrl)
    .filter((u): u is string => Boolean(u));
}

function isPromotionActive(product: ProductDetails): boolean {
  if (!product.promotion_price || Number(product.promotion_price) <= 0)
    return false;
  if (!product.promotion_ends_at) return true;
  return new Date(product.promotion_ends_at) > new Date();
}

function getDisplayPrice(product: ProductDetails): {
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

/** Sliding window pagination */
function getVisiblePages(
  current: number,
  total: number,
  windowSize = 5,
): (number | string)[] {
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, current + half);

  if (end - start + 1 < windowSize) {
    if (start === 1) end = Math.min(total, start + windowSize - 1);
    else if (end === total) start = Math.max(1, end - windowSize + 1);
  }

  const pages: (number | string)[] = [];

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("…");
  }

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < total) {
    if (end < total - 1) pages.push("…");
    pages.push(total);
  }

  return pages;
}

/* ─── Stacked scroll lock (modal-safe) ─── */
let scrollLockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalBodyTouch = "";

function lockScroll(): void {
  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }
  scrollLockCount++;
}

function unlockScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.touchAction = originalBodyTouch;
  }
}

/* ─── Animation variants ─── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.96, y: 20, transition: { duration: 0.2 } },
};

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[var(--pc-surface)] dark:bg-[#0D1117] rounded-2xl border border-[var(--pc-border)]/30 overflow-hidden">
      <div className="relative aspect-[4/3] bg-[var(--pc-surface-alt)] dark:bg-[#161B22] animate-pulse" />
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="h-4 bg-[var(--pc-border)]/30 rounded-lg w-3/4 animate-pulse" />
        <div className="h-3 bg-[var(--pc-border)]/20 rounded-lg w-1/2 animate-pulse" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-4 bg-[var(--pc-border)]/30 rounded-lg w-1/4 animate-pulse" />
          <div className="h-8 bg-[var(--pc-border)]/30 rounded-xl w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  const addToCart = useCartStore((state) => state.addItem);
  const [qty, setQty] = useState(1);

  const p = product as ProductDetails;
  const images = getProductImages(p);
  const mainImage = images[0] ?? null;
  const stockQty = p.stock_quantity ?? p.stock ?? 0;
  const desc = p.description ?? "";
  const isOutOfStock = stockQty <= 0;
  const [imgError, setImgError] = useState(false);

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOutOfStock) return;
      for (let i = 0; i < qty; i++) addToCart(product);
      setQty(1);
    },
    [addToCart, product, qty, isOutOfStock],
  );

  return (
    <motion.div
      variants={itemVariants}
      layout
      onClick={() => onOpen(product)}
      className={`group relative flex flex-col bg-[var(--pc-surface)] dark:bg-[#0D1117] rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm cursor-pointer ${
        isOutOfStock
          ? "border-red-500/30 opacity-75"
          : "border-[var(--pc-border)]/40 hover:border-[var(--pc-primary)]/30 hover:shadow-lg hover:shadow-[var(--pc-primary)]/5"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--pc-surface-alt)] dark:bg-[#161B22]">
        {mainImage && !imgError ? (
          <img
            src={mainImage}
            alt={p.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isOutOfStock ? "" : "group-hover:scale-110"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[var(--pc-surface-alt)] to-[var(--pc-border)]/20">
            🎁
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[var(--pc-primary)] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-[var(--pc-primary)]/30">
          {p.category ?? "Autre"}
        </span>

        {(() => {
          const { isPromo } = getDisplayPrice(p);
          return isPromo ? (
            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-red-500/30">
              PROMO
            </span>
          ) : null;
        })()}

        {images.length > 0 && !isOutOfStock && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ZoomIn size={18} className="text-[var(--pc-text-primary)]" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <h3 className="font-bold text-[var(--pc-text-primary)] text-sm sm:text-base leading-tight mb-0.5 truncate">
          {p.name}
        </h3>

        {desc && (
          <p className="text-[var(--pc-text-secondary)] text-xs sm:text-sm leading-snug mb-3 line-clamp-2">
            {desc}
          </p>
        )}

        {/* Price + Counter/Status + Add */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {(() => {
              const { current, original, isPromo } = getDisplayPrice(p);
              return (
                <>
                  <span
                    className={`font-bold text-sm sm:text-base whitespace-nowrap ${
                      isOutOfStock
                        ? "text-red-400 line-through"
                        : isPromo
                          ? "text-red-500"
                          : "text-[var(--pc-primary)]"
                    }`}
                  >
                    {current} DT
                  </span>
                  {isPromo && original && (
                    <span className="text-xs text-[var(--pc-text-secondary)] line-through">
                      {original} DT
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          {isOutOfStock ? (
            <span className="px-6 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wide">
              indisponible
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center rounded-xl bg-[var(--pc-surface-alt)] dark:bg-[#161B22] border border-[var(--pc-border)]/50 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty((q) => Math.max(1, q - 1));
                  }}
                  aria-label="Diminuer la quantité"
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[var(--pc-border)]/20 active:bg-[var(--pc-border)]/30 transition-colors text-[var(--pc-text-primary)] font-bold text-sm select-none"
                >
                  −
                </button>
                <span className="w-6 sm:w-8 text-center text-sm font-bold text-[var(--pc-text-primary)] select-none">
                  {qty}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty((q) => Math.min(stockQty, q + 1));
                  }}
                  aria-label="Augmenter la quantité"
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[var(--pc-border)]/20 active:bg-[var(--pc-border)]/30 transition-colors text-[var(--pc-text-primary)] font-bold text-sm select-none"
                >
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleAdd}
                aria-label={`Ajouter ${p.name} au panier`}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[var(--pc-primary)] text-white text-xs font-semibold hover:brightness-110 active:brightness-90 transition-all shadow-md shadow-[var(--pc-primary)]/20"
              >
                <ShoppingCart size={13} />
                <span className="hidden sm:inline">Ajouter</span>
              </motion.button>
            </div>
          )}
        </div>

        <p
          className={`text-[10px] sm:text-xs mt-2 font-medium ${
            isOutOfStock ? "text-red-400" : "text-blue-400"
          }`}
        >
          {isOutOfStock ? "Rupture de stock" : `En stock`}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Product Modal ─── */
function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const addToCart = useCartStore((state) => state.addItem);
  const [qty, setQty] = useState(1);
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const p = product as ProductDetails;
  const images = getProductImages(p);
  const stockQty = p.stock_quantity ?? p.stock ?? 0;
  const desc = p.description ?? "";
  const isOutOfStock = stockQty <= 0;

  /* Stacked scroll lock */
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((prev) => Math.max(0, prev - 1));
      if (e.key === "ArrowRight")
        setCurrent((prev) => Math.min(images.length - 1, prev + 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, images.length]);

  const next = useCallback(
    () => setCurrent((prev) => Math.min(images.length - 1, prev + 1)),
    [images.length],
  );
  const prev = useCallback(
    () => setCurrent((prev) => Math.max(0, prev - 1)),
    [],
  );

  const handleAdd = useCallback(() => {
    if (isOutOfStock) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    onClose();
  }, [addToCart, product, qty, isOutOfStock, onClose]);

  const blockScroll = useCallback((e: React.UIEvent) => {
    e.stopPropagation();
  }, []);

  const currentImage = images[current];

  return (
    <motion.div
      variants={modalOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      onWheel={blockScroll}
      onTouchMove={blockScroll}
      role="dialog"
      aria-modal="true"
      aria-label={`Détails de ${p.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--pc-surface)] dark:bg-[#0D1117] rounded-3xl border border-[var(--pc-border)]/40 shadow-2xl shadow-black/20 overscroll-contain"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 dark:hover:bg-black/90 transition-colors shadow-lg"
        >
          <X size={20} />
        </button>

        {/* Main Image */}
        <div className="relative aspect-[16/10] bg-[var(--pc-surface-alt)] dark:bg-[#161B22] overflow-hidden rounded-t-3xl">
          {currentImage && !imgError[current] ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                src={currentImage}
                alt={`${p.name} — image ${current + 1}`}
                onError={() =>
                  setImgError((prev) => ({ ...prev, [current]: true }))
                }
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🎁
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                disabled={current === 0}
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/80 dark:hover:bg-black/90 transition-colors shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                disabled={current === images.length - 1}
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/80 dark:hover:bg-black/90 transition-colors shadow-lg"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md text-white text-xs font-bold shadow-lg">
                {current + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-b border-[var(--pc-border)]/30">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Voir l'image ${i + 1}`}
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === current
                    ? "border-[var(--pc-primary)] shadow-md shadow-[var(--pc-primary)]/20"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--pc-text-primary)] mb-1">
                {p.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] text-xs font-bold uppercase tracking-wider">
                  {p.category ?? "Produit"}
                </span>
                {(() => {
                  const { isPromo } = getDisplayPrice(p);
                  return isPromo ? (
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider">
                      PROMOTION
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
            <div className="text-right">
              {(() => {
                const { current, original, isPromo } = getDisplayPrice(p);
                return (
                  <>
                    <span
                      className={`text-2xl font-bold whitespace-nowrap ${
                        isOutOfStock
                          ? "text-red-400 line-through"
                          : isPromo
                            ? "text-red-500"
                            : "text-[var(--pc-primary)]"
                      }`}
                    >
                      {current} DT
                    </span>
                    {isPromo && original && (
                      <p className="text-sm text-[var(--pc-text-secondary)] line-through">
                        {original} DT
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {desc && (
            <p className="text-[var(--pc-text-secondary)] text-sm sm:text-base leading-relaxed mb-5">
              {desc}
            </p>
          )}

          <div
            className={`flex items-center gap-3 text-sm mb-6 ${
              isOutOfStock ? "text-red-400" : "text-[var(--pc-text-secondary)]"
            }`}
          >
            <PackageOpen size={16} />
            <span className="font-medium">
              {isOutOfStock
                ? "Rupture de stock"
                : `${stockQty} unités en stock`}
            </span>
          </div>

          {/* Counter + Add OR Out of stock */}
          {isOutOfStock ? (
            <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm sm:text-base">
              <X size={18} />
              Indisponible
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Counter */}
              <div className="flex items-center rounded-2xl bg-[var(--pc-surface-alt)] dark:bg-[#161B22] border border-[var(--pc-border)]/50 overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer la quantité"
                  className="w-10 h-11 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-[var(--pc-border)]/20 active:bg-[var(--pc-border)]/30 transition-colors text-[var(--pc-text-primary)] font-bold text-lg select-none"
                >
                  −
                </button>
                <span className="w-10 sm:w-12 text-center text-base font-bold text-[var(--pc-text-primary)] select-none">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(stockQty, q + 1))}
                  aria-label="Augmenter la quantité"
                  className="w-10 h-11 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-[var(--pc-border)]/20 active:bg-[var(--pc-border)]/30 transition-colors text-[var(--pc-text-primary)] font-bold text-lg select-none"
                >
                  +
                </button>
              </div>

              {/* Add button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                aria-label={`Ajouter ${qty} ${p.name} au panier`}
                className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl bg-[var(--pc-primary)] text-white font-bold text-sm sm:text-base hover:brightness-110 active:brightness-90 transition-all shadow-lg shadow-[var(--pc-primary)]/20"
              >
                <ShoppingCart size={18} />
                Ajouter {qty > 1 ? `(${qty})` : ""} au panier
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export function BoutiquePage({ onBack, onNavigate }: BoutiquePageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">(
    "newest",
  );
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const totalCartItems = useCartStore((state) => state.totalItems());

  /* Focus only on desktop (avoid mobile keyboard popup) */
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (!isMobile) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category, sortBy]);

  const { data, isLoading, isFetching } = useProducts({
    search: debouncedQuery || undefined,
    category: category === "all" ? undefined : category,
    sort: sortBy,
    page,
    per_page: PER_PAGE,
  });

  const results = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.last_page ?? 1;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div
      className={`min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] flex flex-col ${
        isRtl ? "flex-row-reverse" : ""
      }`}
    >
      {/* ═══════ Header Premium ═══════ */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-30 bg-[var(--pc-surface)]/80 dark:bg-[#0D1117]/80 backdrop-blur-2xl border-b border-[var(--pc-border)]/60 px-3 sm:px-4 pt-3 sm:pt-4 pb-3 shadow-[0_4px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
      >
        {/* Top bar */}
        <div
          className={`flex items-center gap-2.5 sm:gap-3 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            onClick={onBack}
            aria-label="Retour"
            className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-2xl bg-[var(--pc-surface-alt)] dark:bg-[#161B22] border border-[var(--pc-border)]/70 hover:border-[var(--pc-primary)]/40 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft
              size={18}
              className={`text-[var(--pc-text-primary)] ${
                isRtl ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {/* Search */}
          <div
            className={`flex-1 flex items-center gap-2.5 bg-[var(--pc-surface-alt)] dark:bg-[#161B22] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 border border-[var(--pc-border)]/70 focus-within:border-[var(--pc-primary)] focus-within:ring-4 focus-within:ring-[var(--pc-primary)]/10 transition-all duration-300 shadow-sm ${
              isRtl ? "flex-row-reverse" : ""
            }`}
          >
            <AnimatePresence mode="wait">
              {isFetching ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2
                    size={18}
                    className="text-[var(--pc-primary)] flex-shrink-0 animate-spin"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search
                    size={18}
                    className="text-[var(--pc-text-secondary)] flex-shrink-0"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un accessoire..."
              className="flex-1 bg-transparent text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)]/70 focus:outline-none font-medium text-sm sm:text-[15px]"
              dir={isRtl ? "rtl" : "ltr"}
            />

            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.5, width: 0 }}
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--pc-border)]/40 hover:bg-[var(--pc-border)]/70 transition-colors"
                >
                  <X size={14} className="text-[var(--pc-text-secondary)]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => onNavigate("cart")}
            aria-label="Voir le panier"
            className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-2xl bg-[var(--pc-surface-alt)] dark:bg-[#161B22] border border-[var(--pc-border)]/70 hover:border-[var(--pc-primary)]/40 transition-all duration-300 shadow-sm"
          >
            <ShoppingBag size={18} className="text-[var(--pc-text-primary)]" />
            <AnimatePresence>
              {totalCartItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[var(--pc-primary)] to-[var(--pc-primary)]/80 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-[var(--pc-primary)]/30"
                  style={{ fontSize: "10px", width: 20, height: 20 }}
                >
                  {totalCartItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Categories */}
        <div
          className={`flex gap-2 sm:gap-2.5 mt-3 sm:mt-4 overflow-x-auto pb-1 scrollbar-hide ${
            isRtl ? "flex-row-reverse" : ""
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((c, idx) => (
            <motion.div
              key={c.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: idx * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              <CategoryChip
                icon={c.icon}
                label={c.label}
                active={category === c.value}
                onClick={() => setCategory(c.value)}
              />
            </motion.div>
          ))}
        </div>

        {/* Sort + total */}
        <div
          className={`flex items-center justify-between mt-3 sm:mt-3.5 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[var(--pc-text-secondary)] font-medium flex items-center gap-1.5 text-xs sm:text-[13px]"
          >
            <PackageOpen size={14} />
            <span>
              <span className="font-bold text-[var(--pc-text-primary)]">
                {total}
              </span>{" "}
              produits
            </span>
          </motion.p>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--pc-primary)]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "priceAsc" | "priceDesc")
              }
              aria-label="Trier les produits"
              className="relative appearance-none bg-[var(--pc-surface-alt)] dark:bg-[#161B22] border border-[var(--pc-border)]/70 rounded-xl pl-3 pr-8 py-1.5 sm:py-2 text-[var(--pc-text-secondary)] font-medium focus:outline-none focus:border-[var(--pc-primary)]/50 focus:ring-2 focus:ring-[var(--pc-primary)]/10 transition-all duration-300 cursor-pointer hover:border-[var(--pc-primary)]/30 text-xs sm:text-[13px]"
            >
              <option value="newest">Plus récents</option>
              <option value="priceAsc">Prix croissant</option>
              <option value="priceDesc">Prix décroissant</option>
            </select>
            <SlidersHorizontal
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)]/60 pointer-events-none"
            />
          </div>
        </div>
      </motion.header>

      {/* ═══════ Main Content ═══════ */}
      <main className="flex-1 p-3 sm:p-4">
        <AnimatePresence mode="wait">
          {/* ── Loading ── */}
          {isLoading ? (
            <motion.div
              key="loading"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
            >
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <SkeletonCard />
                </motion.div>
              ))}
            </motion.div>
          ) : results.length === 0 ? (
            /* ── Empty ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="flex flex-col items-center justify-center py-20 sm:py-28 text-center px-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-[var(--pc-primary)]/10 rounded-full blur-3xl scale-150" />
                <div className="relative text-6xl sm:text-7xl bg-gradient-to-br from-[var(--pc-primary)]/20 to-transparent rounded-3xl p-6 backdrop-blur-sm border border-[var(--pc-border)]/20">
                  🛍️
                </div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-bold text-[var(--pc-text-primary)] mb-2 text-lg sm:text-xl"
              >
                Aucun produit trouvé
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[var(--pc-text-secondary)] max-w-xs leading-relaxed text-sm sm:text-[15px]"
              >
                Essayez une autre catégorie ou modifiez vos mots-clés de
                recherche
              </motion.p>
              {query && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setQuery("")}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[var(--pc-primary)]/10 text-[var(--pc-primary)] font-semibold text-sm hover:bg-[var(--pc-primary)]/20 transition-colors"
                >
                  Effacer la recherche
                </motion.button>
              )}
            </motion.div>
          ) : (
            /* ── Products Grid ── */
            <motion.div
              key={`results-${category}-${debouncedQuery}-${sortBy}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {results.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{
                      y: -6,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                    className="will-change-transform"
                  >
                    <ProductCard
                      product={product}
                      onOpen={setSelectedProduct}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                  }}
                  className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 mb-4"
                >
                  <motion.button
                    whileHover={page > 1 ? { scale: 1.05 } : {}}
                    whileTap={page > 1 ? { scale: 0.95 } : {}}
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage(Math.max(1, page - 1))}
                    aria-label="Page précédente"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[var(--pc-border)]/70 bg-[var(--pc-surface)] dark:bg-[#0D1117] text-[var(--pc-text-secondary)] font-semibold disabled:opacity-35 disabled:cursor-not-allowed hover:border-[var(--pc-primary)]/30 hover:text-[var(--pc-primary)] transition-all duration-300 shadow-sm text-xs sm:text-sm"
                  >
                    Précédent
                  </motion.button>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {visiblePages.map((pageNum, idx) =>
                      pageNum === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="text-[var(--pc-text-secondary)] px-1 text-xs"
                        >
                          …
                        </span>
                      ) : (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setPage(pageNum as number)}
                          aria-label={`Page ${pageNum}`}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all duration-300 ${
                            pageNum === page
                              ? "bg-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/25"
                              : "text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] dark:hover:bg-[#161B22]"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      ),
                    )}
                  </div>

                  <motion.button
                    whileHover={page < totalPages ? { scale: 1.05 } : {}}
                    whileTap={page < totalPages ? { scale: 0.95 } : {}}
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    aria-label="Page suivante"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[var(--pc-border)]/70 bg-[var(--pc-surface)] dark:bg-[#0D1117] text-[var(--pc-text-secondary)] font-semibold disabled:opacity-35 disabled:cursor-not-allowed hover:border-[var(--pc-primary)]/30 hover:text-[var(--pc-primary)] transition-all duration-300 shadow-sm text-xs sm:text-sm"
                  >
                    Suivant
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══════ Product Modal ═══════ */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
