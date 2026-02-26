"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  src,
  alt,
  name,
  isOnline,
  size = "md",
  className,
}: UserAvatarProps) {
  const getInitials = (name?: string) => {
    if (!name || name.trim().length === 0) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const onlineIndicatorSize = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={alt || name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full border-2 border-background",
            onlineIndicatorSize[size],
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}
