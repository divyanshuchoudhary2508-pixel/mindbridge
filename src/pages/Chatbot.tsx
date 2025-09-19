import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { Card, CardContent } from "@/components/ui/card";

export default function Chatbot() {
  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-8 text-center">
              <h1 className="text-3xl font-bold mb-2">AI Chat Support</h1>
              <p className="text-muted-foreground">
                Start a conversation to get supportive guidance and coping strategies.
              </p>
              <div className="mt-6 text-sm text-muted-foreground">
                This feature is coming soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
