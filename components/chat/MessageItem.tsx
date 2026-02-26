"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn, formatTime } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import Image from "next/image";

interface MessageItemProps {
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

export function MessageItem({
  content,
  senderName,
  senderAvatar,
  senderIsOnline,
  createdAt,
  isCurrentUser,
  isRead,
  attachments,
}: MessageItemProps) {
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%]",
        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isCurrentUser && (
        <UserAvatar
          src={senderAvatar}
          name={senderName}
          isOnline={senderIsOnline}
          size="sm"
          className="mt-auto"
        />
      )}

      <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
        {!isCurrentUser && senderName && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {senderName}
          </span>
        )}

        <div
          className={cn(
            "rounded-lg px-3 py-2",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {attachments && attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.type === "image" ? (
                    <Image
                      src={attachment.url}
                      alt={attachment.name}
                      width={200}
                      height={200}
                      className="rounded-md max-w-[200px] max-h-[200px] object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
                      <span className="text-sm truncate">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-1",
            isCurrentUser ? "flex-row-reverse" : ""
          )}
        >
          <span className="text-xs text-muted-foreground">
            {formatTime(createdAt)}
          </span>
          {isCurrentUser && (
            isRead ? (
              <CheckCheck className="h-3 w-3 text-primary" />
            ) : (
              <Check className="h-3 w-3 text-muted-foreground" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
