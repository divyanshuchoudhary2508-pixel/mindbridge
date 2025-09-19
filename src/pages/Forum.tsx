import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function Forum() {
  const [anonymousId, setAnonymousId] = useState("");
  const [content, setContent] = useState("");

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
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted-foreground">
                Share experiences and support each other in a safe, anonymous space.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardContent className="p-6 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share something..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleCreate} disabled={!content.trim()} className="glow">
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {(posts || []).length === 0 && (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No posts yet. Be the first to share.
                </CardContent>
              </Card>
            )}

            {(posts || []).map((p: any) => {
              const isMine = p.anonymousId === anonymousId;
              return (
                <Card key={p._id} className="bg-card/60 border-border/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{p.name || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p._creationTime).toLocaleString()}
                        </div>
                      </div>
                      {isMine && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="neon-border" onClick={() => handleEdit(p)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p._id)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm">{p.content}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}