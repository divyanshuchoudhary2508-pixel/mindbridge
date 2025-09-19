import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// Helper to get the currently authenticated user's document (or null)
// Used by other Convex functions (reviews, forum, chatbot, assessments)
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const email = (identity as any).email as string | undefined;
  if (!email) {
    // Likely anonymous provider without email
    return null;
  }

  // Prefer indexed lookup by email (index defined in schema)
  const user =
    (await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first()) ?? null;

  return user;
}

// Current authenticated user (for frontend hook use)
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const email = (identity as any).email as string | undefined;
    if (!email) return null;

    const user =
      (await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first()) ?? null;

    return user;
  },
});

// Ensure a user record exists after OTP verification; upsert name if provided
export const ensureUser = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = (identity as any).email as string | undefined;
    if (!email) {
      // Anonymous or provider without email — do not create a user row
      return null;
    }

    const existing =
      (await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first()) ?? null;

    // Determine if this email should be an admin for bootstrap
    const shouldBeAdmin = email.toLowerCase() === "heckershershah@gmail.com";

    if (!existing) {
      const userId = await ctx.db.insert("users", {
        email,
        name: args.name,
        isAnonymous: false,
        role: shouldBeAdmin ? "admin" : "user",
        anonymousId: undefined,
      });
      return userId;
    }

    // Patch name if provided and different/missing
    const patches: Record<string, any> = {};
    if (args.name && args.name.trim() && args.name !== existing.name) {
      patches.name = args.name.trim();
    }

    // Ensure admin role if this is the bootstrap admin email
    if (shouldBeAdmin && existing.role !== "admin") {
      patches.role = "admin";
    }

    if (Object.keys(patches).length > 0) {
      await ctx.db.patch(existing._id, patches);
    }

    return existing._id;
  },
});

// Create user with additional validation
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      isAnonymous: args.isAnonymous || false,
      role: "user",
      anonymousId: args.isAnonymous ? `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined,
    });

    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      name: args.name,
      image: args.image,
    });
  },
});