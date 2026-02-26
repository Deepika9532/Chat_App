import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple function to get conversation with last message for preview
export const getConversationsWithPreview = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: { userId: string }): Promise<any[]> => {
    const authUserId = ctx.auth.userId();
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Get user's conversations
    const conversations = await ctx.db
      .query("conversations")
      .filter((q: any) => q.arrayContains("participants", args.userId))
      .collect();

    // For each conversation, get the last message
    const conversationsWithPreview = [];
    for (const conv of conversations) {
      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q: any) => q.eq("conversationId", conv._id))
        .filter((q: any) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .first();

      conversationsWithPreview.push({
        ...conv,
        lastMessage: lastMessage ? lastMessage.content : "No messages yet",
        lastMessageTime: lastMessage ? lastMessage.createdAt : conv.createdAt,
        lastMessageSenderId: lastMessage ? lastMessage.senderId : null,
      });
    }

    return conversationsWithPreview;
  },
});

// Simple function to get user's online status
export const getUserOnlineStatus = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: { userId: string }): Promise<boolean> => {
    const authUserId = ctx.auth.userId();
    if (!authUserId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    return user ? !!user.isOnline : false;
  },
});