import { motion } from "framer-motion";
import { Shield, Clock, Brain, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingFeatures() {
  const features = [
    {
      icon: Shield,
      title: "100% Anonymous",
      description: "No registration required. Your privacy is our priority.",
      color: "text-primary",
    },
    {
      icon: Clock,
      title: "Quick Assessment",
      description: "Get your mental health score in just 5 minutes.",
      color: "text-accent",
    },
    {
      icon: Brain,
      title: "AI-Powered Support",
      description: "24/7 intelligent assistance with voice capabilities.",
      color: "text-secondary",
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with licensed mental health professionals.",
      color: "text-primary",
    },
  ] as const;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Anonymous Aid?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade mental health tools designed with your privacy and well-being in mind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-lg bg-muted mb-4 group-hover:glow transition-all duration-300 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
