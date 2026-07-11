import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Minus, Plus, Trash2, Info, X as XIcon } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useCreateOrder } from "../../hooks/useOrders";
import { productsApi } from "../../api/products";
import type { Product } from "../../types";

interface CartPageProps {
  onBack: () => void;
}

interface ShippingForm {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  notes: string;
}

const EMPTY_FORM: ShippingForm = {
  shipping_name: "",
  shipping_phone: "",
  shipping_address: "",
  shipping_city: "",
  notes: "",
};

export function CartPage({ onBack }: CartPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const createOrder = useCreateOrder();

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastPhone, setLastPhone] = useState("");

  // ← Notifie le client si un prix a changé (promotion, etc.) ou si un
  // produit du panier n'est plus disponible.
  const [syncNotice, setSyncNotice] = useState<{
    priceChanged: {
      productId: number;
      name: string;
      oldPrice: number;
      newPrice: number;
    }[];
    removed: { productId: number; name: string }[];
  } | null>(null);

  // ← BUG CORRIGÉ : le panier stockait un prix figé au moment de
  // l'ajout, jamais revérifié. Ici, dès l'ouverture de /panier, on
  // redemande le prix ACTUEL de chaque produit au serveur et on met à
  // jour le panier en conséquence (et on retire les produits qui ne
  // sont plus disponibles).
  useEffect(() => {
    const initialItems = useCartStore.getState().items;
    if (initialItems.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled(
        initialItems.map((i) => productsApi.getOne(i.productId)),
      );
      if (cancelled) return;

      const freshProducts: Product[] = [];
      const removedIds: number[] = [];

      results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          freshProducts.push(result.value);
        } else {
          // ← 404 = produit supprimé OU désactivé par l'admin
          removedIds.push(initialItems[idx].productId);
        }
      });

      const { priceChanged, removed } = useCartStore
        .getState()
        .syncWithCatalog(freshProducts, removedIds);

      if (priceChanged.length > 0 || removed.length > 0) {
        setSyncNotice({ priceChanged, removed });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ← Redirige vers l'inscription/connexion en gardant `/panier` comme
  // page de retour (même mécanisme que RequireAuth.tsx : après
  // connexion réussie, AuthPageWrapper renvoie vers `location.state.from`).
  const goToAuth = (mode: "login" | "register") => {
    navigate(`/${mode}`, { state: { from: location } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createOrder.mutateAsync({
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
        ...form,
      });
      setLastPhone(form.shipping_phone);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.errors?.items?.[0] ??
          err?.response?.data?.message ??
          "Impossible de finaliser la commande. Réessayez.",
      );
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--pc-surface-alt)] dark:bg-[#060C12]">
        <div className="text-6xl mb-4">🎉</div>
        <h2
          className="font-black text-[var(--pc-text-primary)] mb-2"
          style={{ fontFamily: "Sora, sans-serif", fontSize: "20px" }}
        >
          Commande envoyée !
        </h2>
        <p
          className="text-[var(--pc-text-secondary)] max-w-xs mb-6"
          style={{ fontSize: "14px" }}
        >
          On vous contacte très vite au {lastPhone} pour confirmer la livraison.
          Paiement à la livraison.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-3 bg-[var(--pc-primary)] text-white rounded-xl font-bold"
          style={{ fontSize: "14px" }}
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--pc-surface-alt)] dark:bg-[#060C12]">
        <div className="text-6xl mb-4">🛒</div>
        <p
          className="font-bold text-[var(--pc-text-primary)] mb-1"
          style={{ fontSize: "18px" }}
        >
          Votre panier est vide
        </p>
        {/* ← Si le panier vient d'être vidé par la resynchronisation
            (dernier produit devenu indisponible), on l'explique plutôt
            que de laisser le client perplexe. */}
        {syncNotice && syncNotice.removed.length > 0 && (
          <p
            className="text-amber-600 dark:text-amber-400 max-w-xs mt-2"
            style={{ fontSize: "12px" }}
          >
            {syncNotice.removed.map((r) => r.name).join(", ")} n'
            {syncNotice.removed.length > 1 ? "étaient" : "était"} plus
            disponible{syncNotice.removed.length > 1 ? "s" : ""} et{" "}
            {syncNotice.removed.length > 1 ? "ont" : "a"} été retiré
            {syncNotice.removed.length > 1 ? "s" : ""} du panier.
          </p>
        )}
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[var(--pc-primary)] text-white rounded-xl font-semibold"
          style={{ fontSize: "13px" }}
        >
          Découvrir la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pc-surface-alt)] dark:bg-[#060C12] pb-8">
      <header className="sticky top-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)] px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--pc-border)]"
        >
          <ArrowLeft size={18} className="text-[var(--pc-text-primary)]" />
        </button>
        <h1
          className="font-black text-[var(--pc-text-primary)]"
          style={{ fontFamily: "Sora, sans-serif", fontSize: "17px" }}
        >
          Mon panier
        </h1>
      </header>

      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {/* ← Bannière : informe le client si un prix a changé ou si un
            produit a été retiré (plus dispo / désactivé par l'admin) */}
        <AnimatePresence>
          {syncNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-1.5 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Info
                    size={15}
                    className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    {syncNotice.priceChanged.map((c) => (
                      <p
                        key={c.productId}
                        className="text-amber-800 dark:text-amber-300"
                        style={{ fontSize: "12px" }}
                      >
                        Prix de <strong>{c.name}</strong> mis à jour :{" "}
                        {c.oldPrice.toLocaleString("fr-TN")} DT →{" "}
                        <strong>{c.newPrice.toLocaleString("fr-TN")} DT</strong>
                      </p>
                    ))}
                    {syncNotice.removed.map((r) => (
                      <p
                        key={r.productId}
                        className="text-amber-800 dark:text-amber-300"
                        style={{ fontSize: "12px" }}
                      >
                        <strong>{r.name}</strong> n'est plus disponible et a été
                        retiré du panier.
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSyncNotice(null)}
                  className="flex-shrink-0 text-amber-600 dark:text-amber-400"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-3 flex items-center gap-3"
            >
              <img
                src={
                  item.photo ??
                  `https://picsum.photos/seed/product-${item.productId}/100/100`
                }
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-[var(--pc-text-primary)] truncate"
                  style={{ fontSize: "14px" }}
                >
                  {item.name}
                </p>
                <p
                  className="text-[var(--pc-primary)] font-black"
                  style={{ fontSize: "13px" }}
                >
                  {item.price.toLocaleString("fr-TN")} DT
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-[var(--pc-border)]"
                  >
                    <Minus size={11} />
                  </button>
                  <span
                    className="font-bold w-4 text-center"
                    style={{ fontSize: "13px" }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stockQuantity}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-[var(--pc-border)] disabled:opacity-30"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="flex-shrink-0 text-[var(--pc-text-secondary)] hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Total */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <span
            className="font-bold text-[var(--pc-text-primary)]"
            style={{ fontSize: "15px" }}
          >
            Total
          </span>
          <span
            className="font-black text-[var(--pc-primary)]"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "20px" }}
          >
            {totalPrice.toLocaleString("fr-TN")} DT
          </span>
        </div>

        {/* ← Si pas connecté : on ne demande PAS encore les infos de
            livraison, on propose directement de créer un compte /
            se connecter. Le panier reste intact grâce à cartStore
            (localStorage). */}
        {!isLoggedIn ? (
          <div className="glass-card rounded-2xl p-5 text-center space-y-3">
            <p
              className="text-[var(--pc-text-primary)] font-semibold"
              style={{ fontSize: "14px" }}
            >
              Un compte est nécessaire pour finaliser votre commande
            </p>
            <p
              className="text-[var(--pc-text-secondary)]"
              style={{ fontSize: "12px" }}
            >
              Votre panier est conservé, vous n'aurez rien à refaire.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToAuth("register")}
                className="flex-1 py-3 bg-[var(--pc-primary)] text-white rounded-xl font-bold"
                style={{ fontSize: "13px" }}
              >
                Créer un compte
              </button>
              <button
                onClick={() => goToAuth("login")}
                className="flex-1 py-3 border border-[var(--pc-border)] rounded-xl font-bold text-[var(--pc-text-primary)]"
                style={{ fontSize: "13px" }}
              >
                Se connecter
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-4 space-y-3"
          >
            <h2
              className="font-bold text-[var(--pc-text-primary)]"
              style={{ fontSize: "14px" }}
            >
              Informations de livraison
            </h2>

            <input
              type="text"
              placeholder="Nom complet *"
              value={form.shipping_name}
              onChange={(e) =>
                setForm({ ...form, shipping_name: e.target.value })
              }
              className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2.5 text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)]"
              style={{ fontSize: "14px" }}
              required
            />
            <input
              type="tel"
              placeholder="Téléphone *"
              value={form.shipping_phone}
              onChange={(e) =>
                setForm({ ...form, shipping_phone: e.target.value })
              }
              className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2.5 text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)]"
              style={{ fontSize: "14px" }}
              required
            />
            <input
              type="text"
              placeholder="Adresse *"
              value={form.shipping_address}
              onChange={(e) =>
                setForm({ ...form, shipping_address: e.target.value })
              }
              className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2.5 text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)]"
              style={{ fontSize: "14px" }}
              required
            />
            <input
              type="text"
              placeholder="Ville *"
              value={form.shipping_city}
              onChange={(e) =>
                setForm({ ...form, shipping_city: e.target.value })
              }
              className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2.5 text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)]"
              style={{ fontSize: "14px" }}
              required
            />
            <textarea
              placeholder="Note (optionnel)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-xl px-3 py-2.5 text-[var(--pc-text-primary)] focus:outline-none focus:border-[var(--pc-primary)] resize-none"
              style={{ fontSize: "14px" }}
              rows={2}
            />

            {error && (
              <p className="text-red-500" style={{ fontSize: "12px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={createOrder.isPending}
              className="w-full py-3 bg-[var(--pc-primary)] text-white rounded-xl font-bold disabled:opacity-60"
              style={{ fontSize: "14px" }}
            >
              {createOrder.isPending
                ? "Envoi en cours..."
                : "Confirmer la commande"}
            </button>

            <p
              className="text-center text-[var(--pc-text-secondary)]"
              style={{ fontSize: "11px" }}
            >
              💵 Paiement à la livraison
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
