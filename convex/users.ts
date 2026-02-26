import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

export const getAllUsers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Limit to recent 50 users for performance and security
    // In production, implement proper pagination
    const users = await ctx.db
      .query("users")
      .order("desc")
      .take(50);
    return users.filter((user) => user.clerkId !== args.clerkId);
  },
});

export const searchUsers = query({
  args: { clerkId: v.string(), search: v.string() },
  handler: async (ctx, args) => {
    // Limit results for performance
    const users = await ctx.db
      .query("users")
      .take(20);
    const searchLower = args.search.toLowerCase();
    return users.filter(
      (user) =>
        user.clerkId !== args.clerkId &&
        user.username.toLowerCase().includes(searchLower)
    );
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      email: args.email,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
    });

    return await ctx.db.get(userId);
  },
});

export const updateLastSeen = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        lastSeen: Date.now(),
        isOnline: true,
      });
    }
  },
});

export const setOffline = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: false,
      });
    }
  },
});

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});
