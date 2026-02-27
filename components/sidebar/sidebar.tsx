"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./ConversationList";
import { UserSearchDialog } from "./UserSearchDialog";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { useAuth, UserButton, useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

interface SidebarProps {
  conversations: {
    _id: Id<"conversations">;
    displayName?: string;
    displayImage?: string;
    lastMessage?: { content: string; _creationTime: number } | null;
    unreadCount: number;
    isGroup: boolean;
    members: Id<"users">[];
    isOnline?: boolean;
  }[];
  selectedConversationId?: Id<"conversations">;
  onSelectConversation: (id: Id<"conversations">) => void;
  onNewConversation?: (conversationId: Id<"conversations">) => void;
}

export function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: SidebarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skeleton shown on server + before hydration
  if (!mounted) {
    return (
      <div className="flex flex-col h-full w-80 border-r bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex-1" />
        <div className="p-4 border-t flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-80 border-r bg-background">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
        <div className="flex items-center gap-1">
          {/* New DM */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            title="New message"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* New Group — uses CreateGroupDialog */}
          <CreateGroupDialog
            onSelectConversation={(id: Id<"conversations">) => {
              onSelectConversation(id);
              onNewConversation?.(id);
            }}
          />

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ── Conversation List ── */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
        />
      </div>

      {/* ── Footer: current user ── */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user?.fullName || user?.username}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <UserSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onConversationCreated={(id: Id<"conversations">) => {
          onSelectConversation(id);
          onNewConversation?.(id);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}