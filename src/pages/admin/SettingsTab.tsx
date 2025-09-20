import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsTab() {
  const { signOut } = useAuth();

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">Settings</h2>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Your theme is controlled globally via the site settings.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the main site's theme toggle (top-right of the public site) to switch light/dark. The
          admin console adapts automatically.
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Manage your admin account access</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
