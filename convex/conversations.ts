import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Note: Convex doesn't support array containment queries efficiently.
    // We query all conversations and filter in memory.
    // For production with high volume, consider creating a separate
    // conversation_members table with individual user indexes.
    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_updated_at")
      .order("desc")
      .take(100); // Limit to recent 100 conversations for performance

    // Filter conversations where userId is in memberIds
    return allConversations.filter((conv) => 
      conv.memberIds.includes(args.userId)
    );
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const findDirectConversation = query({
  args: { userId1: v.string(), userId2: v.string() },
  handler: async (ctx, args) => {
    // Note: Convex doesn't support array containment efficiently.
    // Query recent conversations and search for the direct message.
    // For production, consider a separate table for direct message lookups.
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq("type", "direct"))
      .take(50); // Limit to recent 50 direct messages

    return conversations.find(
      (conv) =>
        conv.memberIds.includes(args.userId1) &&
        conv.memberIds.includes(args.userId2)
    );
  },
});

export const createConversation = mutation({
  args: {
    type: v.union(v.literal("direct"), v.literal("group")),
    memberIds: v.array(v.string()),
    name: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      type: args.type,
      memberIds: args.memberIds,
      name: args.name,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Initialize read status for all members
    for (const memberId of args.memberIds) {
      await ctx.db.insert("conversationReads", {
        conversationId,
        userId: memberId,
        lastReadAt: Date.now(),
      });
    }

    return conversationId;
  },
});

export const getOrCreateDirectConversation = mutation({
  args: { userId1: v.string(), userId2: v.string() },
  handler: async (ctx, args) => {
    // Check if conversation already exists - limit to recent 50 for performance
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq("type", "direct"))
      .take(50);

    const existing = conversations.find(
      (conv) =>
        conv.memberIds.includes(args.userId1) &&
        conv.memberIds.includes(args.userId2)
    );

    if (existing) {
      return existing._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      memberIds: [args.userId1, args.userId2],
      createdBy: args.userId1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Initialize read status
    await ctx.db.insert("conversationReads", {
      conversationId,
      userId: args.userId1,
      lastReadAt: Date.now(),
    });

    await ctx.db.insert("conversationReads", {
      conversationId,
      userId: args.userId2,
      lastReadAt: Date.now(),
    });

    return conversationId;
  },
});
