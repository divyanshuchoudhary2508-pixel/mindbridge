import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// PHQ-9 Depression Assessment
export const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

// GAD-7 Anxiety Assessment
export const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

export const getAssessmentQuestions = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    if (args.type === "PHQ-9") {
      return {
        title: "PHQ-9 Depression Assessment",
        description: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
        questions: PHQ9_QUESTIONS,
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      };
    } else if (args.type === "GAD-7") {
      return {
        title: "GAD-7 Anxiety Assessment",
        description: "Over the last 2 weeks, how often have you been bothered by the following problems?",
        questions: GAD7_QUESTIONS,
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      };
    }
    
    throw new Error("Unknown assessment type");
  },
});

export const submitAssessment = mutation({
  args: {
    anonymousId: v.string(),
    assessmentType: v.string(),
    responses: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Calculate score
    const score = args.responses.reduce((sum, response) => sum + response, 0);
    
    // Determine risk level and recommendations
    let riskLevel = "low";
    let recommendations: string[] = [];
    
    if (args.assessmentType === "PHQ-9") {
      if (score >= 20) {
        riskLevel = "severe";
        recommendations = [
          "Consider seeking immediate professional help",
          "Contact a mental health professional or your doctor",
          "Reach out to trusted friends or family members",
          "Consider calling a crisis helpline if you're having thoughts of self-harm"
        ];
      } else if (score >= 15) {
        riskLevel = "moderately severe";
        recommendations = [
          "Consider speaking with a mental health professional",
          "Maintain regular sleep and exercise routines",
          "Stay connected with supportive people",
          "Consider therapy or counseling"
        ];
      } else if (score >= 10) {
        riskLevel = "moderate";
        recommendations = [
          "Monitor your symptoms closely",
          "Consider lifestyle changes like regular exercise",
          "Practice stress management techniques",
          "Consider speaking with a counselor if symptoms persist"
        ];
      } else if (score >= 5) {
        riskLevel = "mild";
        recommendations = [
          "Continue monitoring your mood",
          "Maintain healthy lifestyle habits",
          "Practice self-care activities",
          "Stay connected with friends and family"
        ];
      } else {
        recommendations = [
          "Continue your current self-care practices",
          "Maintain healthy lifestyle habits",
          "Stay aware of your mental health"
        ];
      }
    } else if (args.assessmentType === "GAD-7") {
      if (score >= 15) {
        riskLevel = "severe";
        recommendations = [
          "Consider seeking professional help for anxiety management",
          "Learn and practice relaxation techniques",
          "Consider therapy or counseling",
          "Speak with your doctor about treatment options"
        ];
      } else if (score >= 10) {
        riskLevel = "moderate";
        recommendations = [
          "Practice anxiety management techniques",
          "Consider speaking with a mental health professional",
          "Try relaxation exercises like deep breathing",
          "Maintain regular exercise and sleep routines"
        ];
      } else if (score >= 5) {
        riskLevel = "mild";
        recommendations = [
          "Monitor your anxiety levels",
          "Practice stress management techniques",
          "Maintain healthy lifestyle habits",
          "Consider mindfulness or meditation"
        ];
      } else {
        recommendations = [
          "Continue your current wellness practices",
          "Stay aware of your stress levels",
          "Maintain healthy coping strategies"
        ];
      }
    }
    
    // Save assessment result
    const resultId = await ctx.db.insert("assessmentResults", {
      anonymousId: args.anonymousId,
      userId: user?._id,
      assessmentType: args.assessmentType,
      score,
      riskLevel,
      responses: args.responses,
      recommendations,
      emailSent: false,
    });
    
    return {
      id: resultId,
      score,
      riskLevel,
      recommendations,
    };
  },
});

export const getAssessmentResult = query({
  args: { resultId: v.id("assessmentResults") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resultId);
  },
});

export const getUserAssessments = query({
  args: { anonymousId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessmentResults")
      .withIndex("by_anonymous_id", (q) => q.eq("anonymousId", args.anonymousId))
      .order("desc")
      .collect();
  },
});
