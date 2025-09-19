import { motion } from "framer-motion";
import { Link } from "react-router";
import { Heart, MessageCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LandingHero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="secondary" className="mb-6 neon-border">
            <Heart className="h-3 w-3 mr-1" />
            100% Anonymous & Free
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Mental Health Support
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Discover Your Mental Health Score in Minutes
          </p>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Quick, anonymous self-assessments with AI-powered support.
            Get personalized insights and connect with professional help when you need it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assessment">
              <Button size="lg" className="glow group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/chatbot">
              <Button variant="outline" size="lg" className="neon-border">
                <MessageCircle className="mr-2 h-5 w-5" />
                Talk to AI Assistant
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
