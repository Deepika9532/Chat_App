import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

interface User {
  _id: any;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export const getUser = query({
  args: { userId: v.string() }, // Clerk user ID
  handler: async (ctx: any, args: { userId: string }): Promise<User | null> => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to access user profile");
    }
    const authUserId = identity.subject;
    
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx: any, args: { email: string }): Promise<User | null> => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", args.email))
      .first();
  },
});

export const getUsersByIds = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx: any, args: { userIds: string[] }): Promise<User[]> => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to access user information");
    }
    const authUserId = identity.subject;

    if (args.userIds.length === 0) return [];

    // Get users by querying for each userId
    const users: User[] = [];
    for (const userId of args.userIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q: any) => q.eq("userId", userId))
        .first();
      if (user) {
        users.push(user);
      }
    }

    return users;
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: { userId: string }): Promise<User | null> => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to access user information");
    }
    const authUserId = identity.subject;

    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

export const searchUsers = query({
  args: { 
    searchQuery: v.string(),
    currentUserId: v.optional(v.string()) 
  },
  handler: async (ctx: any, args: { searchQuery: string; currentUserId?: string }): Promise<User[]> => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to search users");
    }
    const authUserId = identity.subject;

    // If currentUserId is provided, verify it matches the authenticated user
    if (args.currentUserId && args.currentUserId !== authUserId) {
      throw new Error("Unauthorized: cannot search users on behalf of another user");
    }

    if (args.searchQuery.length < 2) return [];

    // Limit results to prevent performance issues and privacy concerns
    const limit = 20;
    const query = args.searchQuery.toLowerCase();

    // Get users and filter - limited to 100 to avoid scanning entire table
    const allUsers = await ctx.db.query("users").take(100);
    
    return allUsers
      .filter((user: User) => {
        // Exclude current user from results
        if (args.currentUserId && user.userId === args.currentUserId) {
          return false;
        }
        // Filter by name or email match
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      })
      .slice(0, limit);
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx: any): Promise<User[]> => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to access user list");
    }
    const userId = identity.subject;
    
    // Return all users - in production, consider adding pagination or limiting fields
    // to protect user privacy (e.g., exclude email addresses)
    return await ctx.db.query("users").take(50);
  },
});

export const getUserPresence = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: { userId: string }): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const authUserId = identity.subject;
    
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
    
    return presence || { status: "offline", lastSeen: null };
  },
});

export const createUser = mutation({
  args: {
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (
    ctx: any, 
    args: { userId: string; name: string; email: string; avatarUrl?: string }
  ) => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to create user");
    }
    const authUserId = identity.subject;
    
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      isOnline: true,
    });
  },
});

export const updateUserOnlineStatus = mutation({
  args: {
    userId: v.string(), // Clerk user ID
    isOnline: v.boolean(),
  },
  handler: async (ctx: any, args: { userId: string; isOnline: boolean }) => {
    // Verify authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to update user status");
    }
    const authUserId = identity.subject;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
    
    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.isOnline,
      });
    }
    
    // Also update presence table
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
    
    const status = args.isOnline ? "online" : "offline";
    const lastSeen = args.isOnline ? Date.now() : undefined;
    
    if (presence) {
      await ctx.db.patch(presence._id, {
        status,
        lastSeen: lastSeen || presence.lastSeen,
      });
    } else {
      await ctx.db.insert("presence", {
        userId: args.userId,
        status,
        lastSeen,
      });
    }
  },
});
