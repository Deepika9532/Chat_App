import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Type definitions for cleaner code
interface Conversation {
  _id: any;
  name?: string;
  isGroup: boolean;
  participants: string[];
  createdBy: string;
  createdAt: number;
}

export const getConversations = query({
  args: { userId: v.string() }, // Clerk user ID
  handler: async (ctx: any, args: { userId: string }): Promise<Conversation[]> => {
    // Verify the requesting user is the same as the userId parameter
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const authUserId = identity.subject;
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized: cannot access other user's conversations");
    }

    const conversations = await ctx.db
      .query("conversations")
      .filter((q: any) => q.arrayContains("participants", args.userId))
      .collect();

    return conversations;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: any, args: { conversationId: any }): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    // Verify user is a participant
    if (!conversation.participants.includes(userId)) {
      throw new Error("Unauthorized: not a participant in this conversation");
    }

    // For now, return conversation as is
    // We'll handle user names on the client side
    return conversation;
  },
});

export const getDirectConversation = query({
  args: {
    userId1: v.string(), // Clerk user ID
    userId2: v.string(), // Clerk user ID
  },
  handler: async (ctx: any, args: { userId1: string; userId2: string }): Promise<Conversation | null> => {
    // Verify the authenticated user is one of the requested users
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const authUserId = identity.subject;
    if (!authUserId || (authUserId !== args.userId1 && authUserId !== args.userId2)) {
      throw new Error("Unauthorized");
    }

    const conversations = await ctx.db
      .query("conversations")
      .filter((q: any) => 
        q.and(
          q.eq(q.field("isGroup"), false),
          q.arrayContains("participants", args.userId1),
          q.arrayContains("participants", args.userId2)
        )
      )
      .first();

    return conversations;
  },
});

export const createConversation = mutation({
  args: {
    participants: v.array(v.string()), // Clerk user IDs
    name: v.optional(v.string()),
    isGroup: v.boolean(),
    createdBy: v.string(), // Clerk user ID
  },
  handler: async (ctx: any, args: { participants: string[]; name?: string; isGroup: boolean; createdBy: string }) => {
    // Verify authenticated user matches createdBy
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    if (!userId || userId !== args.createdBy) {
      throw new Error("Unauthorized: cannot create conversation as another user");
    }

    // Ensure creator is in participants
    if (!args.participants.includes(userId)) {
      throw new Error("Bad Request: creator must be a participant");
    }

    return await ctx.db.insert("conversations", {
      participants: args.participants,
      name: args.name,
      isGroup: args.isGroup,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

export const updateConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    name: v.optional(v.string()),
  },
  handler: async (ctx: any, args: { conversationId: any; name?: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId) as Conversation;
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only participants can update conversation
    if (!conversation.participants.includes(userId)) {
      throw new Error("Unauthorized: not a participant in this conversation");
    }

    await ctx.db.patch(args.conversationId, {
      name: args.name,
    });
  },
});

export const addParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx: any, args: { conversationId: any; userId: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const authUserId = identity.subject;
    if (!authUserId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId) as Conversation;
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only existing participants can add new participants
    if (!conversation.participants.includes(authUserId)) {
      throw new Error("Unauthorized: only participants can add new members");
    }

    // Don't add if already a participant
    if (conversation.participants.includes(args.userId)) {
      return; // Already a participant
    }

    await ctx.db.patch(args.conversationId, {
      participants: [...conversation.participants, args.userId],
    });
  },
});

export const removeParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx: any, args: { conversationId: any; userId: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const authUserId = identity.subject;
    if (!authUserId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId) as Conversation;
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only participants can remove members, and users can remove themselves
    if (!conversation.participants.includes(authUserId)) {
      throw new Error("Unauthorized: only participants can remove members");
    }

    // Users can only remove themselves or be removed by other participants
    if (authUserId !== args.userId && !conversation.participants.includes(args.userId)) {
      throw new Error("Bad Request: cannot remove user not in conversation");
    }

    await ctx.db.patch(args.conversationId, {
      participants: conversation.participants.filter((p: string) => p !== args.userId),
    });
  },
});

// Mutation to check for existing direct conversation - avoids hook violation in event handlers
export const findOrCreateDirectConversation = mutation({
  args: {
    userId1: v.string(),
    userId2: v.string(),
  },
  handler: async (ctx: any, args: { userId1: string; userId2: string }) => {
    // Verify authenticated user is one of the requested users
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const authUserId = identity.subject;
    if (!authUserId || (authUserId !== args.userId1 && authUserId !== args.userId2)) {
      throw new Error("Unauthorized");
    }

    // Check if conversation already exists
    const existingConv = await ctx.db
      .query("conversations")
      .filter((q: any) => 
        q.and(
          q.eq(q.field("isGroup"), false),
          q.arrayContains("participants", args.userId1),
          q.arrayContains("participants", args.userId2)
        )
      )
      .first();

    if (existingConv) {
      return existingConv._id;
    }

    // Create new conversation
    const newConvId = await ctx.db.insert("conversations", {
      participants: [args.userId1, args.userId2],
      name: undefined,
      isGroup: false,
      createdBy: authUserId,
      createdAt: Date.now(),
    });

    return newConvId;
  },
});
