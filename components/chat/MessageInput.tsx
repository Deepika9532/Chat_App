"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Smile, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
      onStopTyping?.();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    
    if (value.trim()) {
      onTyping?.();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 2000);
    } else {
      onStopTyping?.();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background">
      <Button variant="ghost" size="icon" disabled={disabled}>
        <Paperclip className="h-5 w-5" />
      </Button>

      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10 py-6"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          disabled={disabled || !message.trim()}
        >
          <Smile className="h-5 w-5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        disabled={disabled || !message.trim()}
      >
        <Mic className="h-5 w-5" />
      </Button>

      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="icon"
        className={cn(
          "transition-colors",
          message.trim() ? "bg-primary text-primary-foreground" : ""
        )}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
