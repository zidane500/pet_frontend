import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle,
  Facebook, Instagram, MessageCircle, ChevronRight,
} from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: <Mail size={20} />,
    title: 'Email',
    value: 'support@animali.tn',
    color: '#1D7D5F',
  },
  {
    icon: <Phone size={20} />,
    title: 'Téléphone',
    value: '+216 71 123 456',
    color: '#10b981',
  },
  {
    icon: <MapPin size={20} />,
    title: 'Adresse',
    value: 'Tunis, Tunisie',
    color: '#f43f5e',
  },
  {
    icon: <Clock size={20} />,
    title: 'Horaires',
    value: 'Lun-Ven 9h-18h',
    color: '#F4A732',
  },
];

const SOCIAL_LINKS = [
  { icon: <Facebook size={20} />, label: 'Facebook', color: '#1877f2', href: '#' },
  { icon: <Instagram size={20} />, label: 'Instagram', color: '#e1306c', href: '#' },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.27 8.27 0 004.84 1.55V7.06a4.84 4.84 0 01-1.07-.37z" />
      </svg>
    ),
    label: 'TikTok',
    color: '#010101',
    href: '#',
  },
  { icon: <MessageCircle size={20} />, label: 'WhatsApp', color: '#25d366', href: '#' },
];

const SUBJECTS = [
  'Achat',
  'Adoption',
  'Problème technique',
  'Signalement',
  'Partenariat',
  'Autre',
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function ContactPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] text-sm text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40 transition-all';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[var(--pc-surface)] pb-24">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-8"
        style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
      >
        <button
          onClick={onBack}
          className="mb-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">Contactez-nous</h1>
        <p className="text-white/80 text-sm">
          Notre équipe vous répond sous 24h. N'hésitez pas à nous écrire !
        </p>
      </div>

      <div className="px-4 -mt-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Left column — Contact info */}
          <div className="space-y-4 pt-4">
            {/* Contact cards */}
            <div className="grid grid-cols-2 gap-3">
              {CONTACT_INFO.map((info, i) => (
                <div key={i} className="glass-card p-4 rounded-2xl">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2"
                    style={{ background: info.color }}
                  >
                    {info.icon}
                  </div>
                  <div className="text-xs font-semibold text-[var(--pc-text-secondary)] mb-0.5">
                    {info.title}
                  </div>
                  <div className="text-sm font-medium text-[var(--pc-text-primary)]">{info.value}</div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="glass-card p-4 rounded-2xl">
              <h3 className="font-semibold text-sm text-[var(--pc-text-primary)] mb-3">
                Réseaux sociaux
              </h3>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                    style={{ background: social.color }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ shortcut */}
            <button
              onClick={() => onNavigate('faq')}
              className="glass-card p-4 rounded-2xl w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--pc-primary)' }}
                >
                  <span className="text-white text-lg">❓</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-[var(--pc-text-primary)]">
                    Consultez notre FAQ
                  </div>
                  <div className="text-xs text-[var(--pc-text-secondary)]">
                    Trouvez rapidement votre réponse
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--pc-text-secondary)] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right column — Contact form */}
          <div className="glass-card p-5 rounded-2xl">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <h2 className="font-bold text-[var(--pc-text-primary)] mb-4">Envoyer un message</h2>

                  {/* First + Last name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        placeholder="Votre prénom"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        placeholder="Votre nom"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="votre@email.com"
                      className={inputCls}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+216 XX XXX XXX"
                      className={inputCls}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                      Sujet *
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => updateField('subject', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Sélectionnez un sujet</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pc-text-secondary)] mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => updateField('message', e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                      rows={5}
                      style={{ minHeight: '150px' }}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                    style={{ background: 'linear-gradient(135deg, var(--pc-primary), #15634a)' }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'var(--pc-primary)' }}
                  >
                    <CheckCircle size={40} className="text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[var(--pc-text-primary)] mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-sm text-[var(--pc-text-secondary)] mb-6">
                    Nous vous répondrons sous 24h. Merci de nous avoir contactés.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-2xl border border-[var(--pc-border)] text-sm font-medium text-[var(--pc-text-primary)]"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
