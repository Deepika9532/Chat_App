"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { cn, truncateText, formatRelativeTime } from "@/lib/utils";

interface ConversationItemProps {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  id,
  name,
  avatarUrl,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isOnline,
  isSelected,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
        isSelected
          ? "bg-accent"
          : "hover:bg-muted"
      )}
    >
      <UserAvatar
        src={avatarUrl}
        name={name}
        isOnline={isOnline}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn(
            "font-medium truncate",
            unreadCount > 0 && "font-semibold"
          )}>
            {name}
          </span>
          {lastMessageTime && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className={cn(
            "text-sm text-muted-foreground truncate",
            unreadCount > 0 && "text-foreground font-medium"
          )}>
            {lastMessage || "No messages yet"}
          </span>
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
