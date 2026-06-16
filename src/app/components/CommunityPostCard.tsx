import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export interface CommunityPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  author: string;
  authorAvatar: string;
  rotation?: number;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  index?: number;
}

export function CommunityPostCard({ post, index = 0 }: CommunityPostCardProps) {
  const [liked, setLiked] = useState(false);
  const rotation = post.rotation ?? (index % 2 === 0 ? -1.5 : 1.5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      style={{ rotate: rotation }}
      className="bg-[var(--pc-surface)] dark:bg-[var(--pc-surface)] rounded-2xl overflow-hidden border border-[var(--pc-border)] dark:border-[var(--pc-border)] cursor-pointer mb-3 transition-all duration-300"
    >
      <div className="relative">
        <img
          src={post.image}
          alt={post.caption}
          className="w-full object-cover"
          style={{ aspectRatio: '1/1' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/300/300`; }}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={post.authorAvatar}
            alt={post.author}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.author}/50/50`; }}
          />
          <span className="font-semibold truncate" style={{ fontSize: '12px', color: 'var(--pc-text-primary)' }}>{post.author}</span>
        </div>
        <p className="text-[var(--pc-text-secondary)] leading-snug" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.caption}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1 transition-colors"
            style={{ fontSize: '12px', color: liked ? '#ef4444' : 'var(--pc-text-secondary)' }}
          >
            <Heart size={13} fill={liked ? '#ef4444' : 'none'} />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <div className="flex items-center gap-1" style={{ fontSize: '12px', color: 'var(--pc-text-secondary)' }}>
            <MessageCircle size={13} />
            <span>{post.comments}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
