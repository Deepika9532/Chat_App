"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Users } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface Conversation {
  _id: Id<"conversations">;
  displayName?: string;
  displayImage?: string;
  lastMessage?: { content: string; _creationTime: number } | null;
  unreadCount: number;
  isGroup: boolean;
  members: Id<"users">[];
  isOnline?: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const { displayName, displayImage, lastMessage, unreadCount, isGroup, isOnline } = conversation;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
        hover:bg-muted ${isSelected ? "bg-muted" : ""}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {isGroup ? (
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
        ) : displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
            <span className="text-lg font-medium">
              {displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
        )}

        {/* Online indicator */}
        {!isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full
                           bg-green-500 border-2 border-background" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{displayName ?? "Unknown"}</p>
          {lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatTimestamp(lastMessage._creationTime)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {lastMessage?.content ?? "No messages yet"}
        </p>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="flex-shrink-0 bg-primary text-primary-foreground
                         text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: Id<"conversations">;
  onSelectConversation: (id: Id<"conversations">) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          isSelected={conversation._id === selectedConversationId}
          onClick={() => onSelectConversation(conversation._id)}
        />
      ))}
    </div>
  );
}