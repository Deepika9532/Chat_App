"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./ConversationList";
import { UserSearchDialog } from "./UserSearchDialog";
import { useAuth, UserButton, useUser } from "@clerk/nextjs";

interface SidebarProps {
  conversations: {
    id: string;
    name: string;
    avatarUrl?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    isOnline?: boolean;
  }[];
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation?: (conversationId: string) => void;
}

export function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: SidebarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  return (
    <div className="flex flex-col h-full w-80 border-r bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ConversationList
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={onSelectConversation}
      />

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user?.fullName || user?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UserSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onConversationCreated={onNewConversation}
      />
    </div>
  );
}