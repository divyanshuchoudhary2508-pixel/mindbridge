import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      anonymousId: v.optional(v.string()), // for linking anonymous sessions
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Chat messages for AI chatbot
    chatMessages: defineTable({
      anonymousId: v.string(),
      userId: v.optional(v.id("users")),
      message: v.string(),
      isUser: v.boolean(),
      timestamp: v.number(),
    }).index("by_anonymous_id", ["anonymousId"])
      .index("by_user_id", ["userId"]),

    // Assessment results
    assessmentResults: defineTable({
      anonymousId: v.string(),
      userId: v.optional(v.id("users")),
      assessmentType: v.string(), // "PHQ-9", "GAD-7", etc.
      score: v.number(),
      riskLevel: v.string(), // "low", "moderate", "high", "severe"
      responses: v.array(v.number()),
      recommendations: v.array(v.string()),
      emailSent: v.optional(v.boolean()),
      emailSentAt: v.optional(v.number()),
    }).index("by_anonymous_id", ["anonymousId"])
      .index("by_user_id", ["userId"]),

    // Reviews for assessments and landing page
    reviews: defineTable({
      anonymousId: v.string(),
      userId: v.optional(v.id("users")),
      rating: v.number(), // 1-5 stars
      comment: v.string(),
      page: v.string(), // "landing", "assessment", etc.
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    }).index("by_page", ["page"])
      .index("by_anonymous_id", ["anonymousId"]),

    // Forum posts for peer support
    forumPosts: defineTable({
      anonymousId: v.string(),
      userId: v.optional(v.id("users")),
      title: v.string(),
      content: v.string(),
      isAnonymous: v.boolean(),
      replies: v.optional(v.number()),
    }).index("by_anonymous_id", ["anonymousId"]),

    // Forum replies
    forumReplies: defineTable({
      postId: v.id("forumPosts"),
      anonymousId: v.string(),
      userId: v.optional(v.id("users")),
      content: v.string(),
      isAnonymous: v.boolean(),
    }).index("by_post_id", ["postId"])
      .index("by_anonymous_id", ["anonymousId"]),

    // Mental health resources
    resources: defineTable({
      title: v.string(),
      description: v.string(),
      content: v.string(),
      type: v.string(), // "article", "video", "guide"
      category: v.string(), // "anxiety", "depression", "stress", etc.
      url: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      featured: v.optional(v.boolean()),
    }).index("by_category", ["category"])
      .index("by_type", ["type"]),

    // Appointments with professionals
    appointments: defineTable({
      userId: v.optional(v.id("users")),
      anonymousId: v.optional(v.string()),
      professionalName: v.string(),
      professionalEmail: v.string(),
      date: v.string(),
      time: v.string(),
      status: v.string(), // "pending", "confirmed", "cancelled"
      notes: v.optional(v.string()),
    }).index("by_user_id", ["userId"])
      .index("by_status", ["status"]),

    // Emergency contacts
    emergencyContacts: defineTable({
      name: v.string(),
      phone: v.string(),
      description: v.string(),
      country: v.string(),
      available24h: v.boolean(),
      category: v.string(), // "crisis", "suicide", "domestic", etc.
    }).index("by_country", ["country"])
      .index("by_category", ["category"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;