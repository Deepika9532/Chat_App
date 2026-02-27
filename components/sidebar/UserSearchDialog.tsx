"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function UserSearchDialog({ open, onOpenChange, onConversationCreated }: UserSearchDialogProps) {
  const { userId: currentUserId } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [mounted, setMounted] = useState(false);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Query for search results
  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedSearch.length >= 2 && currentUserId ? { 
      searchQuery: debouncedSearch,
      currentUserId: currentUserId
    } : "skip"
  );

  // Mutation to find or create direct conversation
  const findOrCreateConversationMutation = useMutation(api.conversations.findOrCreateDirectConversation);

  const handleStartConversation = async (userId: string) => {
    if (!currentUserId) return;

    try {
      // Use mutation to find or create conversation - avoids React hook violations
      const conversationId = await findOrCreateConversationMutation({ 
        userId1: currentUserId, 
        userId2: userId 
      });

      onConversationCreated?.(conversationId as string);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const isLoading = debouncedSearch.length >= 2 && searchResults === undefined && currentUserId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for a user to start a conversation with.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))
            ) : searchResults && searchResults.length === 0 && debouncedSearch.length >= 2 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            ) : searchResults ? (
              searchResults.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={user.avatarUrl}
                      name={user.name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {!mounted ? (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartConversation(user.userId)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}