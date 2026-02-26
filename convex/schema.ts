import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    isOnline: v.optional(v.boolean()),
    username: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    name: v.optional(v.string()),
    isGroup: v.boolean(),
    participants: v.array(v.string()), // Clerk user IDs
    createdBy: v.string(), // Clerk user ID
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_participants", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // Clerk user ID
    content: v.string(),
    isDeleted: v.optional(v.boolean()),
    createdAt: v.number(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("file")),
          url: v.string(),
          name: v.string(),
          size: v.number(),
        })
      )
    ),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_senderId", ["senderId"])
    .index("by_createdAt", ["conversationId", "createdAt"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // Clerk user ID
    isTyping: v.boolean(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"]),

  presence: defineTable({
    userId: v.string(), // Clerk user ID
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
    lastSeen: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  unreadMessages: defineTable({
    userId: v.string(), // Clerk user ID
    conversationId: v.id("conversations"),
    count: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_conversationId", ["conversationId"])
    .index("by_user_conversation", ["userId", "conversationId"]),
});
