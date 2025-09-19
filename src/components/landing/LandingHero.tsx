import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-3xl md:text-6xl font-bold text-foreground">
              Professional Mental Health
              <span className="block text-primary">Support & Care</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get personalized mental health assessments, AI-powered support, and connect with licensed professionals - all anonymously and free.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link to="/appointments">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base md:text-lg">
                Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/assessment">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base md:text-lg">
                Take Assessment
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-2 md:h-2 bg-blue-500 rounded-full"></div>
              <span>Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 md:w-2 md:h-2 bg-purple-500 rounded-full"></div>
              <span>24/7 AI Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}