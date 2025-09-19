import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmergencyBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("emergencyBarVisible");
    if (stored !== null) {
      setIsVisible(JSON.parse(stored));
    }
  }, []);

  const hideBar = () => {
    setIsVisible(false);
    localStorage.setItem("emergencyBarVisible", "false");
    window.dispatchEvent(new CustomEvent("emergencyBarHidden"));
  };

  const showBar = () => {
    setIsVisible(true);
    localStorage.setItem("emergencyBarVisible", "true");
    window.dispatchEvent(new CustomEvent("emergencyBarShown"));
  };

  // Listen for show events
  useEffect(() => {
    const handleShow = () => showBar();
    window.addEventListener("showEmergencyBar", handleShow);
    return () => window.removeEventListener("showEmergencyBar", handleShow);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">
                Crisis Support Available 24/7
              </span>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <a
                  href="tel:988"
                  className="flex items-center gap-1 hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  988 (Suicide Prevention)
                </a>
                <a
                  href="sms:741741"
                  className="flex items-center gap-1 hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  Text HOME to 741741
                </a>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideBar}
              className="text-destructive-foreground hover:bg-destructive-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
