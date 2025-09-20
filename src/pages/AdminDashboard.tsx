import { useState } from "react";
import AdminHeader from "./admin/AdminHeader";
import DashboardTab from "./admin/DashboardTab";
import ForumTab from "./admin/ForumTab";
import SettingsTab from "./admin/SettingsTab";
import Navbar from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "forum" | "settings">("dashboard");

  const user = useQuery(api.users.currentUser, {});
  const isLoadingUser = user === undefined;
  const isAdmin =
    !!user && (user.role === "admin" || (user.email || "").toLowerCase() === "heckershershah@gmail.com");

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16">
        <AdminHeader activeTab={activeTab} onChangeTab={setActiveTab} />

        <main className="mx-auto max-w-7xl px-4 py-6">
          {isLoadingUser ? (
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-1">Loading admin session…</h2>
              <p className="text-sm text-muted-foreground">
                Verifying your admin access. This usually takes a moment.
              </p>
            </div>
          ) : !isAdmin ? (
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-1">Access denied</h2>
              <p className="text-sm text-muted-foreground">
                You need admin privileges to view this page.
              </p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <DashboardTab />}
              {activeTab === "forum" && <ForumTab />}
              {activeTab === "settings" && <SettingsTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
