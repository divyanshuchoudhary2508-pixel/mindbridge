import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Phone, ShieldAlert } from "lucide-react";

type Contact = {
  _id: string;
  name: string;
  phone: string;
  description: string;
  country: string;
  available24h: boolean;
  category: string;
};

export default function Emergency() {
  const [country, setCountry] = useState<string>("");

  const args = useMemo(() => {
    return country ? { country } : {};
  }, [country]);

  const contacts = useQuery(api.emergency.getEmergencyContacts, args);

  const countries = useMemo(() => {
    const set = new Set<string>();
    (contacts || []).forEach((c: Contact) => set.add(c.country));
    // include US by default if seed exists only for US
    if (set.size === 0) set.add("US");
    return Array.from(set).sort();
  }, [contacts]);

  const grouped = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    (contacts || []).forEach((c: Contact) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  }, [contacts]);

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Emergency Support</h1>
                  <p className="text-muted-foreground">
                    If you're in immediate danger, call your local emergency number right away.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 max-w-xs">
                <Select
                  value={country || "all_countries"}
                  onValueChange={(val) => setCountry(val === "all_countries" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_countries">All Countries</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {Object.keys(grouped).length === 0 && (
              <Card className="bg-card/60 border-border/50">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No contacts found for the selected country.
                </CardContent>
              </Card>
            )}

            {Object.entries(grouped).map(([category, rows]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{rows.length} contact(s)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {rows.map((c) => (
                    <Card key={c._id} className="bg-card/60 border-border/50">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{c.name}</div>
                          {c.available24h && <Badge>24/7</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">{c.description}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center">
                            <Phone className="h-3 w-3" />
                          </div>
                          <a href={`tel:${c.phone}`} className="font-medium hover:underline">
                            {c.phone}
                          </a>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{c.country}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}