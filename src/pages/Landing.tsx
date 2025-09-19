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
        posterSrc="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=3840&q=80"
      >
        {/* Hero Section */}
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

        {/* Features Section */}
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
              {[
                {
                  icon: Shield,
                  title: "100% Anonymous",
                  description: "No registration required. Your privacy is our priority.",
                  color: "text-primary"
                },
                {
                  icon: Clock,
                  title: "Quick Assessment",
                  description: "Get your mental health score in just 5 minutes.",
                  color: "text-accent"
                },
                {
                  icon: Brain,
                  title: "AI-Powered Support",
                  description: "24/7 intelligent assistance with voice capabilities.",
                  color: "text-secondary"
                },
                {
                  icon: Users,
                  title: "Professional Network",
                  description: "Connect with licensed mental health professionals.",
                  color: "text-primary"
                }
              ].map((feature, index) => (
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

        {/* Quick Actions */}
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