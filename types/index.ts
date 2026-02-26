export interface User {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface Conversation {
  _id: string;
  _creationTime: number;
  name?: string;
  isGroup: boolean;
  participants: string[];
  lastMessage?: {
    messageId: string;
    content: string;
    senderId: string;
    createdAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  _id: string;
  _creationTime: number;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  isDeleted?: boolean;
  attachments?: {
    type: "image" | "file";
    url: string;
    name: string;
    size: number;
  }[];
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface Presence {
  userId: string;
  status: "online" | "offline" | "away";
  lastSeen?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
