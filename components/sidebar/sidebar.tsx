"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface SidebarProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export function Sidebar({ onSelectConversation, selectedConversationId }: SidebarProps) {
  const { userId } = useAuth();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [users] = useState<any[]>([]);
  const [conversations] = useState<any[]>([]);

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* User Search */}
      <div className="p-3">
        <button
          onClick={() => setShowUserSearch(!showUserSearch)}
          className="w-full px-3 py-2 text-sm text-muted-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-left"
        >
          {showUserSearch ? "← Back to conversations" : "🔍 Find users to message"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showUserSearch ? (
          <div className="p-3">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              {users.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No users found</p>
                  <p className="text-xs mt-2">Set up Convex to see users</p>
                </div>
              ) : (
                users.map((user: any) => (
                  <button
                    key={user._id}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {user.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                <div className="text-center">
                  <p className="text-sm mb-2">No conversations yet</p>
                  <p className="text-xs">Find a user to start messaging</p>
                </div>
              </div>
            ) : (
              conversations.map((conv: any) => (
                <button
                  key={conv._id}
                  onClick={() => onSelectConversation(conv._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedConversationId === conv._id
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {conv.type === "group" ? "G" : "D"}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">
                      {conv.type === "group" ? conv.name : "Direct Message"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
