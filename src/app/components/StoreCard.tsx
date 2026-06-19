import { Star, MapPin, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { PetStore } from "../../types";

interface StoreCardProps {
  store: PetStore;
  index?: number;
  onClick?: () => void;
}

function isProbablyOpen(store: PetStore): boolean {
  if (store.is_active === false) return false;
  const hoursText = Object.values(store.opening_hours ?? {}).join(" ");
  if (
    /fermé/i.test(hoursText) &&
    !/lun|mar|mer|jeu|ven|sam|dim/i.test(hoursText)
  ) {
    return false;
  }
  return true;
}

export function StoreCard({ store, index = 0, onClick }: StoreCardProps) {
  const { t } = useTranslation();

  const image =
    store.photos?.[0] ||
    store.logo ||
    `https://picsum.photos/seed/store-${store.id}/400/200`;
  const rating = Number(store.rating ?? 0);
  const reviews = store.reviews_count ?? 0;
  const products =
    store.services?.filter(Boolean).join(" · ") ||
    store.description ||
    "Nourriture · Accessoires · Soins";
  const open = isProbablyOpen(store);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden border border-[var(--pc-border)]/60 dark:border-[var(--pc-border)]/40 transition-all duration-400 group cursor-pointer"
    >
      <div className="relative h-36 overflow-hidden">
        <motion.img
          src={image}
          alt={store.store_name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/store-${store.id}/400/200`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md ${
              open ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-white ${open ? "blink-dot" : ""}`}
            />
            {open ? t("stores.open") : t("stores.closed")}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-3">
          <h3
            className="text-white font-black"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "15px" }}
          >
            {store.store_name}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <p
          className="text-[var(--pc-text-secondary)] mb-3 line-clamp-1"
          style={{ fontSize: "12px" }}
        >
          {products}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center gap-1.5 text-[var(--pc-text-secondary)]"
            style={{ fontSize: "12px" }}
          >
            <MapPin size={11} className="text-[var(--pc-primary)]" />
            <span>{store.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span
              className="font-bold text-[var(--pc-text-primary)]"
              style={{ fontSize: "12px" }}
            >
              {rating.toFixed(1)}
            </span>
            <span
              className="text-[var(--pc-text-secondary)]"
              style={{ fontSize: "11px" }}
            >
              ({reviews})
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[var(--pc-primary)] text-[var(--pc-primary)] font-bold hover:bg-[var(--pc-primary)] hover:text-white transition-all duration-300 touch-manipulation"
          style={{ fontSize: "13px" }}
        >
          <ExternalLink size={13} />
          {t("stores.viewStore")}
        </motion.button>
      </div>
    </motion.div>
  );
}
