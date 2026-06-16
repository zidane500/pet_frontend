import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  PlusCircle,
  User,
  Sparkles,
  ChevronRight,
  Bell,
  MessageCircle,
  ChevronDown,
  LogOut,
  Heart,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "../ThemeToggle";
import { LangSelector } from "../LangSelector";

export function Navbar({
  onNavigate,
  isLoggedIn = false,
  currentUser = null,
  onLogout,
}: {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
  isLoggedIn?: boolean;
  currentUser?: { name: string; role: string; avatar?: string } | null;
  onLogout?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { scrollY } = useScroll();
  const isRtl = i18n.language === "ar";
  const profileRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 30));

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleMouseDown);
    }
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [profileOpen]);

  const NAV_LINKS = [
    { key: "listings", emoji: "📋", page: "search" },
    { key: "vets", emoji: "🏥", page: "vets" },
    { key: "stores", emoji: "🏪", page: "stores" },
    { key: "community", emoji: "🐾", page: "feed" },
  ] as const;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const NOTIFICATION_COUNT = 3;
  const MESSAGE_COUNT = 2;

  const profileMenuItems = [
    {
      icon: User,
      label: "Mon Profil",
      action: () => {
        onNavigate?.("profile");
        setProfileOpen(false);
      },
    },
    {
      icon: LayoutDashboard,
      label: "Mes Annonces",
      action: () => {
        onNavigate?.("dashboard", { tab: "myListings" });
        setProfileOpen(false);
      },
    },
    {
      icon: Heart,
      label: "Mes Favoris",
      action: () => {
        onNavigate?.("favorites");
        setProfileOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Paramètres",
      action: () => {
        onNavigate?.("settings");
        setProfileOpen(false);
      },
    },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      >
        <div
          className={`mx-auto transition-all duration-500 ${
            scrolled
              ? "max-w-5xl mt-3 rounded-2xl mx-4 sm:mx-auto glass-card shadow-2xl shadow-black/10 dark:shadow-black/40"
              : "max-w-7xl"
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate?.("home")}
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                className="text-2xl"
              >
                🐾
              </motion.span>
              <div className="flex items-end gap-0.5">
                <span
                  className="font-black bg-gradient-to-r from-[var(--pc-primary)] to-emerald-500 bg-clip-text text-transparent"
                  style={{ fontFamily: "Sora, sans-serif", fontSize: "19px" }}
                >
                  Animali
                </span>
                <span
                  className="font-black text-[var(--pc-accent)] mb-px"
                  style={{ fontSize: "13px" }}
                >
                  .tn
                </span>
              </div>
            </motion.div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.key}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  whileHover={{ y: -1 }}
                  onClick={() => onNavigate?.(link.page)}
                  className="relative flex flex-col items-center px-3 py-2 rounded-xl group transition-all duration-200"
                >
                  <span
                    className="text-[var(--pc-text-secondary)] dark:text-[var(--pc-text-secondary)] group-hover:text-[var(--pc-primary)] dark:group-hover:text-[var(--pc-primary)] font-medium transition-colors duration-200"
                    style={{ fontSize: "13px" }}
                  >
                    {t(`nav.${link.key}`)}
                  </span>
                  <motion.div
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[var(--pc-primary)] to-emerald-400 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              ))}
            </nav>

            {/* Right actions */}
            <div
              className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <ThemeToggle />
              <LangSelector direction="down" />

              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate?.("create-listing")}
                className="hidden sm:flex gradient-btn items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[var(--pc-primary)]/30 touch-manipulation"
                style={{ fontSize: "13px" }}
              >
                <PlusCircle size={15} />
                <span className="hidden md:inline">{t("nav.publish")}</span>
              </motion.button>
              {isLoggedIn ? (
                <>
                  {/* Messages icon */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onNavigate?.("messages")}
                    className="hidden sm:flex relative w-9 h-9 items-center justify-center rounded-xl border border-[var(--pc-border)] hover:border-[var(--pc-primary)] hover:bg-[var(--pc-primary-light)] transition-all duration-200"
                  >
                    <MessageCircle
                      size={16}
                      className="text-[var(--pc-text-secondary)]"
                    />
                    {MESSAGE_COUNT > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                        style={{ fontSize: "9px" }}
                      >
                        {MESSAGE_COUNT}
                      </span>
                    )}
                  </motion.button>

                  {/* Notifications bell */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onNavigate?.("notifications")}
                    className="hidden sm:flex relative w-9 h-9 items-center justify-center rounded-xl border border-[var(--pc-border)] hover:border-[var(--pc-primary)] hover:bg-[var(--pc-primary-light)] transition-all duration-200"
                  >
                    <Bell
                      size={16}
                      className="text-[var(--pc-text-secondary)]"
                    />
                    {NOTIFICATION_COUNT > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                        style={{ fontSize: "9px" }}
                      >
                        {NOTIFICATION_COUNT}
                      </span>
                    )}
                  </motion.button>

                  {/* Profile dropdown */}
                  <div ref={profileRef} className="hidden sm:block relative">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-[var(--pc-border)] hover:border-[var(--pc-primary)] hover:bg-[var(--pc-primary-light)] transition-all duration-200"
                    >
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--pc-primary) 0%, #10b981 100%)",
                            fontSize: "11px",
                          }}
                        >
                          {currentUser?.name ? (
                            getInitials(currentUser.name)
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                      )}
                      <ChevronDown
                        size={13}
                        className={`text-[var(--pc-text-secondary)] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -6 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                          className="absolute right-0 top-full mt-2 min-w-48 glass-card rounded-2xl shadow-xl z-50 overflow-hidden"
                          style={{ border: "1px solid var(--pc-border)" }}
                        >
                          {currentUser && (
                            <div className="px-4 py-3 border-b border-[var(--pc-border)]">
                              <p
                                className="font-bold text-[var(--pc-text-primary)]"
                                style={{ fontSize: "13px" }}
                              >
                                {currentUser.name}
                              </p>
                              <p
                                className="text-[var(--pc-text-secondary)]"
                                style={{ fontSize: "11px" }}
                              >
                                {currentUser.role}
                              </p>
                            </div>
                          )}

                          <div className="p-1.5">
                            {profileMenuItems.map((item) => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--pc-surface-alt)] transition-colors rounded-xl cursor-pointer text-[var(--pc-text-primary)]"
                                style={{ fontSize: "14px" }}
                              >
                                <item.icon
                                  size={15}
                                  className="text-[var(--pc-text-secondary)] flex-shrink-0"
                                />
                                {item.label}
                              </button>
                            ))}

                            <div className="my-1 border-t border-[var(--pc-border)]" />

                            <button
                              onClick={() => {
                                setProfileOpen(false);
                                onLogout?.();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors rounded-xl cursor-pointer text-red-500"
                              style={{ fontSize: "14px" }}
                            >
                              <LogOut size={15} className="flex-shrink-0" />
                              Se déconnecter
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onNavigate?.("login")}
                    className="hidden sm:flex items-center border border-[var(--pc-primary)] text-[var(--pc-primary)] hover:bg-[var(--pc-primary-light)] px-4 py-2 rounded-xl font-semibold transition-all duration-200"
                    style={{ fontSize: "13px" }}
                  >
                    connexion
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onNavigate?.("register")}
                    className="hidden sm:flex gradient-btn items-center text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-[var(--pc-primary)]/30 touch-manipulation"
                    style={{ fontSize: "13px" }}
                  >
                    S'inscrire
                  </motion.button>
                </>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--pc-border)] dark:border-[var(--pc-border)] glass-card transition-colors"
              >
                <Menu
                  size={20}
                  className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
                />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              style={{ backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className={`fixed ${isRtl ? "right-0" : "left-0"} top-0 bottom-0 w-[82vw] max-w-sm z-[70] flex flex-col shadow-2xl`}
              style={{
                background: "var(--pc-surface)",
                backdropFilter: "blur(24px)",
              }}
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--pc-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐾</span>
                  <span
                    className="font-black text-[var(--pc-primary)]"
                    style={{ fontFamily: "Sora, sans-serif", fontSize: "18px" }}
                  >
                    Animali<span className="text-[var(--pc-accent)]">.tn</span>
                  </span>
                </div>
                <motion.button
                  whileTap={{ rotate: 90, scale: 0.9 }}
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <X size={20} className="text-[var(--pc-text-primary)]" />
                </motion.button>
              </div>

              {/* Logged-in user info in drawer */}
              {isLoggedIn && currentUser && (
                <div className="px-5 py-4 border-b border-[var(--pc-border)] flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--pc-primary) 0%, #10b981 100%)",
                        fontSize: "13px",
                      }}
                    >
                      {getInitials(currentUser.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p
                      className="font-bold text-[var(--pc-text-primary)] truncate"
                      style={{ fontSize: "14px" }}
                    >
                      {currentUser.name}
                    </p>
                    <p
                      className="text-[var(--pc-text-secondary)] truncate"
                      style={{ fontSize: "12px" }}
                    >
                      {currentUser.role}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigate?.("messages");
                      }}
                      className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
                    >
                      <MessageCircle
                        size={16}
                        className="text-[var(--pc-text-secondary)]"
                      />
                      {MESSAGE_COUNT > 0 && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                          style={{ fontSize: "8px" }}
                        >
                          {MESSAGE_COUNT}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigate?.("notifications");
                      }}
                      className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--pc-surface-alt)] transition-colors"
                    >
                      <Bell
                        size={16}
                        className="text-[var(--pc-text-secondary)]"
                      />
                      {NOTIFICATION_COUNT > 0 && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                          style={{ fontSize: "8px" }}
                        >
                          {NOTIFICATION_COUNT}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.key}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 300,
                    }}
                    onClick={() => {
                      setDrawerOpen(false);
                      onNavigate?.(link.page);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-[var(--pc-primary-light)] dark:hover:bg-[var(--pc-primary-light)]/20 active:scale-98 transition-all duration-200 touch-manipulation group"
                  >
                    <div
                      className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <span className="text-xl">{link.emoji}</span>
                      <p
                        className="font-semibold text-[var(--pc-text-primary)] group-hover:text-[var(--pc-primary)]"
                        style={{ fontSize: "15px" }}
                      >
                        {t(`nav.${link.key}`)}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-[var(--pc-text-secondary)] group-hover:text-[var(--pc-primary)] transition-colors ${isRtl ? "rotate-180" : ""}`}
                    />
                  </motion.button>
                ))}

                {/* Profile quick links when logged in */}
                {isLoggedIn && (
                  <>
                    <div className="my-2 border-t border-[var(--pc-border)]" />
                    {profileMenuItems.map((item) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                          setDrawerOpen(false);
                          item.action();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[var(--pc-primary-light)] dark:hover:bg-[var(--pc-primary-light)]/20 transition-all duration-200 touch-manipulation group"
                      >
                        <item.icon
                          size={18}
                          className="text-[var(--pc-text-secondary)] group-hover:text-[var(--pc-primary)] transition-colors flex-shrink-0"
                        />
                        <p
                          className="font-semibold text-[var(--pc-text-primary)] group-hover:text-[var(--pc-primary)]"
                          style={{ fontSize: "15px" }}
                        >
                          {item.label}
                        </p>
                      </motion.button>
                    ))}
                  </>
                )}
              </nav>

              <div className="p-4 space-y-2.5 border-t border-[var(--pc-border)]">
                <div className="flex justify-center mb-3">
                  <LangSelector direction="up" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setDrawerOpen(false);
                    onNavigate?.("create-listing");
                  }}
                  className="gradient-btn w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[var(--pc-primary)]/25 touch-manipulation"
                  style={{ fontSize: "15px" }}
                >
                  <PlusCircle size={18} />
                  {t("nav.publishAd")}
                </motion.button>
                {isLoggedIn ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setDrawerOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 font-semibold py-3.5 rounded-2xl touch-manipulation hover:bg-red-500/20 transition-colors"
                    style={{ fontSize: "14px" }}
                  >
                    <LogOut size={16} />
                    Se déconnecter
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigate?.("login");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] text-[var(--pc-text-primary)] font-semibold py-3.5 rounded-2xl touch-manipulation hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] transition-colors"
                      style={{ fontSize: "14px" }}
                    >
                      <User size={16} />
                      {t("nav.login")}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setDrawerOpen(false);
                        onNavigate?.("register");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 gradient-btn text-white font-bold py-3.5 rounded-2xl touch-manipulation"
                      style={{ fontSize: "14px" }}
                    >
                      S'inscrire
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pb-6 pt-2">
                <Sparkles size={13} className="text-[var(--pc-accent)]" />
                <span
                  className="text-[var(--pc-text-secondary)]"
                  style={{ fontSize: "11px" }}
                >
                  {t("nav.madeWith")}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
