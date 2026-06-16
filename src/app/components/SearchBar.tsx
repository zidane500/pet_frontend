import { Search, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const GOVERNORATES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Bizerte', 'Nabeul', 'Zaghouan',
  'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Gafsa', 'Kasserine', 'Sidi Bouzid', 'Kairouan', 'Gabès',
  'Médenine', 'Tataouine', 'Tozeur', 'Kébili'
];

export function SearchBar() {
  const { t } = useTranslation();
  const [species, setSpecies] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [type, setType] = useState('');

  const speciesOptions = [
    t('search.options.dog'), t('search.options.cat'), t('search.options.rabbit'),
    t('search.options.bird'), t('search.options.reptile'), t('search.options.fish'),
    t('search.options.rodent'), t('search.options.other'),
  ];

  const typeOptions = [
    t('search.options.sale'), t('search.options.adoption'),
    t('search.options.lost'), t('search.options.found'),
  ];

  return (
    <div className="w-full bg-white dark:bg-[var(--pc-surface)] rounded-2xl shadow-xl border border-[var(--pc-border)] dark:border-[var(--pc-border)] overflow-visible">
      <div className="flex flex-col sm:flex-row">
        <SelectField
          icon="🐾"
          placeholder={t('search.species')}
          value={species}
          onChange={setSpecies}
          options={speciesOptions}
          className="border-b sm:border-b-0 sm:border-r border-[var(--pc-border)]"
        />
        <SelectField
          icon="📍"
          placeholder={t('search.governorate')}
          value={governorate}
          onChange={setGovernorate}
          options={GOVERNORATES}
          className="border-b sm:border-b-0 sm:border-r border-[var(--pc-border)]"
          scrollable
        />
        <SelectField
          icon="🏷️"
          placeholder={t('search.type')}
          value={type}
          onChange={setType}
          options={typeOptions}
        />
        <button className="flex items-center justify-center gap-2 bg-[var(--pc-accent)] hover:opacity-90 active:scale-95 text-white font-bold px-6 py-3 sm:py-0 transition-all duration-200 touch-manipulation rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl">
          <Search size={18} />
          <span>{t('search.searchBtn')}</span>
        </button>
      </div>
    </div>
  );
}

function SelectField({ icon, placeholder, value, onChange, options, className = '', scrollable = false, compact = false }: {
  icon: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
  scrollable?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isPlaceholder = !value;

  return (
    <div ref={ref} className={`relative flex-1 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 cursor-pointer focus:outline-none touch-manipulation ${compact ? 'px-3 py-3' : 'pl-3.5 pr-3 py-4'}`}
      >
        <span className={`flex-shrink-0 ${compact ? 'text-base' : 'text-lg'}`}>{icon}</span>
        <span
          className={`flex-1 text-left truncate ${isPlaceholder ? 'text-[var(--pc-text-secondary)]' : 'text-[var(--pc-text-primary)] font-semibold'}`}
          style={{ fontSize: compact ? '12px' : '14px' }}
        >
          {value || placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} className="text-[var(--pc-text-secondary)] flex-shrink-0" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 right-0 top-full mt-1 z-[200] rounded-xl overflow-hidden border border-[var(--pc-border)] dark:border-[var(--pc-border)] ${scrollable ? 'max-h-52 overflow-y-auto' : ''}`}
            style={{ background: 'var(--pc-surface)', boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }}
          >
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-3 transition-colors duration-150 ${
                !value ? 'bg-[var(--pc-primary)] text-white' : 'text-[var(--pc-text-secondary)] hover:bg-[var(--pc-surface-alt)] dark:hover:bg-[#1C2128]'
              }`}
              style={{ fontSize: '14px' }}
            >
              <span className="flex-1 text-left font-medium">{placeholder}</span>
              {!value && <Check size={13} />}
            </button>
            {options.map((opt) => {
              const isActive = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 transition-colors duration-150 ${
                    isActive ? 'bg-[var(--pc-primary)] text-white' : 'text-[var(--pc-text-primary)] hover:bg-[var(--pc-surface-alt)] dark:hover:bg-[#1C2128]'
                  }`}
                  style={{ fontSize: '14px' }}
                >
                  <span className="flex-1 text-left font-medium">{opt}</span>
                  {isActive && <Check size={13} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
