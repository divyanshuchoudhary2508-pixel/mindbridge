import { motion } from "framer-motion";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageCircle, ArrowRight } from "lucide-react";

export default function LandingQuickActions() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Support Right Now
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the type of support that feels right for you today.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group cursor-pointer">
              <Link to="/assessment">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/20 text-primary group-hover:glow">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Take Assessment</h3>
                      <p className="text-muted-foreground">PHQ-9 & GAD-7 validated tools</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a professional assessment of your mental health with personalized recommendations.
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group cursor-pointer">
              <Link to="/chatbot">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-accent/20 text-accent group-hover:glow">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">AI Chat Support</h3>
                      <p className="text-muted-foreground">24/7 intelligent assistance</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Talk to our AI assistant about your feelings, get coping strategies, and crisis support.
                  </p>
                  <div className="flex items-center text-accent font-medium">
                    Start Chatting
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
