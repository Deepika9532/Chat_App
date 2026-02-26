import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      createdAt: Date.now(),
      isDeleted: false,
      reactions: [],
    });

    // Update conversation's updatedAt
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        updatedAt: Date.now(),
      });
    }

    // Update read status for sender
    const readStatus = await ctx.db
      .query("conversationReads")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.senderId)
      )
      .first();

    if (readStatus) {
      await ctx.db.patch(readStatus._id, {
        lastReadAt: Date.now(),
      });
    }

    return messageId;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
    });
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const existingReaction = message.reactions.find(
      (r) => r.emoji === args.emoji && r.userId === args.userId
    );

    let newReactions;
    if (existingReaction) {
      newReactions = message.reactions.filter(
        (r) => !(r.emoji === args.emoji && r.userId === args.userId)
      );
    } else {
      newReactions = [
        ...message.reactions,
        { emoji: args.emoji, userId: args.userId },
      ];
    }

    await ctx.db.patch(args.messageId, {
      reactions: newReactions,
    });
  },
});

export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return 0;

    const readStatus = await ctx.db
      .query("conversationReads")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!readStatus) return 0;

    // Use the index efficiently - get messages after last read time
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.gt(q.field("createdAt"), readStatus.lastReadAt))
      .collect();

    // Count messages from other users (not from self)
    const unreadCount = messages.filter(
      (m) => m.senderId !== args.userId
    ).length;

    return unreadCount;
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const readStatus = await ctx.db
      .query("conversationReads")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (readStatus) {
      await ctx.db.patch(readStatus._id, {
        lastReadAt: Date.now(),
      });
    }
  },
});

export const onMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const getLastMessage = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .first();

    return messages;
  },
});
