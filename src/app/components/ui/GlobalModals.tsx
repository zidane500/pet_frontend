import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'success';
  loading?: boolean;
}

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  contentType: 'listing' | 'post' | 'profile' | 'comment';
  loading?: boolean;
}

export interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ImageFullscreenProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    />
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

const VARIANT_CONFIG = {
  danger: {
    icon: '🗑️',
    bg: 'bg-red-100 dark:bg-red-900/30',
    btnClass: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: '⚠️',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    btnClass: 'bg-amber-500 hover:bg-amber-600',
  },
  success: {
    icon: '✅',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    btnClass: 'bg-emerald-500 hover:bg-emerald-600',
  },
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <AnimatePresence>
      {open && (
        <>
          <Overlay onClick={onClose} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-full ${cfg.bg} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                {cfg.icon}
              </div>

              {/* Text */}
              <h2 className="text-lg font-bold text-[var(--pc-text-primary)] text-center mb-2">{title}</h2>
              <p className="text-sm text-[var(--pc-text-secondary)] text-center mb-6 leading-relaxed">{message}</p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--pc-border)] text-[var(--pc-text-primary)] text-sm font-medium hover:bg-[var(--pc-surface-alt)] transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${cfg.btnClass}`}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── ShareModal ───────────────────────────────────────────────────────────────

export function ShareModal({ open, onClose, title, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareButtons = [
    {
      label: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
      ),
      bg: 'bg-[#25D366]',
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    },
    {
      label: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bg: 'bg-[#1877F2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: 'Twitter / X',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: 'bg-black',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: 'Email',
      icon: <Mail size={20} />,
      bg: 'bg-gray-500',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <Overlay onClick={onClose} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--pc-text-primary)]">Partager</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* URL Copy */}
              <div className="flex gap-2 mb-5">
                <input
                  readOnly
                  value={url}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] text-sm truncate focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--pc-primary)] text-white hover:bg-[var(--pc-primary)]/90'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-3">
                {shareButtons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity ${btn.bg}`}
                  >
                    {btn.icon}
                    <span>{btn.label}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── ReportModal ──────────────────────────────────────────────────────────────

const REPORT_REASONS = [
  'Contenu inapproprié',
  'Arnaque / Fraude',
  'Animal maltraité',
  'Fausses informations',
  'Spam',
  'Autre',
];

export function ReportModal({ open, onClose, onSubmit, loading = false }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, selectedReason === 'Autre' ? details : undefined);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Overlay onClick={onClose} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--pc-text-primary)]">Signaler ce contenu</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Reasons */}
              <div className="space-y-2 mb-4">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-[var(--pc-primary)] bg-[var(--pc-primary)]/5'
                        : 'border-[var(--pc-border)] hover:border-[var(--pc-primary)]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-[var(--pc-primary)]"
                    />
                    <span className={`text-sm font-medium ${selectedReason === reason ? 'text-[var(--pc-primary)]' : 'text-[var(--pc-text-primary)]'}`}>
                      {reason}
                    </span>
                  </label>
                ))}
              </div>

              {/* Details textarea for "Autre" */}
              <AnimatePresence>
                {selectedReason === 'Autre' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Décrivez le problème..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface)] text-[var(--pc-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/30 resize-none transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || loading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Envoyer le signalement
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────

export function SuccessModal({
  open,
  onClose,
  title,
  message,
  actionLabel,
  onAction,
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <Overlay onClick={onClose} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="glass-card rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Animated checkmark */}
              <motion.div
                className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-4xl mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
              >
                ✅
              </motion.div>

              <h2 className="text-xl font-bold text-[var(--pc-text-primary)] mb-2">{title}</h2>
              <p className="text-sm text-[var(--pc-text-secondary)] leading-relaxed mb-6">{message}</p>

              {actionLabel && onAction && (
                <button
                  onClick={onAction}
                  className="w-full py-3 rounded-xl text-white text-sm font-semibold mb-3 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15a870)' }}
                >
                  {actionLabel}
                </button>
              )}

              <button
                onClick={onClose}
                className="text-sm text-[var(--pc-text-secondary)] hover:text-[var(--pc-primary)] transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── ImageFullscreen ──────────────────────────────────────────────────────────

export function ImageFullscreen({ open, onClose, images, initialIndex = 0 }: ImageFullscreenProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    setCurrent(initialIndex);
  }, [initialIndex, open]);

  const prev = useCallback(() => {
    setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, prev, next, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {current + 1}/{images.length}
          </div>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center relative px-16">
            {/* Prev arrow */}
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={images[current]}
                alt={`Image ${current + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Next arrow */}
            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="shrink-0 flex gap-2 justify-center p-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === current ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
