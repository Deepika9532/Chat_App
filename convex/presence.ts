import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

interface PresenceRecord {
  _id: any;
  userId: string;
  status: "online" | "offline" | "away";
  lastSeen?: number;
}

export const getPresence = query({
  args: { userId: v.string() }, // Clerk user ID
  handler: async (
    ctx: any, 
    args: { userId: string }
  ): Promise<PresenceRecord | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    
    // Users can only view their own presence or if they're authenticated
    if (!authUserId) {
      throw new Error("Unauthorized");
    }

    // Return the requested user's presence (for display purposes)
    return await ctx.db
      .query("presence")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

export const setPresence = mutation({
  args: {
    userId: v.string(), // Clerk user ID
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
  },
  handler: async (
    ctx: any, 
    args: { userId: string; status: "online" | "offline" | "away" }
  ) => {
    // Verify authenticated user matches the userId parameter
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    if (!authUserId || authUserId !== args.userId) {
      throw new Error("Unauthorized: cannot set presence for another user");
    }

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastSeen: args.status === "offline" ? Date.now() : undefined,
      });
    } else {
      await ctx.db.insert("presence", {
        userId: args.userId,
        status: args.status,
        lastSeen: args.status === "offline" ? Date.now() : undefined,
      });
    }
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx: any): Promise<PresenceRecord[]> => {
    const allPresence = await ctx.db.query("presence").collect();
    return allPresence.filter((p: PresenceRecord) => p.status === "online");
  },
});