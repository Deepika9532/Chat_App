"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConversationItem } from "./ConversationItem";
import { Skeleton } from "@/components/ui/skeleton";

interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 bg-muted"
          />
        </div>
      </div>

      <div className="space-y-1 p-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              id={conversation.id}
              name={conversation.name}
              avatarUrl={conversation.avatarUrl}
              lastMessage={conversation.lastMessage}
              lastMessageTime={conversation.lastMessageTime}
              unreadCount={conversation.unreadCount}
              isOnline={conversation.isOnline}
              isSelected={conversation.id === selectedId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
