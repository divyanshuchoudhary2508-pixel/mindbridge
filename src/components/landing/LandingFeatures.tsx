import { motion } from "framer-motion";
import { Shield, Clock, Brain, Users, Heart, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LandingFeatures() {
  const features = [
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your identity remains anonymous throughout your entire journey with us.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Clock,
      title: "Quick Assessment",
      description: "Professional mental health screening in just 5 minutes with validated tools.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Brain,
      title: "AI-Powered Support",
      description: "Intelligent 24/7 assistance with advanced mental health understanding.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Users,
      title: "Expert Network",
      description: "Connect with licensed mental health professionals for personalized care.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ] as const;

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade mental health tools designed with your privacy and well-being in mind
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
              <Card className="h-full p-6 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}