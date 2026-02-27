// Group-specific functions for Convex
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new group
export const createGroup = mutation({
  args: {
    groupName: v.string(),
    participants: v.array(v.string()), // Array of Clerk user IDs
    createdBy: v.string(), // Clerk user ID of creator
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to create group");
    }
    const authUserId = identity.subject;
    
    // Verify the creator is included in participants
    if (!args.participants.includes(authUserId)) {
      throw new Error("Creator must be included in group participants");
    }
    
    // Verify all participants are valid users
    const validParticipants = [];
    for (const userId of args.participants) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (user) {
        validParticipants.push(userId);
      }
    }
    
    if (validParticipants.length !== args.participants.length) {
      throw new Error("Some participants are not valid users");
    }
    
    // Create the group conversation
    const conversationId = await ctx.db.insert("conversations", {
      name: args.groupName,
      isGroup: true,
      participants: validParticipants,
      createdBy: authUserId,
      createdAt: Date.now(),
    });
    
    return conversationId;
  },
});

// Get user's groups
export const getUserGroups = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to access groups");
    }
    const authUserId = identity.subject;
    
    // Get all conversations where user is a participant and isGroup is true
    const allConversations = await ctx.db.query("conversations").collect();
    const groups = allConversations.filter(conv => 
      conv.isGroup && conv.participants.includes(args.userId)
    );
    
    // Get the latest message for each group
    const groupsWithDetails = await Promise.all(
      groups.map(async (group) => {
        const latestMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", group._id))
          .order("desc")
          .first();
        
        // Get participant names
        const participantNames = await Promise.all(
          group.participants.map(async (userId) => {
            if (userId === args.userId) return "You";
            const user = await ctx.db
              .query("users")
              .withIndex("by_userId", (q) => q.eq("userId", userId))
              .first();
            return user?.name || "Unknown User";
          })
        );
        
        return {
          ...group,
          lastMessage: latestMessage?.content || null,
          lastMessageTime: latestMessage?.createdAt || null,
          participantNames: participantNames.filter(name => name !== "You"),
        };
      })
    );
    
    return groupsWithDetails.sort((a, b) => 
      (b.lastMessageTime || b.createdAt) - (a.lastMessageTime || a.createdAt)
    );
  },
});

// Add member to group
export const addGroupMember = mutation({
  args: {
    groupId: v.id("conversations"),
    newMemberId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to add group members");
    }
    const authUserId = identity.subject;
    
    const allConversations = await ctx.db.query("conversations").collect();
    const group = allConversations.find(conv => 
      conv._id === args.groupId && 
      conv.isGroup && 
      conv.participants.includes(authUserId)
    );
    
    if (!group) {
      throw new Error("Group not found or you don't have permission to add members");
    }
    
    // Check if user already exists
    if (group.participants.includes(args.newMemberId)) {
      throw new Error("User is already a member of this group");
    }
    
    // Verify the user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.newMemberId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update group participants
    const updatedParticipants = [...group.participants, args.newMemberId];
    await ctx.db.patch(args.groupId, {
      participants: updatedParticipants,
    });
    
    return updatedParticipants;
  },
});

// Remove member from group
export const removeGroupMember = mutation({
  args: {
    groupId: v.id("conversations"),
    memberId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to remove group members");
    }
    const authUserId = identity.subject;
    
    const allConversations = await ctx.db.query("conversations").collect();
    const group = allConversations.find(conv => 
      conv._id === args.groupId && 
      conv.isGroup && 
      conv.participants.includes(authUserId)
    );
    
    if (!group) {
      throw new Error("Group not found or you don't have permission to remove members");
    }
    
    // Can't remove yourself if you're the creator
    if (args.memberId === authUserId && group.createdBy === authUserId) {
      throw new Error("Group creator cannot remove themselves");
    }
    
    // Check if user is actually a member
    if (!group.participants.includes(args.memberId)) {
      throw new Error("User is not a member of this group");
    }
    
    // Update group participants
    const updatedParticipants = group.participants.filter(id => id !== args.memberId);
    await ctx.db.patch(args.groupId, {
      participants: updatedParticipants,
    });
    
    return updatedParticipants;
  },
});

// Leave group
export const leaveGroup = mutation({
  args: {
    groupId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to leave group");
    }
    const authUserId = identity.subject;
    
    const allConversations = await ctx.db.query("conversations").collect();
    const group = allConversations.find(conv => 
      conv._id === args.groupId && 
      conv.isGroup && 
      conv.participants.includes(authUserId)
    );
    
    if (!group) {
      throw new Error("Group not found or you're not a member");
    }
    
    // Group creator cannot leave (they must delete the group)
    if (group.createdBy === authUserId) {
      throw new Error("Group creator cannot leave the group. Please delete the group instead.");
    }
    
    // Remove user from participants
    const updatedParticipants = group.participants.filter(id => id !== authUserId);
    await ctx.db.patch(args.groupId, {
      participants: updatedParticipants,
    });
    
    return updatedParticipants;
  },
});

// Update group name
export const updateGroupName = mutation({
  args: {
    groupId: v.id("conversations"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be logged in to update group name");
    }
    const authUserId = identity.subject;
    
    const allConversations = await ctx.db.query("conversations").collect();
    const group = allConversations.find(conv => 
      conv._id === args.groupId && 
      conv.isGroup && 
      conv.participants.includes(authUserId)
    );
    
    if (!group) {
      throw new Error("Group not found or you don't have permission to update it");
    }
    
    await ctx.db.patch(args.groupId, {
      name: args.newName,
    });
    
    return { ...group, name: args.newName };
  },
});