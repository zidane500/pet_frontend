import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "../lib/echo";
import type { ConversationSummary, Message } from "../types";

type RealtimeMessageEvent = {
  message: Message;
};

function partnerIdFor(message: Message, currentUserId: number): number {
  return message.sender_id === currentUserId
    ? message.receiver_id
    : message.sender_id;
}

function upsertMessage(
  oldMessages: Message[] | undefined,
  message: Message,
): Message[] | undefined {
  if (!oldMessages) return oldMessages;
  if (oldMessages.some((item) => item.id === message.id)) return oldMessages;

  return [...oldMessages, message].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

function touchConversation(
  oldConversations: ConversationSummary[] | undefined,
  message: Message,
  currentUserId: number,
): ConversationSummary[] | undefined {
  if (!oldConversations) return oldConversations;

  const partnerId = partnerIdFor(message, currentUserId);
  const index = oldConversations.findIndex(
    (item) => item.partner.id === partnerId,
  );

  if (index === -1) return oldConversations;

  const next = [...oldConversations];
  const existing = next[index];

  next[index] = {
    ...existing,
    last_message: message,
    unread_count:
      message.receiver_id === currentUserId && !message.is_read
        ? existing.unread_count + 1
        : existing.unread_count,
  };

  return next.sort(
    (a, b) =>
      new Date(b.last_message.created_at).getTime() -
      new Date(a.last_message.created_at).getTime(),
  );
}

export function useRealtimeUserChannel(userId?: number | null): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `user.${userId}`;
    const channel = echo.private(channelName);

    const onMessageSent = (event: RealtimeMessageEvent) => {
      const message = event.message;
      const partnerId = partnerIdFor(message, userId);

      queryClient.setQueryData<Message[]>(
        ["conversation", partnerId],
        (oldMessages) => upsertMessage(oldMessages, message),
      );

      queryClient.setQueryData<ConversationSummary[]>(
        ["conversations"],
        (oldConversations) =>
          touchConversation(oldConversations, message, userId),
      );

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    const onNotificationCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    channel.listen(".message.sent", onMessageSent);
    channel.listen(".notification.created", onNotificationCreated);

    return () => {
      channel.stopListening(".message.sent", onMessageSent);
      channel.stopListening(".notification.created", onNotificationCreated);
      echo.leave(channelName);
    };
  }, [queryClient, userId]);
}
