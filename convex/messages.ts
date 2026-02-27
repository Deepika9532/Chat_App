import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

interface Message {
  _id: any;
  conversationId: any;
  senderId: string;
  content: string;
  isDeleted?: boolean;
  createdAt: number;
  attachments?: any[];
}

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (
    ctx: any, 
    args: { conversationId: any; limit?: number; cursor?: string }
  ): Promise<Message[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is a participant in the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    if (!conversation.participants.includes(userId)) {
      throw new Error("Unauthorized: not a participant in this conversation");
    }

    const limit = args.limit || 50;

    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q: any) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    return await messagesQuery;
  },
});

export const getMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx: any, args: { messageId: any }): Promise<Message | null> => {
    return await ctx.db.get(args.messageId);
  },
});

export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    attachments: v.optional(v.array(v.any())),
  },
  handler: async (
    ctx: any, 
    args: { conversationId: any; senderId: string; content: string; attachments?: any[] }
  ) => {
    // Verify authenticated user matches sender
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
    if (!userId || userId !== args.senderId) {
      throw new Error("Unauthorized: cannot send messages as another user");
    }

    // Verify user is a participant in the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    if (!conversation.participants.includes(userId)) {
      throw new Error("Unauthorized: not a participant in this conversation");
    }

    // Validate message content
    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    if (args.content.length > 4000) {
      throw new Error("Message content exceeds maximum length of 4000 characters");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      attachments: args.attachments,
      isDeleted: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx: any, args: { messageId: any }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get the message to verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the sender can delete their own messages
    if (message.senderId !== userId) {
      throw new Error("Unauthorized: can only delete your own messages");
    }

    // Mark as deleted instead of actually deleting
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
    });
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx: any, args: { messageId: any; content: string }) => {
    const userId = ctx.auth.userId();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get the message to verify ownership
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the sender can update their own message
    if (message.senderId !== userId) {
      throw new Error("Unauthorized: can only edit your own messages");
    }

    // Validate message content
    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    if (args.content.length > 4000) {
      throw new Error("Message content exceeds maximum length of 4000 characters");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

// Query to get the last message in a conversation
export const getLastMessage = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: any, args: { conversationId: any }): Promise<Message | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is a participant in the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    if (!conversation.participants.includes(userId)) {
      throw new Error("Unauthorized: not a participant in this conversation");
    }

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q: any) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .first();

    return lastMessage;
  },
});










