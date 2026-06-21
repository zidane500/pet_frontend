import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Search,
  Send,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  useConversation,
  useConversations,
  useSendMessage,
} from "../../hooks/useMessages";
import type { ConversationSummary, Message, User } from "../../types";

interface MessagingPageProps {
  onBack: () => void;
  initialUserId?: string;
  initialListingId?: string;
  initialPartnerName?: string;
  initialPartnerAvatar?: string;
}

type ConversationPartner = Pick<User, "id" | "name" | "avatar" | "is_verified">;

const MAX_MESSAGE_LENGTH = 2000;

function parsePositiveInt(value?: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getInitials(name?: string | null): string {
  return (name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fallbackAvatarSeed(id?: number | string | null): string {
  return `https://picsum.photos/seed/user-${encodeURIComponent(String(id ?? "avatar"))}/96/96`;
}

function formatRelative(date?: string | null): string {
  if (!date) return "";
  const time = new Date(date).getTime();
  if (!Number.isFinite(time)) return "";

  const diff = Math.max(0, Date.now() - time);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}

function messageTime(date?: string | null): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({
  user,
  size = "md",
}: {
  user?: Partial<User> | null;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const classes = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  const src = user?.avatar || fallbackAvatarSeed(user?.id);
  const name = user?.name || "Utilisateur";

  return (
    <div
      className={`${classes} rounded-full overflow-hidden flex-shrink-0 bg-[var(--pc-primary)] text-white flex items-center justify-center font-bold`}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onClick,
  isRtl,
}: {
  conversation: ConversationSummary;
  active: boolean;
  onClick: () => void;
  isRtl: boolean;
}) {
  const partner = conversation.partner;
  const last = conversation.last_message;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors ${
        active
          ? "bg-[var(--pc-primary)]/10 border-[var(--pc-primary)]"
          : "border-transparent hover:bg-[var(--pc-surface-alt)]"
      } ${isRtl ? "flex-row-reverse text-right border-l-0 border-r-2" : ""}`}
    >
      <Avatar user={partner} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-bold text-[var(--pc-text-primary)] text-sm">
            {partner.name}
          </p>
          <span className="text-xs text-[var(--pc-text-secondary)] flex-shrink-0">
            {formatRelative(last.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`truncate text-xs ${conversation.unread_count > 0 ? "font-semibold text-[var(--pc-text-primary)]" : "text-[var(--pc-text-secondary)]"}`}
          >
            {last.content}
          </p>
          {conversation.unread_count > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-[var(--pc-primary)] text-white text-[10px] font-bold flex items-center justify-center">
              {Math.min(conversation.unread_count, 99)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyPanel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="w-16 h-16 rounded-full bg-[var(--pc-primary)]/10 flex items-center justify-center mb-4">
        <MessageCircle className="text-[var(--pc-primary)]" size={28} />
      </div>
      <p className="font-bold text-[var(--pc-text-primary)]">{label}</p>
      {hint && (
        <p className="mt-1 max-w-sm text-xs text-[var(--pc-text-secondary)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function ChatBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMine
            ? "bg-[var(--pc-primary)] text-white rounded-br-md"
            : "bg-[var(--pc-surface-alt)] text-[var(--pc-text-primary)] rounded-bl-md"
        }`}
      >
        {message.listing?.title && (
          <p
            className={`mb-1 text-[10px] font-semibold ${isMine ? "text-white/75" : "text-[var(--pc-primary)]"}`}
          >
            Annonce : {message.listing.title}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p
          className={`text-[10px] mt-1 ${isMine ? "text-white/75" : "text-[var(--pc-text-secondary)]"}`}
        >
          {messageTime(message.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

export function MessagingPage({
  onBack,
  initialUserId,
  initialListingId,
  initialPartnerName,
  initialPartnerAvatar,
}: MessagingPageProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [showMobileConversationList, setShowMobileConversationList] =
    useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const initialTargetUserId = useMemo(
    () => parsePositiveInt(initialUserId),
    [initialUserId],
  );
  const initialTargetListingId = useMemo(
    () => parsePositiveInt(initialListingId),
    [initialListingId],
  );

  const initialPartner = useMemo<ConversationPartner | null>(() => {
    if (!initialTargetUserId) return null;

    return {
      id: initialTargetUserId,
      name: initialPartnerName?.trim() || "Vendeur",
      avatar: initialPartnerAvatar?.trim() || null,
      is_verified: false,
    };
  }, [initialPartnerAvatar, initialPartnerName, initialTargetUserId]);

  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data ?? [];

  useEffect(() => {
    if (initialTargetUserId && initialTargetUserId !== user?.id) {
      setActiveUserId(initialTargetUserId);
      return;
    }

    if (!activeUserId && conversations.length > 0) {
      setActiveUserId(conversations[0].partner.id);
    }
  }, [activeUserId, conversations, initialTargetUserId, user?.id]);

  const conversationsForList = useMemo<ConversationSummary[]>(() => {
    if (!initialPartner) return conversations;
    if (
      conversations.some(
        (conversation) => conversation.partner.id === initialPartner.id,
      )
    ) {
      return conversations;
    }

    const draftConversation: ConversationSummary = {
      partner: initialPartner,
      last_message: {
        id: 0,
        sender_id: user?.id ?? 0,
        receiver_id: initialPartner.id,
        listing_id: initialTargetListingId,
        content: "Nouvelle conversation",
        is_read: true,
        created_at: new Date().toISOString(),
        sender: user
          ? { id: user.id, name: user.name, avatar: user.avatar ?? null }
          : undefined,
        receiver: {
          id: initialPartner.id,
          name: initialPartner.name,
          avatar: initialPartner.avatar ?? null,
        },
      },
      unread_count: 0,
    };

    return [draftConversation, ...conversations];
  }, [conversations, initialPartner, initialTargetListingId, user]);

  const activeConversation =
    conversationsForList.find((c) => c.partner.id === activeUserId) ?? null;
  const activePartner = activeConversation?.partner ?? null;
  const shouldShowConversationListOnMobile =
    showMobileConversationList || !activePartner;
  const conversationQuery = useConversation(activeUserId);
  const sendMessage = useSendMessage();

  const messages = conversationQuery.data ?? [];
  const isSelfConversation = Boolean(
    activeUserId && user?.id && Number(activeUserId) === Number(user.id),
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeUserId]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversationsForList;

    return conversationsForList.filter((conversation) => {
      const name = conversation.partner.name.toLowerCase();
      const content = conversation.last_message.content.toLowerCase();
      return name.includes(q) || content.includes(q);
    });
  }, [conversationsForList, search]);

  const submit = async () => {
    const content = draft.trim();
    if (
      !activeUserId ||
      isSelfConversation ||
      !content ||
      content.length > MAX_MESSAGE_LENGTH ||
      sendMessage.isPending
    ) {
      return;
    }

    await sendMessage.mutateAsync({
      receiver_id: activeUserId,
      listing_id: initialTargetListingId,
      content,
    });
    setDraft("");
  };

  return (
    <div
      className="h-screen overflow-hidden bg-[var(--pc-surface-alt)] dark:bg-[#060C12] flex flex-col"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <header className="flex-shrink-0 z-30 bg-[var(--pc-surface)]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-b border-[var(--pc-border)]">
        <div
          className={`flex items-center gap-3 px-4 py-3.5 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-[var(--pc-border)] flex items-center justify-center hover:bg-[var(--pc-surface-alt)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={18} className={isRtl ? "rotate-180" : ""} />
          </button>
          <h1 className="font-black text-lg text-[var(--pc-text-primary)] flex-1">
            Messages
          </h1>
          {conversationsQuery.isFetching && (
            <Loader2
              size={17}
              className="animate-spin text-[var(--pc-primary)]"
            />
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto p-3 sm:p-4">
        <div className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[340px_1fr] bg-[var(--pc-surface)] dark:bg-[#0D1117] rounded-3xl overflow-hidden border border-[var(--pc-border)] shadow-sm">
          <aside
            className={`min-h-0 border-[var(--pc-border)] ${
              shouldShowConversationListOnMobile ? "flex" : "hidden"
            } md:flex flex-col ${isRtl ? "md:border-l" : "md:border-r"}`}
          >
            <div className="flex-shrink-0 p-4 border-b border-[var(--pc-border)]">
              <div className="relative">
                <Search
                  size={15}
                  className={`absolute top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] ${isRtl ? "right-3" : "left-3"}`}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value.slice(0, 80))}
                  className={`w-full rounded-full bg-[var(--pc-surface-alt)] border border-[var(--pc-border)] py-2 text-sm text-[var(--pc-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/30 ${isRtl ? "pr-9 pl-9 text-right" : "pl-9 pr-9"}`}
                  placeholder="Rechercher une conversation"
                  autoComplete="off"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className={`absolute top-1/2 -translate-y-1/2 text-[var(--pc-text-secondary)] ${isRtl ? "left-3" : "right-3"}`}
                    aria-label="Effacer la recherche"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pc-scrollbar">
              {conversationsQuery.isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl bg-[var(--pc-surface-alt)] animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <EmptyPanel label="Aucune conversation" />
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.partner.id}
                    conversation={conversation}
                    active={conversation.partner.id === activeUserId}
                    onClick={() => {
                      setActiveUserId(conversation.partner.id);
                      setShowMobileConversationList(false);
                    }}
                    isRtl={isRtl}
                  />
                ))
              )}
            </div>
          </aside>

          <section
            className={`${
              shouldShowConversationListOnMobile ? "hidden" : "flex"
            } md:flex flex-col min-w-0 min-h-0`}
          >
            {!activePartner ? (
              <EmptyPanel label="Sélectionnez une conversation" />
            ) : (
              <>
                <div
                  className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--pc-border)] ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setShowMobileConversationList(true)}
                    className="md:hidden w-8 h-8 rounded-full border border-[var(--pc-border)] flex items-center justify-center"
                    aria-label="Retour aux conversations"
                  >
                    <ArrowLeft
                      size={16}
                      className={isRtl ? "rotate-180" : ""}
                    />
                  </button>
                  <Avatar user={activePartner} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[var(--pc-text-primary)] truncate">
                      {activePartner.name}
                    </p>
                    <p className="text-xs text-[var(--pc-text-secondary)]">
                      {initialTargetListingId
                        ? "Conversation liée à une annonce"
                        : "Conversation privée"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 pc-scrollbar scroll-smooth">
                  {conversationQuery.isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 rounded-2xl bg-[var(--pc-surface-alt)] animate-pulse ${i % 2 ? "ml-auto w-2/3" : "w-3/4"}`}
                        />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyPanel
                      label="Aucun message pour le moment"
                      hint="Écrivez le premier message pour démarrer la conversation."
                    />
                  ) : (
                    messages.map((message) => (
                      <ChatBubble
                        key={message.id}
                        message={message}
                        isMine={message.sender_id === user?.id}
                      />
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {isSelfConversation && (
                  <div className="px-4 pb-2 text-xs text-amber-600">
                    Vous ne pouvez pas vous envoyer un message à vous-même.
                  </div>
                )}

                {sendMessage.error && (
                  <div className="px-4 pb-2 text-xs text-red-500">
                    Impossible d’envoyer le message. Vérifiez le contenu et
                    réessayez.
                  </div>
                )}

                <div className="flex-shrink-0 p-3 border-t border-[var(--pc-border)]">
                  <div
                    className={`flex items-end gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <textarea
                      value={draft}
                      onChange={(e) =>
                        setDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void submit();
                        }
                      }}
                      rows={1}
                      className="flex-1 max-h-32 rounded-2xl border border-[var(--pc-border)] bg-[var(--pc-surface-alt)] px-4 py-2.5 text-sm text-[var(--pc-text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--pc-primary)]/30"
                      placeholder="Écrire un message…"
                      disabled={isSelfConversation}
                    />
                    <button
                      type="button"
                      onClick={() => void submit()}
                      disabled={
                        !draft.trim() ||
                        draft.length > MAX_MESSAGE_LENGTH ||
                        sendMessage.isPending ||
                        isSelfConversation
                      }
                      className="w-11 h-11 rounded-2xl bg-[var(--pc-primary)] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Envoyer"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                  <p
                    className={`mt-1 text-[10px] ${draft.length >= MAX_MESSAGE_LENGTH ? "text-red-500" : "text-[var(--pc-text-secondary)]"}`}
                  >
                    {draft.length}/{MAX_MESSAGE_LENGTH}
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
