import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Shield, Star } from "lucide-react";

const COLORS = {
  depression: "oklch(60% 0.1 260)",
  anxiety: "oklch(65% 0.12 170)",
  stress: "oklch(70% 0.12 30)",
  low: "oklch(85% 0.05 160)",
  mild: "oklch(80% 0.12 120)",
  moderate: "oklch(75% 0.14 90)",
  "moderately severe": "oklch(65% 0.14 40)",
  severe: "oklch(55% 0.16 20)",
  accent: "oklch(70% 0.12 330)",
} as const;

export default function DashboardTab() {
  const analytics = useQuery(api.admin.getAnalytics, {});
  const recentReviews = useQuery(api.reviews.listAllRecent, {});

  const riskData = useMemo(
    () =>
      (analytics
        ? Object.entries(analytics.riskDistribution).map(([name, value]) => ({
            name,
            value: Number(value),
          }))
        : []) as Array<{ name: string; value: number }>,
    [analytics]
  );

  const typeData = useMemo(
    () =>
      (analytics
        ? Object.entries(analytics.byType).map(([name, d]) => ({
            name,
            avgScore: d.avgScore,
            count: d.count,
          }))
        : []) as Array<{ name: string; avgScore: number; count: number }>,
    [analytics]
  );

  const recentData = useMemo(() => {
    if (!analytics || analytics.recent.length === 0) return [] as Array<any>;
    const types = Array.from(new Set(analytics.recent.map((r) => r.assessmentType)));
    const points: Array<any> = [];
    const reversed = [...analytics.recent].reverse();
    reversed.forEach((r, idx) => {
      const x = idx + 1;
      const existing = points[idx] || { x };
      types.forEach((t) => {
        existing[t] = existing[t] ?? 0;
      });
      existing[r.assessmentType] = r.score;
      points[idx] = existing;
    });
    return points;
  }, [analytics]);

  const recentKeys = useMemo(
    () => Array.from(new Set(analytics?.recent.map((r) => r.assessmentType) ?? [])),
    [analytics]
  );

  if (analytics === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading analytics…</CardTitle>
          <CardDescription>Fetching anonymized usage metrics</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Please wait…</CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Analytics Overview</h2>
        <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
          <Shield className="h-4 w-4" />
          Anonymous-only insights
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6 flex flex-col justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Assessments</div>
            <div className="text-4xl font-bold">{analytics.totalAssessments}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-4">Anonymous, aggregated usage</div>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
          <div className="text-sm text-muted-foreground mb-1">Assessment Types</div>
          <div className="text-4xl font-bold">{Object.keys(analytics.byType).length}</div>
          <div className="text-xs text-muted-foreground mt-4">Distinct assessments recorded</div>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
          <div className="text-sm text-muted-foreground mb-1">Dominant Risk Level</div>
          <div className="text-2xl font-semibold capitalize">
            {Object.keys(analytics.riskDistribution).length === 0
              ? "—"
              : Object.entries(analytics.riskDistribution).sort((a, b) => b[1] - a[1])[0][0]}
          </div>
          <div className="text-xs text-muted-foreground mt-4">Most frequent risk level by count</div>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Trends</div>
            <div className="text-lg font-semibold">Recent Scores by Assessment</div>
          </div>
        </div>
        <ChartContainer
          className="h-[320px]"
          config={{
            ...(recentKeys.includes("PHQ-9") && {
              phq: { label: "PHQ-9", color: COLORS.depression },
            }),
            ...(recentKeys.includes("GAD-7") && {
              gad: { label: "GAD-7", color: COLORS.anxiety },
            }),
          }}
        >
          <ResponsiveContainer>
            <AreaChart data={recentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="x" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              {recentKeys.includes("PHQ-9") && (
                <Area
                  type="monotone"
                  name="PHQ-9"
                  dataKey="PHQ-9"
                  stroke={COLORS.depression}
                  fill={COLORS.depression}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              )}
              {recentKeys.includes("GAD-7") && (
                <Area
                  type="monotone"
                  name="GAD-7"
                  dataKey="GAD-7"
                  stroke={COLORS.anxiety}
                  fill={COLORS.anxiety}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Distribution</div>
              <div className="text-lg font-semibold">Risk Levels</div>
            </div>
          </div>
          {riskData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {riskData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          COLORS[(entry.name as keyof typeof COLORS) || "accent"] || COLORS.accent
                        }
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Comparative</div>
              <div className="text-lg font-semibold">Average Scores by Assessment</div>
            </div>
          </div>
          {(typeData.length === 0 && (
            <p className="text-sm text-muted-foreground">No assessments recorded yet.</p>
          )) || (
            <div className="h-[320px]">
              <ResponsiveContainer>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-mono">{Number(value).toFixed(2)}</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.name.toLowerCase().includes("phq")
                            ? COLORS.depression
                            : entry.name.toLowerCase().includes("gad")
                            ? COLORS.anxiety
                            : COLORS.accent
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Feedback</div>
            <div className="text-lg font-semibold">Recent Reviews</div>
          </div>
        </div>
        {!recentReviews ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : recentReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent reviews.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentReviews.slice(0, 6).map((r) => (
              <Card key={r._id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{r.page}</span>
                  </div>
                  <p className="text-sm text-foreground">{r.comment}</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {r.name || "Anonymous"}
                    {r.email ? ` • ${r.email}` : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
