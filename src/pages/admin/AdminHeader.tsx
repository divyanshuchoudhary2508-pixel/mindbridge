import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquare, Settings as SettingsIcon } from "lucide-react";

type Props = {
  activeTab: "dashboard" | "forum" | "settings";
  onChangeTab: (tab: "dashboard" | "forum" | "settings") => void;
};

export default function AdminHeader({ activeTab, onChangeTab }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground leading-tight">Silent Sanctuary</div>
            <h1 className="text-lg font-semibold leading-tight">Admin Console</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            size="sm"
            onClick={() => onChangeTab("dashboard")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "forum" ? "default" : "outline"}
            size="sm"
            onClick={() => onChangeTab("forum")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Forum
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            size="sm"
            onClick={() => onChangeTab("settings")}
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}