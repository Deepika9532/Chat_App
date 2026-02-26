import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

interface TypingRecord {
  _id: any;
  conversationId: any;
  userId: string;
  isTyping: boolean;
}

export const getTypingStatus = query({
  args: { conversationId: v.id("conversations") },
  handler: async (
    ctx: any, 
    args: { conversationId: any }
  ): Promise<TypingRecord[]> => {
    const userId = ctx.auth.userId();
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

    const typingUsers = await ctx.db
      .query("typing")
      .withIndex("by_conversationId", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q: any) => q.eq(q.field("isTyping"), true))
      .collect();

    return typingUsers;
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(), // Clerk user ID
    isTyping: v.boolean(),
  },
  handler: async (
    ctx: any, 
    args: { conversationId: any; userId: string; isTyping: boolean }
  ) => {
    // Verify authenticated user matches the userId parameter
    const authUserId = ctx.auth.userId();
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized: cannot set typing status for another user");
    }

    // Verify user is a participant in the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    if (!conversation.participants.includes(authUserId)) {
      throw new Error("Unauthorized: not a participant in this conversation");
    }

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) => q.eq(q.field("conversationId"), args.conversationId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
      });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: args.userId,
        isTyping: args.isTyping,
      });
    }
  },
});
