import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getEmergencyContacts = query({
  args: { country: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.country) {
      const country = args.country!;
      return await ctx.db
        .query("emergencyContacts")
        .withIndex("by_country", (q) => q.eq("country", country))
        .collect();
    }
    
    return await ctx.db.query("emergencyContacts").collect();
  },
});

export const seedEmergencyContacts = mutation({
  args: {},
  handler: async (ctx) => {
    const contacts = [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        description: "24/7 crisis support for people in suicidal crisis or emotional distress",
        country: "US",
        available24h: true,
        category: "suicide"
      },
      {
        name: "Crisis Text Line",
        phone: "741741",
        description: "Text HOME to 741741 for 24/7 crisis support via text message",
        country: "US", 
        available24h: true,
        category: "crisis"
      },
      {
        name: "National Domestic Violence Hotline",
        phone: "1-800-799-7233",
        description: "24/7 support for domestic violence survivors",
        country: "US",
        available24h: true,
        category: "domestic"
      },
      {
        name: "SAMHSA National Helpline",
        phone: "1-800-662-4357",
        description: "Treatment referral and information service for mental health and substance abuse",
        country: "US",
        available24h: true,
        category: "general"
      }
    ];
    
    for (const contact of contacts) {
      await ctx.db.insert("emergencyContacts", contact);
    }
  },
});