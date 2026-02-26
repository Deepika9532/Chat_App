"use client";

import { MoreVertical, Phone, Video, Search } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
}

export function ChatHeader({
  name,
  avatarUrl,
  isOnline,
  isTyping,
  onVideoCall,
  onVoiceCall,
  onSearch,
  onMore,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={avatarUrl}
          name={name}
          isOnline={isOnline}
          size="md"
        />
        <div className="flex flex-col">
          <h2 className="font-semibold text-sm">{name}</h2>
          <span className="text-xs text-muted-foreground">
            {isTyping ? (
              <span className="text-primary">typing...</span>
            ) : isOnline ? (
              "Online"
            ) : (
              "Offline"
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onVoiceCall}>
              <Phone className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Voice call</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Video call</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onMore}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>More</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
