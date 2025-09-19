import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();

  const analytics = useQuery(api.admin.getAnalytics, {});

  const isAdmin = !!user && user.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">Admin Analytics</h1>
            <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="h-4 w-4" />
              Anonymous-only insights
            </div>
          </div>

          {!isAuthenticated ? (
            <Alert>
              <AlertTitle>Authentication required</AlertTitle>
              <AlertDescription>Please sign in with an admin account to access analytics.</AlertDescription>
            </Alert>
          ) : !isAdmin ? (
            <Alert>
              <AlertTitle>Access denied</AlertTitle>
              <AlertDescription>
                You don't have permission to view this page. Ask an existing admin to grant access.
              </AlertDescription>
            </Alert>
          ) : analytics === undefined ? (
            <Card>
              <CardHeader>
                <CardTitle>Loading analytics…</CardTitle>
                <CardDescription>Fetching anonymized usage metrics</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Please wait…</CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Total Assessments</CardTitle>
                    <CardDescription>Aggregate count (anonymous)</CardDescription>
                  </CardHeader>
                  <CardContent className="text-3xl font-semibold">
                    {analytics.totalAssessments}
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm md:col-span-2">
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription>Across all assessments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.keys(analytics.riskDistribution).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data yet.</p>
                    ) : (
                      Object.entries(analytics.riskDistribution).map(([level, count]) => {
                        const total = analytics.totalAssessments || 1;
                        const pct = Math.min(100, Math.round((count / total) * 100));
                        return (
                          <div key={level}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{level}</span>
                              <span className="text-muted-foreground">{count} ({pct}%)</span>
                            </div>
                            <Progress value={pct} />
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Averages by Assessment
                    </CardTitle>
                    <CardDescription>Average score and counts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.keys(analytics.byType).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No assessments recorded yet.</p>
                    ) : (
                      Object.entries(analytics.byType).map(([type, data]) => (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{type}</span>
                            <span className="text-muted-foreground">{data.count} taken</span>
                          </div>
                          <div className="text-sm">Average score: <span className="font-medium">{data.avgScore}</span></div>
                          <Separator />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Assessment Scores</CardTitle>
                    <CardDescription>Last 20 assessments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analytics.recent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent activity.</p>
                    ) : (
                      <div className="space-y-2">
                        {analytics.recent.map((r, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">{r.assessmentType}</div>
                            <div className="font-medium">Score: {r.score}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
