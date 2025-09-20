import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const listPosts = query({
  args: {},
  handler: async (ctx) => {
    // latest first
    const posts = await ctx.db.query("forumPosts").order("desc").take(50);
    return posts;
  },
});

export const createPost = mutation({
  args: {
    anonymousId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!args.content.trim()) {
      throw new Error("Content is required");
    }
    return await ctx.db.insert("forumPosts", {
      anonymousId: args.anonymousId,
      userId: user?._id,
      content: args.content.trim(),
      title: args.content.trim().slice(0, 80) || "Post",
      isAnonymous: true,
    });
  },
});

export const editPost = mutation({
  args: {
    postId: v.id("forumPosts"),
    anonymousId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const user = await getCurrentUser(ctx);
    const isAdmin =
      !!user &&
      (user.role === "admin" || (user.email || "").toLowerCase() === "heckershershah@gmail.com");

    const isOwner =
      (post.userId && user?._id && post.userId === user._id) ||
      post.anonymousId === args.anonymousId;

    if (!isOwner && !isAdmin) {
      throw new Error("You can only edit your own posts");
    }

    const trimmed = args.content.trim();
    if (!trimmed) {
      throw new Error("Content is required");
    }

    // Update both content and title to stay consistent
    await ctx.db.patch(args.postId, { 
      content: trimmed,
      title: trimmed.slice(0, 80) || "Post",
    });
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("forumPosts"),
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const user = await getCurrentUser(ctx);
    const isAdmin =
      !!user &&
      (user.role === "admin" || (user.email || "").toLowerCase() === "heckershershah@gmail.com");

    const isOwner =
      (post.userId && user?._id && post.userId === user._id) ||
      post.anonymousId === args.anonymousId;

    if (!isOwner && !isAdmin) {
      throw new Error("You can only delete your own posts");
    }

    await ctx.db.delete(args.postId);
  },
});