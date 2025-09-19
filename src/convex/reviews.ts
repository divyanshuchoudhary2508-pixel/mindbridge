import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const submitReview = mutation({
  args: {
    anonymousId: v.string(),
    rating: v.number(),
    comment: v.string(),
    page: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    return await ctx.db.insert("reviews", {
      anonymousId: args.anonymousId,
      userId: user?._id,
      rating: args.rating,
      comment: args.comment,
      page: args.page,
      name: args.name,
      email: args.email,
    });
  },
});

export const listRecent = query({
  args: { 
    page: v.string(),
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_page", (q) => q.eq("page", args.page))
      .order("desc")
      .take(10);

    // Revert: do not resolve names/emails from user profiles; keep as stored
    return reviews.map((review) => ({
      ...review,
      isMine: review.anonymousId === args.anonymousId,
    }));
  },
});

export const listAllRecent = query({
  args: {},
  handler: async (ctx) => {
    // Return the most recent 20 reviews across all pages
    const reviews = await ctx.db.query("reviews").order("desc").take(20);
    return reviews;
  },
});

export const editReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    anonymousId: v.string(),
    rating: v.number(),
    comment: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");
    if (review.anonymousId !== args.anonymousId) {
      throw new Error("You can only edit your own reviews");
    }
    await ctx.db.patch(args.reviewId, {
      rating: args.rating,
      comment: args.comment,
      name: args.name,
      email: args.email,
    });
  },
});

export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    anonymousId: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    
    if (!review) {
      throw new Error("Review not found");
    }
    
    if (review.anonymousId !== args.anonymousId) {
      throw new Error("You can only delete your own reviews");
    }
    
    await ctx.db.delete(args.reviewId);
  },
});