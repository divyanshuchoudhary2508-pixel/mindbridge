import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getChatHistory = query({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Get messages for this anonymous ID or user
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_anonymous_id", (q) => q.eq("anonymousId", args.anonymousId))
      .order("asc")
      .collect();

    return messages;
  },
});

export const addMessage = mutation({
  args: {
    anonymousId: v.string(),
    message: v.string(),
    isUser: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    await ctx.db.insert("chatMessages", {
      anonymousId: args.anonymousId,
      userId: user?._id,
      message: args.message,
      isUser: args.isUser,
      timestamp: Date.now(),
    });
  },
});

export const clearChatHistory = mutation({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_anonymous_id", (q) => q.eq("anonymousId", args.anonymousId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
