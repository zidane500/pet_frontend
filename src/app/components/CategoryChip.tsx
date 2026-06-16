import { motion } from 'motion/react';

interface CategoryChipProps {
  icon: string;
  label: string;
  arabicLabel?: string;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ icon, label, arabicLabel, active = false, onClick }: CategoryChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all duration-200 min-w-[72px] touch-manipulation ${
        active
          ? 'bg-[var(--pc-primary)] border-[var(--pc-primary)] text-white shadow-lg shadow-[var(--pc-primary)]/30'
          : 'bg-white dark:bg-[var(--pc-surface)] border-[var(--pc-border)] dark:border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)] hover:bg-[var(--pc-primary-light)]'
      }`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-[11px] font-semibold whitespace-nowrap leading-tight">{label}</span>
      {arabicLabel && (
        <span className="text-[9px] opacity-60 leading-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
          {arabicLabel}
        </span>
      )}
    </motion.button>
  );
}
