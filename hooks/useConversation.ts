"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "./../convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: string;
  content: string;
  createdAt: number;
  isDeleted?: boolean;
  attachments?: {
    type: "image" | "file";
    url: string;
    name: string;
    size: number;
  }[];
}

interface Conversation {
  _id: Id<"conversations">;
  name?: string;
  isGroup: boolean;
  participants: string[];
  createdBy: string;
  createdAt: number;
}

export function useConversation(conversationId: string) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<Record<string, { name: string; avatarUrl?: string; isOnline?: boolean }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Query for conversation data
  const conversationData = useQuery(
    api.conversations.getConversation,
    { conversationId: conversationId as Id<"conversations"> }
  );

  // Query for messages
  const messagesData = useQuery(
    api.messages.getMessages,
    { conversationId: conversationId as Id<"conversations"> }
  );

  // Query for participant names
  const participantNamesData = useQuery(
    api.users.getUsersByIds,
    conversationData && conversationData.participants && userId ? 
    { userIds: conversationData.participants } : "skip"
  );

  // Mutations
  const sendMessageMutation = useMutation(api.messages.createMessage);
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const setTypingMutation = useMutation(api.typing.setTyping);

  // Update conversation when data changes
  useEffect(() => {
    if (conversationData) {
      setConversation(conversationData);
    }
  }, [conversationData]);

  // Update messages when data changes
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Update participant names when data changes
  useEffect(() => {
    if (participantNamesData) {
      const names = participantNamesData.map((user: any) => user.name);
      setParticipantNames(names);
      
      // Create user mapping for quick lookup
      const newUserMap: Record<string, { name: string; avatarUrl?: string; isOnline?: boolean }> = {};
      participantNamesData.forEach((user: any) => {
        newUserMap[user.userId] = {
          name: user.name,
          avatarUrl: user.avatarUrl,
          isOnline: user.isOnline
        };
      });
      setUserMap(newUserMap);
    }
  }, [participantNamesData]);

  // Handle loading state
  useEffect(() => {
    // Both queries return undefined while loading
    // Wait until both queries have either resolved or failed
    if (conversationData !== undefined && messagesData !== undefined) {
      setIsLoading(false);
    }
  }, [conversationData, messagesData]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !userId) return;

      try {
        await sendMessageMutation({
          conversationId: conversationId as Id<"conversations">,
          senderId: userId,
          content: content.trim(),
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [conversationId, userId, sendMessageMutation]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessageMutation({ messageId: messageId as Id<"messages"> });
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    },
    [deleteMessageMutation]
  );

  const setTyping = useCallback(
    async (typing: boolean) => {
      if (!userId) return;

      setIsTyping(typing);
      
      try {
        await setTypingMutation({
          conversationId: conversationId as Id<"conversations">,
          userId,
          isTyping: typing,
        });
      } catch (error) {
        console.error("Failed to set typing status:", error);
      }
    },
    [conversationId, userId, setTypingMutation]
  );

  return {
    messages,
    conversation,
    participantNames,
    userMap,
    isLoading,
    isTyping,
    sendMessage,
    deleteMessage,
    setTyping,
  };
}
