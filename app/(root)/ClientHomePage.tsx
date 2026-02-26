"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePresence } from "@/hooks/usePresence";

export default function ClientHomePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>();
  
  // Track user presence
  usePresence();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/auth/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Fetch conversations from Convex
  const conversationsData = useQuery(
    api.conversations.getConversations,
    userId ? { userId } : "skip"
  );

  // Transform Convex data to UI format
  const conversations = conversationsData 
    ? conversationsData.map((conv: any) => ({
        id: conv._id,
        name: conv.name || conv.isGroup ? "Group Chat" : "Direct Message",
        participants: conv.participants,
        createdBy: conv.createdBy,
        createdAt: conv.createdAt,
        unreadCount: 0, // TODO: Implement unread count
        lastMessage: "No messages yet", // TODO: Get from latest message
        lastMessageTime: new Date(conv.createdAt).toISOString(),
        isOnline: false, // TODO: Get user online status
      }))
    : [];

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userId) {
    // Render loading state while redirecting to prevent hydration issues
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    router.push(`/conversation/${id}`);
  };

  // Handle new conversation created
  const handleNewConversation = (conversationId: string) => {
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
