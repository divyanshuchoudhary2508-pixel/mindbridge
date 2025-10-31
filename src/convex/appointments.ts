import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// List current user's appointments (latest first)
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    // For authenticated users, fetch by userId
    if (user?._id) {
      const rows = await ctx.db
        .query("appointments")
        .withIndex("by_user_id", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
      return rows;
    }
    
    // For anonymous users, we can't fetch from backend without passing anonymousId
    // Return empty array - frontend will handle this differently
    return [];
  },
});

// New query: List appointments by anonymous ID
export const listByAnonymousId = query({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("anonymousId"), args.anonymousId))
      .order("desc")
      .collect();
    return rows;
  },
});

// Create a new appointment request
export const create = mutation({
  args: {
    date: v.string(), // ISO date string (YYYY-MM-DD)
    time: v.string(), // HH:MM
    counselorName: v.optional(v.string()),
    counselorEmail: v.optional(v.string()),
    reason: v.string(),
    contact: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Allow both authenticated users and anonymous users
    const userId = user?._id;
    const anonymousId = args.anonymousId || undefined;

    if (!args.date || !args.time || !args.reason.trim()) {
      throw new Error("Date, time, and reason are required.");
    }

    const id = await ctx.db.insert("appointments", {
      userId: userId,
      anonymousId: anonymousId,
      professionalName: args.counselorName ?? "",
      professionalEmail: args.counselorEmail ?? "",
      date: args.date,
      time: args.time,
      status: "pending",
      notes: args.reason.trim(),
    });

    return id;
  },
});

// Cancel an appointment (owner only)
export const cancel = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?._id) throw new Error("Not authenticated");

    const appt = await ctx.db.get(args.appointmentId);
    if (!appt) throw new Error("Appointment not found");
    if (appt.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.appointmentId, { status: "cancelled" });
  },
});

// Reschedule an appointment (owner only)
export const reschedule = mutation({
  args: {
    appointmentId: v.id("appointments"),
    newDate: v.string(),
    newTime: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user?._id) throw new Error("Not authenticated");

    const appt = await ctx.db.get(args.appointmentId);
    if (!appt) throw new Error("Appointment not found");
    if (appt.userId !== user._id) throw new Error("Unauthorized");
    if (!args.newDate || !args.newTime) throw new Error("New date and time are required");

    await ctx.db.patch(args.appointmentId, {
      date: args.newDate,
      time: args.newTime,
      status: appt.status === "cancelled" ? "pending" : appt.status,
    });
  },
});