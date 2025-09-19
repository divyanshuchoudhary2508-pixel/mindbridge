import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Forum() {
  const [anonymousId, setAnonymousId] = useState("");
  const [content, setContent] = useState("");

  // Add: character limit for better UX
  const MAX_LEN = 500;
  const remaining = MAX_LEN - content.length;

  useEffect(() => {
    let id = localStorage.getItem("anonymousId");
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("anonymousId", id);
    }
    setAnonymousId(id);
  }, []);

  const posts = useQuery(api.forum.listPosts, {});
  const createPost = useMutation(api.forum.createPost);
  const editPost = useMutation(api.forum.editPost);
  const deletePost = useMutation(api.forum.deletePost);

  const handleCreate = async () => {
    const text = content.trim();
    if (!text) return;
    await createPost({ anonymousId, content: text });
    setContent("");
  };

  const handleEdit = async (post: any) => {
    const next = prompt("Edit your post:", post.content);
    if (next === null) return;
    const text = next.trim();
    if (!text) return;
    await editPost({ postId: post._id, anonymousId, content: text });
  };

  const handleDelete = async (postId: string) => {
    await deletePost({ postId: postId as any, anonymousId });
  };

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Enhance: Header card with live count and tighter copy */}
          <Card className="bg-card/80 backdrop-blur-sm border-border neon-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1 gradient-text">Community Forum</h1>
                  <p className="text-muted-foreground text-sm">
                    Share experiences and support each other in a safe, anonymous space.
                  </p>
                </div>
                <Badge variant="secondary" className="neon-border">
                  {(posts || []).length} Posts
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Enhance: Composer with limit + subtle toolbar */}
          <Card className="bg-card/70 border-border/60 hover:bg-card/80 transition-colors">
            <CardContent className="p-6 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
                placeholder="Share something supportive or helpful..."
                className="min-h-[120px] glow focus-visible:outline-none"
                maxLength={MAX_LEN}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Be kind. No personal information or harmful content.</span>
                <span className={remaining < 30 ? "text-destructive" : ""}>
                  {remaining} characters left
                </span>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreate} disabled={!content.trim()} className="glow">
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhance: Posts list with motion + visual hierarchy */}
          <div className="space-y-4">
            {(posts || []).length === 0 && (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-6 text-sm text-muted-foreground text-center">
                  No posts yet. Be the first to share.
                </CardContent>
              </Card>
            )}

            {(posts || []).map((p: any, idx: number) => {
              const isMine = p.anonymousId === anonymousId;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                >
                  <Card className="bg-card/60 border-border/50 hover:bg-card/70 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold glow">
                            A
                          </div>
                          <div>
                            <div className="font-semibold">Anonymous</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(p._creationTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {isMine && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="neon-border"
                              onClick={() => handleEdit(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(p._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-sm leading-relaxed">{p.content}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}