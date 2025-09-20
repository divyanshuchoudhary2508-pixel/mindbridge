import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

type AnalyticsPayload = {
  totalAssessments: number;
  byType: Record<string, { avgScore: number; count: number }>;
  riskDistribution: Record<string, number>;
  recent: Array<{ assessmentType: string; score: number }>;
};

const EMPTY_ANALYTICS: AnalyticsPayload = {
  totalAssessments: 0,
  byType: {},
  riskDistribution: {},
  recent: [],
};

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Only admins or the bootstrap email can access analytics.
    const isAdmin =
      !!user &&
      (user.role === "admin" ||
        (user.email || "").toLowerCase() === "heckershershah@gmail.com");

    // During auth transitions or for non-admin users, return empty payload.
    if (!isAdmin) {
      return EMPTY_ANALYTICS;
    }

    // Recent scores (last 20)
    const recentDocs = await ctx.db
      .query("assessmentResults")
      .order("desc")
      .take(20);
    const recent: AnalyticsPayload["recent"] = recentDocs.map((d) => ({
      assessmentType: d.assessmentType,
      score: d.score,
    }));

    // Aggregate across all assessment results
    let totalAssessments = 0;
    const typeAgg: Record<
      string,
      { sum: number; count: number }
    > = Object.create(null);
    const riskAgg: Record<string, number> = Object.create(null);

    for await (const row of ctx.db.query("assessmentResults")) {
      totalAssessments += 1;

      // by type
      const t = row.assessmentType;
      if (!typeAgg[t]) typeAgg[t] = { sum: 0, count: 0 };
      typeAgg[t].sum += row.score;
      typeAgg[t].count += 1;

      // risk distribution
      const r = row.riskLevel;
      riskAgg[r] = (riskAgg[r] || 0) + 1;
    }

    const byType: AnalyticsPayload["byType"] = {};
    for (const [type, { sum, count }] of Object.entries(typeAgg)) {
      byType[type] = {
        avgScore: count ? sum / count : 0,
        count,
      };
    }

    const riskDistribution: AnalyticsPayload["riskDistribution"] = riskAgg;

    return {
      totalAssessments,
      byType,
      riskDistribution,
      recent,
    } satisfies AnalyticsPayload;
  },
});
