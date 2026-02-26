"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { formatTimestamp } from "@/lib/utils";

interface ChatAreaProps {
  conversationId: string;
  onBack: () => void;
}

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: number;
  isDeleted: boolean;
}

export function ChatArea({ conversationId, onBack }: ChatAreaProps) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial messages for demo
  useEffect(() => {
    if (conversationId) {
      setMessages([
        {
          _id: "1",
          senderId: "other",
          content: "Hey! Welcome to the chat app! 👋",
          createdAt: Date.now() - 60000,
          isDeleted: false,
        },
        {
          _id: "2",
          senderId: userId || "me",
          content: "Thanks! This is looking great!",
          createdAt: Date.now() - 30000,
          isDeleted: false,
        },
      ]);
    }
  }, [conversationId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      _id: Date.now().toString(),
      senderId: userId || "me",
      content: newMessage,
      createdAt: Date.now(),
      isDeleted: false,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-secondary rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-semibold">Chat</h2>
          <p className="text-xs text-muted-foreground">Demo Mode</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm mb-2">No messages yet</p>
              <p className="text-xs">Send a message to start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex gap-2 ${message.senderId === userId ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                  message.senderId === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                } ${message.isDeleted ? "italic opacity-60" : ""}`}
              >
                {message.isDeleted ? (
                  <span className="text-sm">This message was deleted</span>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-[10px] mt-1 block ${
                        message.senderId === userId
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTimestamp(message.createdAt)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>•</span>
            <span>•</span>
            <span>•</span>
            <span>User is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] px-4 py-2 bg-secondary border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
