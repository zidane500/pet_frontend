import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Heart,
  Loader2,
  MapPin,
  PawPrint,
  Star,
  Stethoscope,
  Store,
} from "lucide-react";
import { useFavorites, useToggleFavorite } from "../../hooks/useFavorites";
import type { Favorite, Listing, PetStore, Vet } from "../../types";

interface FavoritesPageProps {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = "animals" | "vets" | "shops";

function morphType(
  favorite: Favorite,
): "listing" | "vet" | "pet_store" | "unknown" {
  const value = favorite.favoritable_type.toLowerCase();
  if (value.includes("listing")) return "listing";
  if (value.includes("petstore") || value.includes("pet_store"))
    return "pet_store";
  if (value.includes("vet")) return "vet";
  return "unknown";
}

function isListing(item: Favorite["favoritable"]): item is Listing {
  return Boolean(item && "title" in item && "type" in item);
}

function isVet(item: Favorite["favoritable"]): item is Vet {
  return Boolean(item && "clinic_name" in item && "doctor_name" in item);
}

function isPetStore(item: Favorite["favoritable"]): item is PetStore {
  return Boolean(item && "store_name" in item);
}

function formatPrice(listing: Listing): string {
  if (listing.is_free || listing.type === "adoption") return "Gratuit";
  if (listing.price != null && listing.price !== "") {
    return `${Number(listing.price).toLocaleString("fr-TN")} DT`;
  }
  return "—";
}

function firstImage(listing: Listing): string {
  return (
    listing.photos?.[0] ||
    `https://picsum.photos/seed/listing-${listing.id}/500/360`
  );
}

function shopImage(shop: PetStore): string {
  return (
    shop.logo ||
    shop.photos?.[0] ||
    `https://picsum.photos/seed/shop-${shop.id}/500/360`
  );
}

function Rating({ value }: { value: number | string }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }
        />
      ))}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  cta,
  onClick,
}: {
  icon: string;
  title: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--pc-surface-alt)] flex items-center justify-center text-4xl">
        {icon}
      </div>
      <p className="text-[var(--pc-text-secondary)] text-sm font-medium">
        {title}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="gradient-btn text-white text-sm font-semibold rounded-full px-6 py-2.5"
      >
        {cta}
      </button>
    </div>
  );
}

function RemoveButton({
  busy,
  onClick,
}: {
  busy: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:scale-110 transition-transform disabled:opacity-50"
      aria-label="Retirer des favoris"
    >
      {busy ? (
        <Loader2 size={15} className="animate-spin text-red-500" />
      ) : (
        <Heart size={15} className="fill-red-500 text-red-500" />
      )}
    </button>
  );
}

export function FavoritesPage({ onBack, onNavigate }: FavoritesPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("animals");
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const favorites = favoritesQuery.data ?? [];

  const grouped = useMemo(() => {
    return {
      animals: favorites.filter(
        (favorite) =>
          morphType(favorite) === "listing" && isListing(favorite.favoritable),
      ),
      vets: favorites.filter(
        (favorite) =>
          morphType(favorite) === "vet" && isVet(favorite.favoritable),
      ),
      shops: favorites.filter(
        (favorite) =>
          morphType(favorite) === "pet_store" &&
          isPetStore(favorite.favoritable),
      ),
    };
  }, [favorites]);

  const totalCount =
    grouped.animals.length + grouped.vets.length + grouped.shops.length;
  const pendingKey = toggleFavorite.variables
    ? `${toggleFavorite.variables.type}:${toggleFavorite.variables.id}`
    : null;

  const removeFavorite = (favorite: Favorite) => {
    const type = morphType(favorite);
    if (type === "unknown") return;
    toggleFavorite.mutate({ type, id: favorite.favoritable_id });
  };

  const tabs: { key: Tab; label: string; icon: ReactNode; count: number }[] = [
    {
      key: "animals",
      label: "Animaux",
      icon: <PawPrint size={14} />,
      count: grouped.animals.length,
    },
    {
      key: "vets",
      label: "Vétérinaires",
      icon: <Stethoscope size={14} />,
      count: grouped.vets.length,
    },
    {
      key: "shops",
      label: "Animaleries",
      icon: <Store size={14} />,
      count: grouped.shops.length,
    },
  ];

  return (
    <div
      className="min-h-screen bg-[var(--pc-surface)] text-[var(--pc-text-primary)]"
      dir="ltr"
    >
      <header className="sticky top-0 z-30 glass-card border-b border-[var(--pc-border)]">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-lg font-bold">Mes Favoris</h1>
          {favoritesQuery.isFetching && (
            <Loader2
              size={16}
              className="animate-spin text-[var(--pc-primary)]"
            />
          )}
          {totalCount > 0 && (
            <span className="bg-[var(--pc-primary)] text-white text-xs font-bold rounded-full px-2.5 py-0.5 min-w-[22px] text-center">
              {totalCount}
            </span>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--pc-primary)] text-white shadow-sm"
                  : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 py-0 leading-5 ${activeTab === tab.key ? "bg-white/25 text-white" : "bg-[var(--pc-primary)]/15 text-[var(--pc-primary)]"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 pb-24">
        {favoritesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-52 rounded-2xl bg-[var(--pc-surface-alt)] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "animals" &&
              (grouped.animals.length === 0 ? (
                <EmptyState
                  icon="🤍"
                  title="Aucun animal sauvegardé"
                  cta="Explorer les annonces"
                  onClick={() => onNavigate("search")}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {grouped.animals.map((favorite) => {
                    const listing = favorite.favoritable as Listing;
                    const key = `listing:${listing.id}`;
                    return (
                      <motion.article
                        key={favorite.id}
                        layout
                        className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                        onClick={() =>
                          onNavigate("pet-detail", { id: String(listing.id) })
                        }
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={firstImage(listing)}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              (event.currentTarget as HTMLImageElement).src =
                                `https://picsum.photos/seed/listing-${listing.id}/500/360`;
                            }}
                          />
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-bold rounded-full px-2 py-0.5 leading-5 ${listing.type === "adoption" ? "bg-emerald-500" : "bg-blue-500"} text-white`}
                          >
                            {listing.type === "adoption"
                              ? "Adoption"
                              : "Annonce"}
                          </span>
                          <RemoveButton
                            busy={
                              pendingKey === key && toggleFavorite.isPending
                            }
                            onClick={(event) => {
                              event.stopPropagation();
                              removeFavorite(favorite);
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm truncate">
                            {listing.title}
                          </p>
                          <div className="flex items-center justify-between mt-1.5 gap-2">
                            <span className="text-[var(--pc-primary)] font-bold text-sm truncate">
                              {formatPrice(listing)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[var(--pc-text-secondary)] truncate">
                              <MapPin size={11} /> {listing.city ?? "—"}
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ))}

            {activeTab === "vets" &&
              (grouped.vets.length === 0 ? (
                <EmptyState
                  icon="🩺"
                  title="Aucun vétérinaire sauvegardé"
                  cta="Voir les vétérinaires"
                  onClick={() => onNavigate("search", { type: "vet" })}
                />
              ) : (
                <div className="space-y-3">
                  {grouped.vets.map((favorite) => {
                    const vet = favorite.favoritable as Vet;
                    const key = `vet:${vet.id}`;
                    return (
                      <motion.article
                        key={favorite.id}
                        layout
                        className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow relative"
                        onClick={() =>
                          onNavigate("vet-profile", { id: String(vet.id) })
                        }
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[var(--pc-primary)]/10 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
                          {vet.photo ? (
                            <img
                              src={vet.photo}
                              alt={vet.clinic_name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            "🩺"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">
                            {vet.clinic_name}
                          </p>
                          <p className="text-sm text-[var(--pc-text-secondary)] truncate">
                            {vet.doctor_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--pc-text-secondary)]">
                            <Rating value={vet.rating} />
                            <span>{vet.city}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFavorite(favorite);
                          }}
                          disabled={
                            pendingKey === key && toggleFavorite.isPending
                          }
                          className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-50"
                          aria-label="Retirer des favoris"
                        >
                          {pendingKey === key && toggleFavorite.isPending ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Heart size={16} className="fill-red-500" />
                          )}
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              ))}

            {activeTab === "shops" &&
              (grouped.shops.length === 0 ? (
                <EmptyState
                  icon="🏪"
                  title="Aucune animalerie sauvegardée"
                  cta="Voir les animaleries"
                  onClick={() => onNavigate("search", { type: "shop" })}
                />
              ) : (
                <div className="space-y-3">
                  {grouped.shops.map((favorite) => {
                    const shop = favorite.favoritable as PetStore;
                    const key = `pet_store:${shop.id}`;
                    return (
                      <motion.article
                        key={favorite.id}
                        layout
                        className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() =>
                          onNavigate("shop-profile", { id: String(shop.id) })
                        }
                      >
                        <img
                          src={shopImage(shop)}
                          alt={shop.store_name}
                          className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            (event.currentTarget as HTMLImageElement).src =
                              `https://picsum.photos/seed/shop-${shop.id}/500/360`;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">
                            {shop.store_name}
                          </p>
                          <p className="text-sm text-[var(--pc-text-secondary)] truncate">
                            {shop.city}
                          </p>
                          <div className="mt-1">
                            <Rating value={shop.rating} />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFavorite(favorite);
                          }}
                          disabled={
                            pendingKey === key && toggleFavorite.isPending
                          }
                          className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-50"
                          aria-label="Retirer des favoris"
                        >
                          {pendingKey === key && toggleFavorite.isPending ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Heart size={16} className="fill-red-500" />
                          )}
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              ))}
          </>
        )}
      </main>
    </div>
  );
}
