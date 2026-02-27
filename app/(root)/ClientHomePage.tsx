"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePresence } from "@/hooks/usePresence";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ClientHomePage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | undefined>();
  
  // Track user presence
  usePresence();
  
  // Mutation to create user
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/auth/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Create user in Convex when Clerk user is available
  useEffect(() => {
    if (userId && user && isLoaded) {
      createUser({
        userId: userId,
        name: user.fullName || user.username || "Unknown User",
        email: user.emailAddresses[0]?.emailAddress || "",
        avatarUrl: user.imageUrl || undefined,
      }).catch((error) => {
        console.error("Failed to create user:", error);
      });
    }
  }, [userId, user, isLoaded, createUser]);

  // Fetch conversations from Convex
  const conversationsData = useQuery(
    api.conversations.getConversations,
    userId ? { userId } : "skip"
  );

  // Transform Convex data to UI format
  const conversations = conversationsData 
    ? conversationsData.map((conv: any) => ({
        _id: conv._id,
        displayName: conv.name || (conv.isGroup ? "Group Chat" : "Direct Message"),
        displayImage: undefined,
        lastMessage: null,
        unreadCount: 0, // TODO: Implement unread count
        isGroup: conv.isGroup,
        members: conv.participants,
        isOnline: false, // TODO: Get user online status
      }))
    : [];

  // Always render the full layout to prevent hydration errors
  // The loading states are handled within individual components
  if (!isLoaded || !userId) {
    return (
      <div className="h-screen flex">
        <div className="flex flex-col h-full w-80 border-r bg-background">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                <div className="flex flex-col space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle conversation selection
  const handleSelectConversation = (id: Id<"conversations">) => {
    setSelectedConversation(id);
    router.push(`/conversation/${id}`);
  };

  // Handle new conversation created
  const handleNewConversation = (conversationId: Id<"conversations">) => {
    router.push(`/conversation/${conversationId}`);
  };

  return (
    <div className="h-screen flex">
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    </div>
  );
}