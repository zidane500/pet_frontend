import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  Edit,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  MessageCircle,
  Check,
  CheckCheck,
  X,
  Image,
  Mic,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MessagingPageProps {
  onBack: () => void;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  regarding: string;
}

interface Message {
  id: string;
  conv: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  date?: string;
  seen?: boolean;
  reactions?: Record<string, number>;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Ahmed Ben Salah',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    lastMessage: 'Bonjour, est-ce que Max est encore disponible ?',
    time: '2min',
    unread: 2,
    online: true,
    regarding: 'Max - Berger Allemand',
  },
  {
    id: 'c2',
    name: 'Dr. Sonia Ben Amor',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face',
    lastMessage: 'Oui bien sûr, je peux vous recevoir demain matin',
    time: '1h',
    unread: 0,
    online: false,
    regarding: 'Consultation',
  },
  {
    id: 'c3',
    name: 'Refuge Espoir Tunis',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face',
    lastMessage: "Merci pour votre intérêt pour l'adoption de Nala !",
    time: '3h',
    unread: 1,
    online: true,
    regarding: 'Adoption Nala',
  },
  {
    id: 'c4',
    name: 'Leila Chaabane',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b902?w=60&h=60&fit=crop&crop=face',
    lastMessage: 'Le prix est négociable, faites-moi une offre',
    time: '1j',
    unread: 0,
    online: false,
    regarding: 'Luna - Chatte',
  },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', conv: 'c1', from: 'them', text: 'Bonjour ! Je suis intéressé par Max', time: '09:15', date: "Aujourd'hui" },
  { id: 'm2', conv: 'c1', from: 'me', text: 'Bonjour ! Oui il est toujours disponible 😊', time: '09:18', seen: true },
  { id: 'm3', conv: 'c1', from: 'them', text: 'Est-ce que je peux venir le voir ce weekend ?', time: '09:20' },
  { id: 'm4', conv: 'c1', from: 'me', text: 'Bien sûr ! Samedi après-midi vous convient ?', time: '09:22', seen: true },
  { id: 'm5', conv: 'c1', from: 'them', text: 'Parfait, 15h00 à Tunis ?', time: '09:25' },
  { id: 'm6', conv: 'c1', from: 'them', text: 'Bonjour, est-ce que Max est encore disponible ?', time: '11:30', seen: false },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(name: string): string {
  const gradients = [
    'from-[#1D7D5F] to-[#2aad85]',
    'from-[#F4A732] to-[#f7c06a]',
    'from-[#7c3aed] to-[#a78bfa]',
    'from-[#db2777] to-[#f472b6]',
    'from-[#0284c7] to-[#38bdf8]',
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

interface AvatarProps {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

function Avatar({ src, name, size = 'md', online }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className="relative flex-shrink-0">
      {!imgError ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-semibold`}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-2 border-[var(--pc-surface)] ${
            online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
}

interface ConversationRowProps {
  conv: Conversation;
  isActive: boolean;
  isRtl: boolean;
  onClick: () => void;
}

function ConversationRow({ conv, isActive, isRtl, onClick }: ConversationRowProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
        isActive
          ? 'bg-[var(--pc-primary)]/10 border-l-2 border-[var(--pc-primary)]'
          : 'hover:bg-[var(--pc-surface-alt)] border-l-2 border-transparent'
      } ${isRtl ? 'flex-row-reverse text-right border-l-0 border-r-2' : ''}`}
    >
      <Avatar src={conv.avatar} name={conv.name} size="md" online={conv.online} />
      <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-semibold text-sm truncate text-[var(--pc-text-primary)] ${
              conv.unread > 0 ? 'font-bold' : ''
            }`}
          >
            {conv.name}
          </span>
          <span className="text-xs text-[var(--pc-text-secondary)] flex-shrink-0">{conv.time}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-[var(--pc-text-secondary)] truncate flex-1">{conv.lastMessage}</p>
          {conv.unread > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--pc-primary)] text-white text-xs flex items-center justify-center font-bold">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

interface ConversationListPanelProps {
  conversations: Conversation[];
  activeId: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelect: (id: string) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

function ConversationListPanel({
  conversations,
  activeId,
  searchQuery,
  setSearchQuery,
  onSelect,
  isRtl,
  t,
}: ConversationListPanelProps) {
  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-[var(--pc-border)]">
        <div className={`flex items-center justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-lg font-bold text-[var(--pc-text-primary)]">
            {t('messages.title')}
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-primary)] transition-colors"
            title={t('messages.newConversation')}
          >
            <Edit size={18} />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className={`absolute top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] pointer-events-none ${
              isRtl ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('messages.search')}
            className={`w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-full text-sm text-[var(--pc-text-primary)] placeholder:text-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40 py-2 ${
              isRtl ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] hover:text-[var(--pc-text-primary)] transition-colors ${
                isRtl ? 'left-3' : 'right-3'
              }`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-[var(--pc-text-secondary)] text-sm">
            {t('messages.noResults')}
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              isRtl={isRtl}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const REACTION_EMOJIS = ['😀', '❤️', '😂', '👍', '😮'];

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSend: (text: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onBack?: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

function ChatWindow({ conversation, messages, onSend, onReact, onBack, isRtl, t }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Simulate other person typing after user types
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setOtherTyping(true);
      setTimeout(() => setOtherTyping(false), 2500);
    }, 800);
  };

  const handleAttachment = () => alert('Fonctionnalité bientôt disponible');

  // Group messages by date
  type DateGroup = { date: string | null; msgs: Message[] };
  const grouped: DateGroup[] = [];
  let currentDate: string | null = null;
  let currentGroup: Message[] = [];

  messages.forEach((msg) => {
    const msgDate = msg.date ?? null;
    if (msgDate !== currentDate) {
      if (currentGroup.length > 0) {
        grouped.push({ date: currentDate, msgs: currentGroup });
      }
      currentDate = msgDate;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  });
  if (currentGroup.length > 0) {
    grouped.push({ date: currentDate, msgs: currentGroup });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div
        className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--pc-border)] bg-[var(--pc-surface)] ${
          isRtl ? 'flex-row-reverse' : ''
        }`}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] transition-colors flex-shrink-0 lg:hidden"
          >
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </button>
        )}
        <Avatar src={conversation.avatar} name={conversation.name} size="md" online={conversation.online} />
        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : ''}`}>
          <div className="font-semibold text-sm text-[var(--pc-text-primary)] truncate">{conversation.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--pc-text-secondary)]">
            {conversation.online ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">{t('messages.online')}</span>
              </>
            ) : (
              <span>En ligne il y a 5 min</span>
            )}
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] transition-colors flex-shrink-0">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Regarding Strip */}
      <div
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--pc-border)] text-xs ${
          isRtl ? 'flex-row-reverse text-right' : ''
        }`}
        style={{ backgroundColor: 'color-mix(in srgb, var(--pc-primary) 8%, transparent)' }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'color-mix(in srgb, var(--pc-primary) 20%, transparent)' }}
        >
          <MessageCircle size={12} style={{ color: 'var(--pc-primary)' }} />
        </div>
        <span className="font-medium truncate" style={{ color: 'var(--pc-primary)' }}>
          {t('messages.regarding')}: {conversation.regarding}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {grouped.map((group, gi) => (
          <div key={gi}>
            {/* Date Separator */}
            {group.date && (
              <div className={`flex items-center justify-center my-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex-1 h-px bg-[var(--pc-border)]" />
                <span className="mx-3 text-xs text-[var(--pc-text-secondary)] bg-[var(--pc-surface)] px-2 whitespace-nowrap">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-[var(--pc-border)]" />
              </div>
            )}

            {/* Messages in group */}
            {group.msgs.map((msg, mi) => {
              const isMe = msg.from === 'me';
              // In RTL, flip which side my/their messages appear
              const showOnRight = isRtl ? !isMe : isMe;
              const isLastMsg = gi === grouped.length - 1 && mi === group.msgs.length - 1;
              const reactions = msg.reactions ?? {};
              const hasReactions = Object.keys(reactions).length > 0;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 mb-2 group/msg ${showOnRight ? 'flex-row-reverse' : 'flex-row'}`}
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => setHoveredMsg(null)}
                >
                  {!showOnRight && (
                    <div className="flex-shrink-0 mb-1">
                      <Avatar src={conversation.avatar} name={conversation.name} size="sm" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[70%] relative ${showOnRight ? 'items-end' : 'items-start'}`}>
                    {/* Emoji reaction picker (on hover) */}
                    <AnimatePresence>
                      {hoveredMsg === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute -top-9 z-10 flex gap-1 glass-card rounded-full px-2 py-1 border border-[var(--pc-border)] shadow-lg ${showOnRight ? 'right-0' : 'left-0'}`}
                        >
                          {REACTION_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => onReact(msg.id, emoji)}
                              className="text-base hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className={`px-4 py-2.5 shadow-sm text-sm leading-relaxed break-words ${
                        isMe
                          ? 'text-white rounded-2xl rounded-tr-sm'
                          : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] rounded-2xl rounded-tl-sm'
                      }`}
                      style={isMe ? { backgroundColor: 'var(--pc-primary)' } : undefined}
                    >
                      {msg.text}
                    </div>

                    {/* Reaction counts below bubble */}
                    {hasReactions && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {Object.entries(reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => onReact(msg.id, emoji)}
                            className="flex items-center gap-0.5 bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-full px-1.5 py-0.5 text-xs hover:bg-[var(--pc-primary)]/10 transition-colors"
                          >
                            {emoji} <span className="text-[var(--pc-text-secondary)]">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1 mt-0.5 ${showOnRight ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <span className="text-[10px] text-[var(--pc-text-secondary)]">{msg.time}</span>
                      {isMe && isLastMsg && (
                        <span className={`flex items-center gap-0.5 text-[10px] ${showOnRight ? 'flex-row-reverse' : 'flex-row'}`}>
                          {msg.seen ? (
                            <>
                              <CheckCheck size={12} style={{ color: 'var(--pc-primary)' }} />
                              <span style={{ color: 'var(--pc-primary)' }}>{t('messages.seen')}</span>
                            </>
                          ) : (
                            <>
                              <Check size={12} className="text-[var(--pc-text-secondary)]" />
                              <span className="text-[var(--pc-text-secondary)]">Envoyé</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        {/* Typing indicator */}
        <AnimatePresence>
          {otherTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-end mb-2"
            >
              <img src={conversation.avatar} alt={conversation.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="bg-[var(--pc-surface-alt)] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--pc-text-secondary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--pc-text-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--pc-text-secondary)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className={`flex-shrink-0 border-t border-[var(--pc-border)] px-4 py-3 bg-[var(--pc-surface)]`}
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
      >
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button onClick={handleAttachment} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] transition-colors flex-shrink-0" title="Joindre un fichier">
            <Paperclip size={18} />
          </button>
          <button onClick={handleAttachment} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] transition-colors flex-shrink-0" title="Envoyer une image">
            <Image size={18} />
          </button>
          <button onClick={handleAttachment} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] transition-colors flex-shrink-0" title="Message vocal">
            <Mic size={18} />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t('messages.inputPlaceholder')}
              className={`w-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] rounded-full py-2.5 text-sm text-[var(--pc-text-primary)] placeholder:text-[var(--pc-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/40 transition-shadow ${
                isRtl ? 'pr-4 pl-10 text-right' : 'pl-4 pr-10'
              }`}
            />
            <button
              className={`absolute top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] hover:text-[var(--pc-accent)] transition-colors ${
                isRtl ? 'left-3' : 'right-3'
              }`}
            >
              <Smile size={18} />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-all ${
              inputValue.trim()
                ? 'text-white shadow-md hover:shadow-lg hover:opacity-90'
                : 'bg-[var(--pc-surface-alt)] text-[var(--pc-text-secondary)] cursor-not-allowed'
            }`}
            style={
              inputValue.trim()
                ? { background: 'linear-gradient(135deg, var(--pc-primary), #2aad85)' }
                : undefined
            }
          >
            <Send size={16} className={isRtl ? 'rotate-180' : ''} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'color-mix(in srgb, var(--pc-primary) 10%, transparent)' }}
      >
        <span className="text-5xl select-none">💬</span>
      </motion.div>
      <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">
        {t('messages.emptyTitle')}
      </h3>
      <p className="text-sm text-[var(--pc-text-secondary)] max-w-xs">
        {t('messages.emptySubtitle')}
      </p>
    </div>
  );
}

export function MessagingPage({ onBack }: MessagingPageProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const activeConversation = CONVERSATIONS.find((c) => c.id === activeConvId) ?? null;
  const activeMessages = messages.filter((m) => m.conv === activeConvId);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setMobileView('chat');
  };

  const handleMobileBack = () => {
    setMobileView('list');
  };

  const handleSend = (text: string) => {
    if (!activeConvId) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conv: activeConvId,
      from: 'me',
      text,
      time: timeStr,
      seen: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = { ...(m.reactions ?? {}) };
      reactions[emoji] = (reactions[emoji] ?? 0) + 1;
      return { ...m, reactions };
    }));
  };

  return (
    <div
      className="flex flex-col h-screen bg-[var(--pc-surface)]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Global Top Header */}
      <div
        className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--pc-border)] bg-[var(--pc-surface)] ${
          isRtl ? 'flex-row-reverse' : ''
        }`}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] transition-colors"
        >
          <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-base font-bold text-[var(--pc-text-primary)] flex-1">
          {t('messages.title')}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List Panel */}
        {/* Desktop: always visible as left sidebar (w-80) */}
        {/* Mobile: visible only when mobileView === 'list' */}
        <div
          className={`
            flex flex-col border-r border-[var(--pc-border)] bg-[var(--pc-surface)]
            lg:w-80 lg:flex-shrink-0 lg:block
            ${mobileView === 'list' ? 'flex-1' : 'hidden'}
            lg:!flex lg:!flex-col
          `}
        >
          <ConversationListPanel
            conversations={CONVERSATIONS}
            activeId={activeConvId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelect={handleSelectConversation}
            isRtl={isRtl}
            t={t}
          />
        </div>

        {/* Chat Window Panel */}
        {/* Desktop: always visible as flex-1 right side */}
        {/* Mobile: visible only when mobileView === 'chat' */}
        <div
          className={`
            flex flex-col bg-[var(--pc-surface)]
            lg:flex-1 lg:block
            ${mobileView === 'chat' ? 'flex-1' : 'hidden'}
            lg:!flex lg:!flex-col
          `}
        >
          <AnimatePresence mode="wait">
            {activeConversation ? (
              <motion.div
                key={activeConvId}
                initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 24 : -24 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex flex-col flex-1 h-full"
              >
                <ChatWindow
                  conversation={activeConversation}
                  messages={activeMessages}
                  onSend={handleSend}
                  onReact={handleReact}
                  onBack={handleMobileBack}
                  isRtl={isRtl}
                  t={t}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex"
              >
                <EmptyState t={t} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
