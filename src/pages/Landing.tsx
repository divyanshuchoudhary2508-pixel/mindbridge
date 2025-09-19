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

    // Pre-fill user data if authenticated
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
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
      if (!user) {
        setName("");
        setEmail("");
      }
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
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What People Are Saying
              </h2>
              <p className="text-lg text-muted-foreground">
                Real feedback from people who've used our platform.
              </p>
            </motion.div>

            {/* Recent Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="grid gap-4 mb-8">
                {reviews.slice(0, 3).map((review) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
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
                        <p className="text-sm">{review.comment}</p>
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>
                  
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
                              className={`h-6 w-6 transition-colors ${
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
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Name (Optional)</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email (Optional)</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      disabled={!rating || !comment.trim()}
                      className="w-full glow"
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
        <footer className="py-12 px-4 border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg gradient-text">Anonymous Aid</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/emergency" className="hover:text-foreground transition-colors">
                  Emergency Support
                </Link>
                <Link to="/resources" className="hover:text-foreground transition-colors">
                  Resources
                </Link>
                <Link to="/forum" className="hover:text-foreground transition-colors">
                  Community
                </Link>
              </div>

              {showEmergencyButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showEmergencyBar}
                  className="neon-border"
                >
                  Show Emergency Bar
                </Button>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
              <p>© 2024 Anonymous Aid. Providing anonymous mental health support.</p>
              <p className="mt-2">
                If you're in crisis, please call 988 (Suicide Prevention Lifeline) or text HOME to 741741.
              </p>
            </div>
          </div>
        </footer>
      </CalmBackground>
    </div>
  );
}