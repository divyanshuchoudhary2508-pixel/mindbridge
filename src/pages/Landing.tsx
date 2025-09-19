import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { 
  Brain, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  MessageCircle,
  FileText,
  Heart,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import CalmBackground from "@/components/CalmBackground";
import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingQuickActions from "@/components/landing/LandingQuickActions";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const [anonymousId, setAnonymousId] = useState("");
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Get reviews
  const reviews = useQuery(api.reviews.listRecent, { 
    page: "landing", 
    anonymousId 
  });
  
  const submitReview = useMutation(api.reviews.submitReview);
  const deleteReview = useMutation(api.reviews.deleteReview);
  const editReview = useMutation(api.reviews.editReview);

  useEffect(() => {
    // Generate or get anonymous ID
    let id = localStorage.getItem("anonymousId");
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("anonymousId", id);
    }
    setAnonymousId(id);

    // Remove pre-fill user data if authenticated (reverted to manual entry)
    if (user) {
      setName("");
      setEmail("");
    }

    // Listen for emergency bar events
    const handleEmergencyBarHidden = () => setShowEmergencyButton(true);
    const handleEmergencyBarShown = () => setShowEmergencyButton(false);
    
    window.addEventListener("emergencyBarHidden", handleEmergencyBarHidden);
    window.addEventListener("emergencyBarShown", handleEmergencyBarShown);
    
    return () => {
      window.removeEventListener("emergencyBarHidden", handleEmergencyBarHidden);
      window.removeEventListener("emergencyBarShown", handleEmergencyBarShown);
    };
  }, [user]);

  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast.error("Please provide a rating and comment");
      return;
    }

    try {
      // Revert to manual user-provided details
      await submitReview({
        anonymousId,
        rating,
        comment: comment.trim(),
        page: "landing",
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      
      toast.success("Thank you for your review!");
      setRating(0);
      setComment("");
      // Always clear name/email to keep manual entry flow
      setName("");
      setEmail("");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview({ reviewId: reviewId as any, anonymousId });
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleEditReview = async (review: any) => {
    const newComment = prompt("Edit your review comment:", review.comment) ?? "";
    if (!newComment.trim()) return;
    const newRatingStr = prompt("Edit your rating (1-5):", String(review.rating)) ?? "";
    const newRating = Number(newRatingStr);
    if (!Number.isFinite(newRating) || newRating < 1 || newRating > 5) return;
    try {
      await editReview({
        reviewId: review._id,
        anonymousId,
        rating: newRating,
        comment: newComment.trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success("Review updated");
    } catch {
      toast.error("Failed to update review");
    }
  };

  const showEmergencyBar = () => {
    window.dispatchEvent(new CustomEvent("showEmergencyBar"));
  };

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      
      <CalmBackground
        showVideo={window.innerWidth > 768}
        videoSrc="https://cdn.coverr.co/videos/coverr-a-photographer-in-the-woods-1701/1080p.mp4"
        posterSrc="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=3840&q=100"
      >
        {/* Hero Section */}
        <LandingHero />

        {/* Features Section */}
        <LandingFeatures />

        {/* Quick Actions */}
        <LandingQuickActions />

        {/* Reviews Section */}
        <section className="py-12 md:py-20 px-4 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                What Our Users Say
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Real experiences from people who've used our platform
              </p>
            </motion.div>

            {/* Recent Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="grid gap-4 md:gap-6 mb-8">
                {reviews.slice(0, 3).map((review) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="p-4 md:p-6 border-0 shadow-sm">
                      <CardContent className="p-0 space-y-2 md:space-y-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 md:h-4 md:w-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs md:text-sm text-muted-foreground">
                              {review.name || "Anonymous"}
                            </span>
                          </div>
                          {review.isMine && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditReview(review)}
                                className="neon-border"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{review.comment}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Review Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-4 md:p-6 border-0 shadow-sm">
                <CardContent className="p-0">
                  <h3 className="text-base md:text-lg font-semibold mb-4">Share Your Experience</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating</label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className="p-1"
                          >
                            <Star
                              className={`h-5 w-5 md:h-6 md:w-6 transition-colors ${
                                i < rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted-foreground hover:text-yellow-400"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Comment</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        className="min-h-[90px] md:min-h-[100px]"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Name (Optional)</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          disabled={false}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email (Optional)</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          disabled={false}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      disabled={!rating || !comment.trim()}
                      className="w-full"
                    >
                      Submit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 px-4 border-t bg-muted/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-xs md:text-sm text-muted-foreground space-y-2">
              <p className="leading-relaxed">© 2024 Anonymous Aid. Providing anonymous mental health support.</p>
              <p className="leading-relaxed">
                If you're in crisis, please call 988 (Suicide Prevention Lifeline) or text HOME to 741741.
              </p>
            </div>
          </div>
        </footer>
      </CalmBackground>
    </div>
  );
}