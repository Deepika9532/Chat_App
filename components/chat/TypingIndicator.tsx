"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  userName?: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 px-3 py-2 bg-muted rounded-lg">
        <span
          className={cn(
            "h-2 w-2 bg-foreground/60 rounded-full animate-bounce",
            "[animation-delay:-0.3s]"
          )}
        />
        <span
          className={cn(
            "h-2 w-2 bg-foreground/60 rounded-full animate-bounce",
            "[animation-delay:-0.15s]"
          )}
        />
        <span className="h-2 w-2 bg-foreground/60 rounded-full animate-bounce" />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground">{userName} is typing...</span>
      )}
    </div>
  );
}
