import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdminHeader from "@/pages/admin/AdminHeader";
import DashboardTab from "@/pages/admin/DashboardTab";
import ForumTab from "@/pages/admin/ForumTab";
import SettingsTab from "@/pages/admin/SettingsTab";

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "forum" | "settings">("dashboard");

  const isAdmin =
    !!user &&
    (user.role === "admin" ||
      (user.email && user.email.toLowerCase() === "heckershershah@gmail.com"));

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader activeTab={activeTab} onChangeTab={setActiveTab} />
      <div className="pt-6 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {!isAuthenticated ? (
            <Alert>
              <AlertTitle>Authentication required</AlertTitle>
              <AlertDescription>
                Please sign in with an admin account to access the admin module.
              </AlertDescription>
            </Alert>
          ) : user == null ? (
            <Alert>
              <AlertTitle>Loading admin session…</AlertTitle>
              <AlertDescription>Verifying access</AlertDescription>
            </Alert>
          ) : !isAdmin ? (
            <Alert>
              <AlertTitle>Access denied</AlertTitle>
              <AlertDescription>
                You don't have permission to view this section. Ask an existing admin to grant access.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {activeTab === "dashboard" && <DashboardTab />}
              {activeTab === "forum" && <ForumTab />}
              {activeTab === "settings" && <SettingsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}