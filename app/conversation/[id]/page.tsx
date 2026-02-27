"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useConversation } from "@/hooks/useConversation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { EmptyState } from "@/components/chat/EmptyState";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Video } from "lucide-react";
import { useState } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function ConversationPage() {
  const { userId } = useAuth();
  const params = useParams();
  const conversationId = params.id as string;
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);

  const { messages, conversation, participantNames, userMap, isLoading, isTyping, sendMessage, setTyping } =
    useConversation(conversationId);
  
  const { 
    isCalling, 
    isReceiving, 
    localStream, 
    remoteStream, 
    callType: activeCallType,
    connectionStatus,
    networkQuality,
    startCall,
    handleIncomingCall,
    endCall 
  } = useWebRTC(conversationId);

  const handleVoiceCall = () => {
    setCallType('audio');
    setIsCallDialogOpen(true);
  };

  const handleVideoCall = () => {
    setCallType('video');
    setIsCallDialogOpen(true);
  };

  const handleCallAction = () => {
    // Start actual WebRTC call
    if (callType) {
      startCall(callType);
    }
    setIsCallDialogOpen(false);
    setCallType(null);
  };

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
        onVideoCall={handleVideoCall}
        onVoiceCall={handleVoiceCall}
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

      {/* Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start {callType === 'audio' ? 'Voice' : 'Video'} Call</DialogTitle>
            <DialogDescription>
              Would you like to start a {callType === 'audio' ? 'voice' : 'video'} call with {conversation.name || (participantNames.length > 0 ? participantNames[0] : "Unknown")}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button 
              className="flex-1" 
              onClick={handleCallAction}
            >
              {callType === 'audio' ? (
                <Phone className="h-4 w-4 mr-2" />
              ) : (
                <Video className="h-4 w-4 mr-2" />
              )}
              Start Call
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsCallDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Call Status */}
      {(isCalling || isReceiving) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <DialogHeader>
              <DialogTitle>
                {isCalling ? 'Calling...' : 'Incoming Call'}
              </DialogTitle>
              <DialogDescription>
                {activeCallType} call with {conversation?.name || (participantNames.length > 0 ? participantNames[0] : "Unknown")}
                <br />
                Status: {connectionStatus} | Quality: {networkQuality}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              {/* Video/Audio display would go here */}
              {localStream && (
                <div className="text-sm text-muted-foreground">
                  Local stream active
                </div>
              )}
              {remoteStream && (
                <div className="text-sm text-muted-foreground">
                  Remote stream active
                </div>
              )}
              
              <Button 
                variant="destructive" 
                onClick={endCall}
                className="w-full"
              >
                End Call
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}