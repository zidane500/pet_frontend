import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { VetCard, type Vet } from "../VetCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const GOVERNORATES = [
  "Tous",
  "Tunis",
  "Sfax",
  "Sousse",
  "Monastir",
  "Bizerte",
  "Nabeul",
  "Ariana",
];

const VETS: Vet[] = [
  {
    id: "v1",
    name: "Mehdi Trabelsi",
    specialty: "Chirurgie",
    rating: 4.9,
    reviews: 128,
    city: "Tunis, Les Berges du Lac",
    phone: "+216 71 234 567",
    emergency: true,
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "v2",
    name: "Sonia Ben Amor",
    specialty: "NAC & Exotiques",
    rating: 4.8,
    reviews: 96,
    city: "Sfax, Centre-ville",
    phone: "+216 74 321 456",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "v3",
    name: "Karim Gharbi",
    specialty: "Urgences 24h",
    rating: 4.7,
    reviews: 74,
    city: "Sousse, Khzama",
    phone: "+216 73 456 789",
    emergency: true,
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "v4",
    name: "Leila Chaabane",
    specialty: "Dermatologie",
    rating: 4.9,
    reviews: 112,
    city: "Ariana, Ettadhamen",
    phone: "+216 71 987 654",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
  },
];

export function VetDirectory() {
  const { t } = useTranslation();
  const [activeGov, setActiveGov] = useState("Tous");

  return (
    <section className="py-16 bg-white dark:bg-[var(--pc-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-[var(--pc-primary-light)] dark:bg-[var(--pc-primary-light)] text-[var(--pc-primary)] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-3"
            >
              {t("vets.badge")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 800,
              }}
              className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
            >
              {t("vets.title")}
            </motion.h2>
            <p
              className="text-[var(--pc-text-secondary)] mt-1"
              style={{ fontSize: "14px" }}
            >
              {t("vets.subtitle")}
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold flex-shrink-0"
            style={{ fontSize: "14px" }}
          >
            {t("vets.seeAll")} <ArrowRight size={16} />
          </button>
        </div>

        {/* Filter chips */}
        <div
          className="flex gap-2.5 overflow-x-auto pb-3 mb-8"
          style={{ scrollbarWidth: "none" }}
        >
          {GOVERNORATES.map((gov) => (
            <button
              key={gov}
              onClick={() => setActiveGov(gov)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border font-semibold transition-all duration-200 touch-manipulation ${
                activeGov === gov
                  ? "bg-[var(--pc-primary)] border-[var(--pc-primary)] text-white"
                  : "border-[var(--pc-border)] text-[var(--pc-text-secondary)] hover:border-[var(--pc-primary)] hover:text-[var(--pc-primary)]"
              }`}
              style={{ fontSize: "13px" }}
            >
              {gov === "Tous" ? t("vets.filterAll") : gov}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VETS.map((vet, i) => (
            <VetCard key={vet.id} vet={vet} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
