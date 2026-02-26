import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    createdAt: v.number(),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    type: v.union(v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()),
    memberIds: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_member_ids", ["memberIds"])
    .index("by_updated_at", ["updatedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
    isDeleted: v.boolean(),
    reactions: v.array(
      v.object({
        emoji: v.string(),
        userId: v.string(),
      })
    ),
  })
    .index("by_conversation_id", ["conversationId"])
    .index("by_created_at", ["createdAt"]),

  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    lastReadAt: v.number(),
  })
    .index("by_conversation_and_user", ["conversationId", "userId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]).index("by_conversation_and_user", ["conversationId", "userId"]),
});
