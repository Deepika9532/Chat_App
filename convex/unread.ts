import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

interface UnreadMessage {
  _id: any;
  userId: string;
  conversationId: any;
  count: number;
  lastReadAt?: number;
}

export const getUnreadCounts = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: { userId: string }): Promise<Record<string, number>> => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const unreadRecords = await ctx.db
      .query("unreadMessages")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .collect();

    const unreadCounts: Record<string, number> = {};
    for (const record of unreadRecords) {
      unreadCounts[record.conversationId] = record.count;
    }

    return unreadCounts;
  },
});

export const markAsRead = mutation({
  args: { 
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx: any, args: { conversationId: any; userId: string }) => {
    // Verify authenticated user matches the userId
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Find existing unread record
    const existingRecord = await ctx.db
      .query("unreadMessages")
      .withIndex("by_user_conversation", (q: any) => 
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (existingRecord) {
      // Update existing record
      await ctx.db.patch(existingRecord._id, {
        count: 0,
        lastReadAt: Date.now()
      });
    } else {
      // Create new record with 0 unread
      await ctx.db.insert("unreadMessages", {
        userId: args.userId,
        conversationId: args.conversationId,
        count: 0,
        lastReadAt: Date.now()
      });
    }
  },
});

export const incrementUnreadCount = mutation({
  args: { 
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx: any, args: { conversationId: any; userId: string }) => {
    // This function is called when a new message is created
    // Verify authenticated user (should be the message sender)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    if (!authUserId) {
      throw new Error("Unauthorized");
    }

    // Don't increment for the sender themselves
    if (authUserId === args.userId) {
      return;
    }

    // Find existing unread record
    const existingRecord = await ctx.db
      .query("unreadMessages")
      .withIndex("by_user_conversation", (q: any) => 
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (existingRecord) {
      // Increment existing record
      await ctx.db.patch(existingRecord._id, {
        count: existingRecord.count + 1
      });
    } else {
      // Create new record
      await ctx.db.insert("unreadMessages", {
        userId: args.userId,
        conversationId: args.conversationId,
        count: 1
      });
    }
  },
});

export const resetUnreadCount = mutation({
  args: { 
    conversationId: v.id("conversations"),
    userId: v.string()
  },
  handler: async (ctx: any, args: { conversationId: any; userId: string }) => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Find existing unread record
    const existingRecord = await ctx.db
      .query("unreadMessages")
      .withIndex("by_user_conversation", (q: any) => 
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (existingRecord) {
      await ctx.db.patch(existingRecord._id, {
        count: 0,
        lastReadAt: Date.now()
      });
    }
  },
});