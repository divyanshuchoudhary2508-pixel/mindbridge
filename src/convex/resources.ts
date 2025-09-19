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
      },
      {
        title: "WHO Mental Health",
        description: "Global guidance and research on mental health.",
        content: "Authoritative resources and guidance from the World Health Organization.",
        type: "link",
        category: "global",
        url: "https://www.who.int/health-topics/mental-health",
        featured: true,
      },
      {
        title: "Mental Health America (MHA)",
        description: "US-based non-profit offering free screening tools, fact sheets, and support resources.",
        content: "Comprehensive educational content and screening tools.",
        type: "link",
        category: "info",
        url: "https://mhanational.org/",
      },
      {
        title: "National Institute of Mental Health (NIMH)",
        description: "Research-backed information on mental health disorders, treatments, and coping strategies.",
        content: "Evidence-based information and publications from NIMH.",
        type: "link",
        category: "info",
        url: "https://www.nimh.nih.gov/",
      },
      {
        title: "Mind (UK)",
        description: "Practical guides, helplines, and support for mental health.",
        content: "UK-based organization with practical resources and helplines.",
        type: "link",
        category: "info",
        url: "https://www.mind.org.uk/",
      },
      {
        title: "Active Minds",
        description: "Student-led org for mental health awareness.",
        content: "Programs and resources empowering young people.",
        type: "link",
        category: "students",
        url: "https://www.activeminds.org/",
        featured: true,
      },
      {
        title: "ULifeline",
        description: "Self-evaluation tools and coping tips for college students.",
        content: "Mental health resources tailored for higher education.",
        type: "link",
        category: "students",
        url: "https://www.ulifeline.org/",
      },
      {
        title: "The Jed Foundation (JED)",
        description: "Protecting emotional health of teens and young adults with campus programs.",
        content: "Student-focused mental health initiatives and resources.",
        type: "link",
        category: "students",
        url: "https://jedfoundation.org/",
      },
      {
        title: "7 Cups",
        description: "Free anonymous online chat with trained listeners & affordable therapy.",
        content: "Peer support and affordable professional counseling options.",
        type: "link",
        category: "self-help",
        url: "https://www.7cups.com/",
      },
      {
        title: "BetterHelp",
        description: "Online counseling with licensed therapists (paid service).",
        content: "Professional therapy online with licensed providers.",
        type: "link",
        category: "professional",
        url: "https://www.betterhelp.com/",
        featured: true,
      },
      {
        title: "Calm",
        description: "Meditation, sleep, and relaxation app.",
        content: "Tools for mindfulness, sleep, and stress reduction.",
        type: "link",
        category: "self-help",
        url: "https://www.calm.com/",
      },
      {
        title: "Headspace",
        description: "Mindfulness and guided meditation designed for stress and focus.",
        content: "Meditation and mental wellness for daily life.",
        type: "link",
        category: "self-help",
        url: "https://www.headspace.com/",
      },
      {
        title: "Find a Helpline",
        description: "Global directory of suicide hotlines and crisis support by country.",
        content: "International crisis helplines you can contact immediately.",
        type: "link",
        category: "emergency",
        url: "https://findahelpline.com/",
        featured: true,
      },
      {
        title: "Crisis Text Line",
        description: "Free 24/7 support in the US/UK/Canada via SMS/text.",
        content: "Text HOME to 741741 (US) for immediate help.",
        type: "link",
        category: "emergency",
        url: "https://www.crisistextline.org/",
      },
    ];

    for (const resource of resources) {
      await ctx.db.insert("resources", resource);
    }
  },
});