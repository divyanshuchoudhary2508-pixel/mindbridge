import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getResources = query({
  args: { 
    category: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const category = args.category!;
      return await ctx.db
        .query("resources")
        .withIndex("by_category", (q) => q.eq("category", category))
        .order("desc")
        .collect();
    } else if (args.type) {
      const type = args.type!;
      return await ctx.db
        .query("resources")
        .withIndex("by_type", (q) => q.eq("type", type))
        .order("desc")
        .collect();
    }
    
    return await ctx.db.query("resources").order("desc").collect();
  },
});

export const getFeaturedResources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("resources")
      .filter((q) => q.eq(q.field("featured"), true))
      .order("desc")
      .take(6);
  },
});

// Seed some initial resources
export const seedResources = mutation({
  args: {},
  handler: async (ctx) => {
    const resources = [
      {
        title: "Understanding Anxiety: A Complete Guide",
        description: "Learn about anxiety symptoms, causes, and effective coping strategies.",
        content: "Anxiety is a natural response to stress, but when it becomes overwhelming...",
        type: "article",
        category: "anxiety",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400"
      },
      {
        title: "Depression: Signs, Symptoms, and Support",
        description: "Comprehensive information about depression and available treatments.",
        content: "Depression affects millions of people worldwide...",
        type: "article", 
        category: "depression",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
      },
      {
        title: "Mindfulness Meditation for Beginners",
        description: "A gentle introduction to mindfulness practices for mental wellness.",
        content: "Mindfulness meditation can help reduce stress and improve mental clarity...",
        type: "guide",
        category: "mindfulness",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
      },
      {
        title: "Breathing Exercises for Stress Relief",
        description: "Simple breathing techniques you can use anywhere to manage stress.",
        content: "Deep breathing exercises are one of the most effective ways to reduce stress...",
        type: "guide",
        category: "stress",
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
      }
    ];
    
    for (const resource of resources) {
      await ctx.db.insert("resources", resource);
    }
  },
});