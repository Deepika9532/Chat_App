"use client";

import { useRef, useEffect } from "react";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  senderIsOnline?: boolean;
  createdAt: Date | string;
  isCurrentUser: boolean;
  isRead?: boolean;
  attachments?: {
    type: "image" | "file";
    url: string;
    name: string;
    size: number;
  }[];
}

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  isLoading?: boolean;
  currentUserId: string;
  onScrollToBottom?: () => void;
  showNewMessagesBanner?: boolean;
  onNewMessagesClick?: () => void;
}

export function MessageList({
  messages,
  isTyping,
  isLoading,
  currentUserId,
  onScrollToBottom,
  showNewMessagesBanner = false,
  onNewMessagesClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoading]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 max-w-[80%]",
              i % 2 === 0 ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <div className="space-y-2">
              {i % 2 !== 0 && <Skeleton className="h-3 w-16" />}
              <Skeleton className="h-16 w-48 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          id={message.id}
          content={message.content}
          senderId={message.senderId}
          senderName={message.senderName}
          senderAvatar={message.senderAvatar}
          senderIsOnline={message.senderIsOnline}
          createdAt={message.createdAt}
          isCurrentUser={message.senderId === currentUserId}
          isRead={message.isRead}
          attachments={message.attachments}
        />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} />

      {showNewMessagesBanner && (
        <button
          onClick={onNewMessagesClick}
          className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg hover:bg-primary/90 transition-colors"
        >
          New messages
        </button>
      )}
    </div>
  );
}
