import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Star } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";

type AssessmentType = "PHQ-9" | "GAD-7";

export default function Assessment() {
  const { user } = useAuth();
  const [anonymousId, setAnonymousId] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const assessmentData = useQuery(
    api.assessments.getAssessmentQuestions,
    selectedAssessment ? { type: selectedAssessment } : "skip"
  );

  const reviews = useQuery(api.reviews.listRecent, { 
    page: "assessment", 
    anonymousId 
  });

  const submitAssessment = useMutation(api.assessments.submitAssessment);
  const submitReview = useMutation(api.reviews.submitReview);
  const deleteReview = useMutation(api.reviews.deleteReview);
  const editReview = useMutation(api.reviews.editReview);

  useEffect(() => {
    let id = localStorage.getItem("anonymousId");
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("anonymousId", id);
    }
    setAnonymousId(id);

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const startAssessment = (type: AssessmentType) => {
    setSelectedAssessment(type);
    setCurrentQuestion(0);
    setResponses([]);
    setIsComplete(false);
    setResult(null);
  };

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (assessmentData && currentQuestion < assessmentData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeAssessment = async () => {
    if (!selectedAssessment || !anonymousId) return;

    try {
      const result = await submitAssessment({
        anonymousId,
        assessmentType: selectedAssessment,
        responses,
      });
      
      setResult(result);
      setIsComplete(true);
      toast.success("Assessment completed!");
    } catch (error) {
      toast.error("Failed to submit assessment");
    }
  };

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
        page: "assessment",
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      
      toast.success("Thank you for your review!");
      setRating(0);
      setComment("");
      setShowReviewForm(false);
      if (!user) {
        setName("");
        setEmail("");
      }
    } catch (error) {
      toast.error("Failed to submit review");
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

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview({ reviewId: reviewId as any, anonymousId });
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const getQuickMicroSteps = (assessmentType: AssessmentType, riskLevel: string) => {
    const steps = {
      "PHQ-9": {
        low: ["Take a 5-minute walk", "Practice deep breathing", "Call a friend"],
        mild: ["Journal for 10 minutes", "Do a mindfulness exercise", "Get sunlight"],
        moderate: ["Schedule self-care time", "Consider talking to someone", "Maintain sleep routine"],
        "moderately severe": ["Reach out for support", "Consider professional help", "Practice grounding techniques"],
        severe: ["Contact a mental health professional", "Reach out to crisis support", "Stay with trusted people"]
      },
      "GAD-7": {
        low: ["Practice 4-7-8 breathing", "Try progressive muscle relaxation", "Limit caffeine"],
        mild: ["Use grounding techniques", "Practice mindfulness", "Exercise regularly"],
        moderate: ["Learn anxiety management", "Consider therapy", "Practice relaxation daily"],
        severe: ["Seek professional help", "Learn coping strategies", "Consider medication consultation"]
      }
    } as const;

    if (assessmentType === "PHQ-9") {
      const arr = steps["PHQ-9"][riskLevel as keyof typeof steps["PHQ-9"]];
      return arr ? [...arr] : [];
    } else {
      const arr = steps["GAD-7"][riskLevel as keyof typeof steps["GAD-7"]];
      return arr ? [...arr] : [];
    }
  };

  if (isComplete && result) {
    const microSteps = getQuickMicroSteps(selectedAssessment!, result.riskLevel);
    
    return (
      <div className="min-h-screen bg-background">
        <EmergencyBar />
        <Navbar />
        
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border neon-border">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="mx-auto mb-4"
                  >
                    <CheckCircle className="h-16 w-16 text-primary glow" />
                  </motion.div>
                  <CardTitle className="text-2xl gradient-text">Assessment Complete</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{result.score}</div>
                    <div className="text-lg text-muted-foreground">Your Mental Health Score</div>
                    <Badge 
                      variant={result.riskLevel === 'severe' ? 'destructive' : 'secondary'}
                      className="mt-2"
                    >
                      {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk Level
                    </Badge>
                  </div>

                  {microSteps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quick Micro-Steps</h3>
                      <div className="grid gap-2">
                        {microSteps.map((step: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span>{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {result.recommendations.map((rec: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          {rec}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {user && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm">
                        📧 Your detailed results have been sent to your email address.
                        Check your inbox for personalized insights and next steps.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => {
                        setSelectedAssessment(null);
                        setIsComplete(false);
                        setResult(null);
                      }}
                      variant="outline"
                      className="flex-1 neon-border"
                    >
                      Take Another Assessment
                    </Button>
                    <Link to="/appointments" className="flex-1">
                      <Button className="w-full glow">
                        Book Professional Support
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      Share Your Experience
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Review Form */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6"
                >
                  <Card className="bg-card/80 backdrop-blur-sm border-border">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Rate This Assessment</h3>
                      
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
                            placeholder="How was your assessment experience?"
                            className="min-h-[80px]"
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

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitReview}
                            disabled={!rating || !comment.trim()}
                            className="glow"
                          >
                            Submit Review
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowReviewForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Reviews */}
            {reviews && reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <Card key={review._id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
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
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedAssessment && assessmentData) {
    const progress = ((currentQuestion + 1) / assessmentData.questions.length) * 100;
    const estimatedTime = Math.max(1, assessmentData.questions.length - currentQuestion);

    return (
      <div className="min-h-screen bg-background">
        <EmergencyBar />
        <Navbar />
        
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border neon-border">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="gradient-text">{assessmentData.title}</CardTitle>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{estimatedTime} min
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Question {currentQuestion + 1} of {assessmentData.questions.length}</span>
                      <span>{Math.round(progress)}% complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assessmentData.description}
                    </p>
                    
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-medium mb-4">
                        {assessmentData.questions[currentQuestion]}
                      </h3>
                      
                      <div className="space-y-2">
                        {assessmentData.options.map((option: { value: number; label: string }) => (
                          <button
                            key={option.value}
                            onClick={() => handleResponse(option.value)}
                            className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                              responses[currentQuestion] === option.value
                                ? "bg-primary/20 border-primary text-primary glow"
                                : "bg-muted/50 border-border hover:bg-muted hover:border-primary/50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                      className="neon-border"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={nextQuestion}
                      disabled={responses[currentQuestion] === undefined}
                      className="glow"
                    >
                      {currentQuestion === assessmentData.questions.length - 1 ? "Complete" : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Mental Health Assessment
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take a validated assessment to understand your mental health better. 
              Get personalized insights and recommendations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border hover:bg-card/90 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:glow">
                      <span className="text-2xl font-bold">PHQ</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Depression Assessment</h3>
                    <p className="text-muted-foreground text-sm">PHQ-9 Questionnaire</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>5-7 minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>9 questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Clinically validated</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    Assess symptoms of depression over the past two weeks using the 
                    Patient Health Questionnaire (PHQ-9).
                  </p>
                  
                  <Button
                    onClick={() => startAssessment("PHQ-9")}
                    className="w-full glow"
                  >
                    Start Depression Assessment
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border hover:bg-card/90 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:glow">
                      <span className="text-2xl font-bold">GAD</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Anxiety Assessment</h3>
                    <p className="text-muted-foreground text-sm">GAD-7 Questionnaire</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>3-5 minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span>7 questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span>Clinically validated</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    Evaluate anxiety symptoms over the past two weeks using the 
                    Generalized Anxiety Disorder (GAD-7) scale.
                  </p>
                  
                  <Button
                    onClick={() => startAssessment("GAD-7")}
                    className="w-full glow"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    Start Anxiety Assessment
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                    <p className="font-medium mb-1">Answer Questions</p>
                    <p className="text-muted-foreground">Respond honestly about your recent experiences</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                    <p className="font-medium mb-1">Get Your Score</p>
                    <p className="text-muted-foreground">Receive your mental health score and risk level</p>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                    <p className="font-medium mb-1">Personalized Insights</p>
                    <p className="text-muted-foreground">Get recommendations and next steps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}