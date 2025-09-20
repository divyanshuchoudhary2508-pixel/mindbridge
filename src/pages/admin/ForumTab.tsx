import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ForumTab() {
  const [postText, setPostText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const anon = useMemo(() => {
    if (typeof window === "undefined") return "anon_server";
    const k = "anonymousId";
    let v = localStorage.getItem(k);
    if (!v) {
      v = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(k, v);
    }
    return v;
  }, []);

  const posts = useQuery(api.forum.listPosts, {});
  const createPost = useMutation(api.forum.createPost);
  const editPost = useMutation(api.forum.editPost);
  const deletePost = useMutation(api.forum.deletePost);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Community Forum</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Latest 50 posts</span>
          <Badge variant="secondary" className="text-xs">
            {posts ? posts.length : 0}
          </Badge>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4">
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value.slice(0, 500))}
          placeholder="Share your thoughts (max 500 characters)…"
          className="w-full min-h-[90px] bg-transparent outline-none text-sm"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{postText.length}/500</span>
          <Button
            size="sm"
            onClick={async () => {
              const body = postText.trim();
              if (!body) {
                toast("Post cannot be empty");
                return;
              }
              try {
                await createPost({ anonymousId: anon, content: body });
                setPostText("");
                toast("Posted");
              } catch (e: any) {
                toast(e?.message || "Failed to post");
              }
            }}
          >
            Post
          </Button>
        </div>
      </div>

      {!posts ? (
        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6 text-sm text-muted-foreground">
          Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-6 text-sm text-muted-foreground">
          No posts yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.map((p) => {
            const isMine = p.anonymousId === anon;
            const isEditing = editingId === String(p._id);
            return (
              <Card key={p._id} className="border-0 shadow-sm hover:shadow-md transition">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-semibold">{p.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p._creationTime).toLocaleString()}
                    </span>
                  </div>

                  {!isEditing ? (
                    <p className="text-sm text-muted-foreground">{p.content}</p>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value.slice(0, 500))}
                        className="w-full min-h-[80px] bg-transparent outline-none text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const body = editingText.trim();
                            if (!body) {
                              toast("Content cannot be empty");
                              return;
                            }
                            try {
                              await editPost({
                                postId: p._id,
                                anonymousId: anon,
                                content: body,
                              });
                              setEditingId(null);
                              setEditingText("");
                              toast("Post updated");
                            } catch (e: any) {
                              toast(e?.message || "Failed to update");
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditingText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    {p.isAnonymous ? "Anonymous" : "User"}
                  </div>

                  {isMine && !isEditing && (
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(String(p._id));
                          setEditingText(p.content);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          try {
                            await deletePost({ postId: p._id, anonymousId: anon });
                            toast("Post deleted");
                          } catch (e: any) {
                            toast(e?.message || "Failed to delete");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}