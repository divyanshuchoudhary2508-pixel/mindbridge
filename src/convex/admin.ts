import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    // Allow access if role is admin OR email matches bootstrap admin
    const isBootstrapAdmin = !!user?.email && user.email.toLowerCase() === "heckershershah@gmail.com";
    if (!user || (user.role !== "admin" && !isBootstrapAdmin)) {
      return {
        totalAssessments: 0,
        byType: {},
        riskDistribution: {},
        recent: [],
      };
    }

    // Aggregate assessment results
    const results = await ctx.db.query("assessmentResults").collect();

    let totalAssessments = 0;
    let byType: Record<string, { count: number; totalScore: number; avgScore: number }> = {};
    let riskDistribution: Record<string, number> = {};
    const recentScores: Array<{ assessmentType: string; score: number; _creationTime: number }> = [];

    for (const r of results) {
      totalAssessments++;
      // by type
      if (!byType[r.assessmentType]) {
        byType[r.assessmentType] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      byType[r.assessmentType].count += 1;
      byType[r.assessmentType].totalScore += r.score;
      // risk
      riskDistribution[r.riskLevel] = (riskDistribution[r.riskLevel] || 0) + 1;
      // recent trends (keep last 50)
      recentScores.push({
        assessmentType: r.assessmentType,
        score: r.score,
        _creationTime: r._creationTime,
      });
    }

    for (const key of Object.keys(byType)) {
      const t = byType[key];
      t.avgScore = t.count > 0 ? Number((t.totalScore / t.count).toFixed(2)) : 0;
    }

    recentScores.sort((a, b) => b._creationTime - a._creationTime);
    const recent = recentScores.slice(0, 20);

    return {
      totalAssessments,
      byType,
      riskDistribution,
      recent,
    };
  },
});