"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "w-full md:w-80" : "w-0"
        } transition-all duration-300 overflow-hidden`}
      >
        <div className="w-80 h-full flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>

          {/* Sidebar Content */}
          <Sidebar
            onSelectConversation={(id) => {
              setSelectedConversationId(id);
              if (window.innerWidth < 768) {
                setShowSidebar(false);
              }
            }}
            selectedConversationId={selectedConversationId}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 ${
          !showSidebar ? "w-full" : "hidden md:flex"
        }`}
      >
        {selectedConversationId ? (
          <ChatArea
            conversationId={selectedConversationId}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
