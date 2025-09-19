import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { Card, CardContent } from "@/components/ui/card";

export default function Emergency() {
  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold mb-2">Emergency Support</h1>
              <p className="text-muted-foreground">
                If you’re in immediate danger, please call your local emergency number.
              </p>
              <div className="mt-6 text-sm text-muted-foreground">
                Emergency directory coming soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
