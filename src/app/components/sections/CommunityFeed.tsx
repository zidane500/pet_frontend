import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { CommunityPostCard, type CommunityPost } from '../CommunityPostCard';
import { useTranslation } from 'react-i18next';

const POSTS: CommunityPost[] = [
  { id: 'p1', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=350&fit=crop', caption: 'Mon Max adore se promener au bord du lac de Tunis ! 🌊🐕', likes: 147, comments: 23, author: 'SaraaTN', authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=50&h=50&fit=crop', rotation: -1.5 },
  { id: 'p2', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=250&fit=crop', caption: 'Luna découvre le jardin pour la première fois 🐱🌿', likes: 89, comments: 12, author: 'AhmedSfax', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop', rotation: 1 },
  { id: 'p3', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=400&fit=crop', caption: 'Kakapo mon perroquet qui apprend à dire "Tunis" 😂🦜', likes: 312, comments: 45, author: 'MarwaSousse', authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop', rotation: -2 },
  { id: 'p4', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&h=280&fit=crop', caption: 'Bienvenue à la famille SnowBall ! Adopté il y a 2 jours 🐰💕', likes: 203, comments: 31, author: 'InesMonastir', authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop', rotation: 1.5 },
  { id: 'p5', image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=320&fit=crop', caption: 'Première visite chez le vétérinaire, tout va bien ! Merci Dr. Trabelsi 🏥', likes: 76, comments: 8, author: 'RimBizerte', authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=50&h=50&fit=crop', rotation: -1 },
  { id: 'p6', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=260&fit=crop', caption: 'Rex et Mimi, les meilleurs amis du monde 🐕🐱❤️', likes: 421, comments: 67, author: 'KhaledNabeul', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop', rotation: 2 },
];

export function CommunityFeed({ onOpenFeed }: { onOpenFeed?: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--pc-surface-alt)] dark:bg-[#060C12]" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-700/40 px-5 py-2 rounded-full mb-5"
          >
            <span className="font-bold uppercase tracking-wider" style={{ fontSize: '12px' }}>{t('community.badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800 }}
            className="text-[var(--pc-text-primary)] dark:text-[var(--pc-text-primary)]"
          >
            {t('community.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--pc-text-secondary)] mt-3"
            style={{ fontSize: '15px' }}
          >
            {t('community.subtitle')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <ResponsiveMasonry columnsCountBreakPoints={{ 320: 2, 640: 3, 1024: 3 }}>
            <Masonry gutter="12px">
              {POSTS.map((post, i) => (
                <CommunityPostCard key={post.id} post={post} index={i} />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenFeed}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-purple-600/35 transition-all duration-300 touch-manipulation"
            style={{ fontSize: '15px' }}
          >
            {t('community.seeAll')} <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
