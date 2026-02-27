"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Video, Users, Settings } from "lucide-react";

interface GroupChatWindowProps {
  groupId: string;
  groupName: string;
  participants: any[];
  messages: any[];
  isLoading: boolean;
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onSetTyping: (typing: boolean) => void;
  onLeaveGroup: () => void;
  onGroupSettings: () => void;
}

export function GroupChatWindow({
  groupId,
  groupName,
  participants,
  messages,
  isLoading,
  isTyping,
  onSendMessage,
  onSetTyping,
  onLeaveGroup,
  onGroupSettings
}: GroupChatWindowProps) {
  const { userId } = useAuth();
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);

  const handleVoiceCall = () => {
    setCallType('audio');
    setIsCallDialogOpen(true);
  };

  const handleVideoCall = () => {
    setCallType('video');
    setIsCallDialogOpen(true);
  };

  const handleCallAction = () => {
    // In a real app, you would implement the actual group call functionality
    console.log(`${callType} group call initiated for ${groupName}`);
    setIsCallDialogOpen(false);
    setCallType(null);
  };

  const handleMore = () => {
    // Show group options menu
    console.log("Group options menu");
  };

  const participantCount = participants?.length || 0;

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        name={`${groupName} (${participantCount})`}
        isOnline={true}
        isTyping={isTyping}
        onVideoCall={handleVideoCall}
        onVoiceCall={handleVoiceCall}
        onSearch={() => console.log("Group search")}
        onMore={handleMore}
      />

      <MessageList
        messages={messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          senderName: msg.senderId === userId ? "You" : msg.senderName,
          senderAvatar: msg.senderAvatar,
          senderIsOnline: msg.senderIsOnline,
          createdAt: new Date(msg.createdAt),
          isCurrentUser: msg.senderId === userId,
        }))}
        currentUserId={userId || ""}
        isLoading={isLoading}
        isTyping={isTyping}
      />

      <MessageInput
        onSend={onSendMessage}
        onTyping={() => onSetTyping(true)}
        onStopTyping={() => onSetTyping(false)}
      />

      {/* Group Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Group {callType === 'audio' ? 'Voice' : 'Video'} Call</DialogTitle>
            <DialogDescription>
              Would you like to start a {callType === 'audio' ? 'voice' : 'video'} call with the group "{groupName}"?
              {participantCount > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Participants: {participantCount} members
                  </p>
                </div>
              )}
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
    </div>
  );
}