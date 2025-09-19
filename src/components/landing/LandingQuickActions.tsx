import { motion } from "framer-motion";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageCircle, Calendar, ArrowRight } from "lucide-react";

export default function LandingQuickActions() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the support option that feels right for you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="p-6 h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="p-3 rounded-lg bg-blue-100 w-fit mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mental Health Assessment</h3>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Take our validated PHQ-9 and GAD-7 assessments to understand your mental health status.
                </p>
                <Link to="/assessment" className="mt-auto">
                  <Button variant="outline" className="w-full">
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Card className="p-6 h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="p-3 rounded-lg bg-green-100 w-fit mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Consultation</h3>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Book a free consultation with our licensed mental health professionals.
                </p>
                <Link to="/appointments" className="mt-auto">
                  <Button className="w-full">
                    Book Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-6 h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="p-3 rounded-lg bg-purple-100 w-fit mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Chat Support</h3>
                <p className="text-muted-foreground mb-4 flex-grow">
                  Get immediate support from our AI assistant, available 24/7 for crisis support.
                </p>
                <Link to="/chatbot" className="mt-auto">
                  <Button variant="outline" className="w-full">
                    Chat Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}