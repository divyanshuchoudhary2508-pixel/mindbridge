import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";

export default function Chatbot() {
  const [anonymousId, setAnonymousId] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("anonymousId");
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("anonymousId", id);
    }
    setAnonymousId(id);
  }, []);

  const history = useQuery(
    api.chatbot.getChatHistory,
    anonymousId ? { anonymousId } : "skip",
  );

  const addMessage = useMutation(api.chatbot.addMessage);
  const clearHistory = useMutation(api.chatbot.clearChatHistory);
  const generate = useAction(api.ai.generateResponse);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history?.length]);

  const canSend = useMemo(
    () => anonymousId && message.trim().length > 0 && !isSending,
    [anonymousId, message, isSending],
  );

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices?.() || [];
      setVoices(v);
      if (!voiceName && v.length > 0) setVoiceName(v[0].name);
    };
    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [voiceName]);

  // speech to text (browser)
  const [isRecording, setIsRecording] = useState(false);
  const recRef = useRef<any>(null);
  const startRecording = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript || "";
      if (transcript) setMessage((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    rec.start();
    recRef.current = rec;
    setIsRecording(true);
  };
  const stopRecording = () => {
    try {
      recRef.current?.stop?.();
    } finally {
      setIsRecording(false);
    }
  };

  // helper speak
  const speak = (text: string) => {
    if (!speakReplies || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((vv) => vv.name === voiceName);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };

  const handleSend = async () => {
    if (!canSend) return;
    try {
      setIsSending(true);
      const userMsg = message.trim();

      await addMessage({
        anonymousId,
        message: userMsg,
        isUser: true,
      });

      setMessage("");

      const res = await generate({
        anonymousId,
        message: userMsg,
        chatHistory:
          (history || []).map((m) => ({
            message: m.message,
            isUser: m.isUser,
          })) || [],
      });

      if (res.isCrisis) {
        toast.warning(
          "Crisis indicators detected. Emergency resources have been suggested in the conversation.",
        );
      }
      // speak assistant reply that was appended to history; also speak from returned response
      if (res?.response) speak(res.response);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleClear = async () => {
    if (!anonymousId) return;
    try {
      await clearHistory({ anonymousId });
      toast.success("Chat cleared");
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/20 text-accent rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <h1 className="text-xl font-semibold">AI Chat Support</h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="neon-border"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className="neon-border"
                  >
                    {isRecording ? "Stop Mic" : "Start Mic"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={speakReplies ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSpeakReplies((s) => !s)}
                    className={speakReplies ? "glow" : "neon-border"}
                  >
                    {speakReplies ? "Speaking: On" : "Speaking: Off"}
                  </Button>
                </div>
                <div className="min-w-[220px]">
                  <Select
                    value={voiceName || ""}
                    onValueChange={(v) => setVoiceName(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-[50vh] max-h-[60vh] min-h-[320px] overflow-y-auto rounded-md border border-border/50 p-3 space-y-3 bg-muted/30">
                {(history || []).length === 0 && (
                  <div className="text-sm text-muted-foreground p-3">
                    Start a conversation anytime. Your chat is anonymous and not
                    visible to others. If you mention crisis-related topics,
                    emergency resources will be suggested.
                  </div>
                )}

                {(history || []).map((m) => (
                  <div
                    key={m._id}
                    className={`flex ${
                      m.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        m.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="mt-4 grid gap-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSend} disabled={!canSend} className="glow">
                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}