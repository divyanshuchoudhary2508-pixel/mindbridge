import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileText, PlayCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type Resource = {
  _id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  category: string;
  url?: string;
  imageUrl?: string;
  featured?: boolean;
};

const TYPE_ICON: Record<string, any> = {
  article: FileText,
  video: PlayCircle,
  guide: BookOpen,
};

export default function Resources() {
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Featured
  const featured = useQuery(api.resources.getFeaturedResources, {});

  // Build args respecting optional validators
  const args = useMemo(() => {
    if (category) return { category };
    if (type) return { type };
    return {};
  }, [category, type]);

  const list = useQuery(api.resources.getResources, args);

  // derive categories/types from list for filters
  const categories = useMemo(() => {
    const set = new Set<string>();
    (list || []).forEach((r: Resource) => set.add(r.category));
    return Array.from(set).sort();
  }, [list]);

  const types = useMemo(() => {
    const set = new Set<string>();
    (list || []).forEach((r: Resource) => set.add(r.type));
    return Array.from(set).sort();
  }, [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list || [];
    return (list || []).filter(
      (r: Resource) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [list, search]);

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">Resources</h1>
              <p className="text-muted-foreground">
                Curated articles, guides, and tools to support your mental wellness.
              </p>
            </CardContent>
          </Card>

          {featured && featured.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Featured</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((r: Resource) => {
                  const Icon = TYPE_ICON[r.type] ?? FileText;
                  return (
                    <Card
                      key={r._id}
                      className="bg-card/60 border-border/50 hover:bg-card/80 transition-all duration-300"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-primary/20 text-primary flex items-center justify-center">
                              <Icon className="h-4 w-4" />
                            </div>
                            <Badge variant="secondary">{r.type}</Badge>
                          </div>
                          <Badge>Featured</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="font-semibold">{r.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-3">
                            {r.description}
                          </div>
                          <div className="text-xs text-muted-foreground">Category: {r.category}</div>
                        </div>
                        {r.url && (
                          <Button asChild size="sm" className="glow">
                            <a href={r.url} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <Input
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <Select
                  value={category || "all_categories"}
                  onValueChange={(val) => setCategory(val === "all_categories" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Select
                  value={type || "all_types"}
                  onValueChange={(val) => setType(val === "all_types" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All Types</SelectItem>
                    {types.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(filtered || []).map((r: Resource) => {
                const Icon = TYPE_ICON[r.type] ?? FileText;
                return (
                  <Card
                    key={r._id}
                    className="bg-card/60 border-border/50 hover:bg-card/80 transition-all duration-300"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-primary/20 text-primary flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <Badge variant="secondary">{r.type}</Badge>
                        </div>
                        <Badge variant="outline">{r.category}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold">{r.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {r.description}
                        </div>
                      </div>
                      {r.url && (
                        <Button asChild size="sm" variant="outline" className="neon-border">
                          <a href={r.url} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filtered && filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">No resources found.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}