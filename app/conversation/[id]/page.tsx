"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useConversation } from "@/hooks/useConversation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { EmptyState } from "@/components/chat/EmptyState";

export default function ConversationPage() {
  const { userId } = useAuth();
  const params = useParams();
  const conversationId = params.id as string;

  const { messages, conversation, participantNames, userMap, isLoading, isTyping, sendMessage, setTyping } =
    useConversation(conversationId);

  if (!userId) {
    redirect("/sign-in");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="h-16 border-b bg-background animate-pulse" />
        <div className="flex-1 bg-muted/20" />
        <div className="h-20 border-t bg-background animate-pulse" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col h-screen">
        <ChatHeader name="Loading..." />
        <EmptyState
          title="Conversation not found"
          description="This conversation may have been deleted or doesn't exist"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        name={conversation.name || (participantNames.length > 0 ? participantNames[0] : "Unknown")}
        isOnline={false}
        isTyping={isTyping}
      />

      <MessageList
        messages={messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          senderName: msg.senderId === userId ? "You" : (userMap[msg.senderId]?.name || "Unknown User"),
          senderAvatar: userMap[msg.senderId]?.avatarUrl,
          senderIsOnline: userMap[msg.senderId]?.isOnline,
          createdAt: new Date(msg.createdAt),
          isCurrentUser: msg.senderId === userId,
        }))}
        currentUserId={userId}
        isLoading={isLoading}
        isTyping={isTyping}
      />

      <MessageInput
        onSend={sendMessage}
        onTyping={() => setTyping(true)}
        onStopTyping={() => setTyping(false)}
      />
    </div>
  );
}
