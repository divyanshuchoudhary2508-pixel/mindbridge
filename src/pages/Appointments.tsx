import Navbar from "@/components/Navbar";
import EmergencyBar from "@/components/EmergencyBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router";

export default function Appointments() {
  const { isAuthenticated, user } = useAuth();

  const listMine = useQuery(api.appointments.listMine, {});
  const create = useMutation(api.appointments.create);
  const cancel = useMutation(api.appointments.cancel);
  const reschedule = useMutation(api.appointments.reschedule);

  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [counselor, setCounselor] = useState<string>("");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const counselors = useMemo(
    () =>
      [
        { name: "Select counselor (optional)", email: "", value: "none" },
        { name: "Dr. Rohan Verma", email: "rohan.verma@example.com", value: "rohan_verma" },
      ] as const,
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to book an appointment.");
      return;
    }
    if (!date || !time || !reason.trim()) {
      toast.error("Please select a date, time, and enter a reason.");
      return;
    }
    setSubmitting(true);
    try {
      const selected = counselors.find((c) => c.value === counselor);
      await create({
        date: format(date, "yyyy-MM-dd"),
        time,
        counselorName: selected && selected.value !== "none" ? selected.name : undefined,
        counselorEmail: selected && selected.value !== "none" ? selected.email : undefined,
        reason: reason.trim(),
        contact: contact.trim() || undefined,
      });
      toast.success("Your appointment request has been submitted successfully.");
      // Reset form (keep counselor for convenience)
      setDate(undefined);
      setTime("");
      setReason("");
      // contact optional; do not reset
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this appointment request?")) return;
    try {
      await cancel({ appointmentId: id as any });
      toast.success("Appointment cancelled.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel appointment.");
    }
  };

  const handleReschedule = async (id: string) => {
    if (!listMine) return;
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):");
    if (!newDate) return;
    const newTime = window.prompt("Enter new time (HH:MM):");
    if (!newTime) return;
    try {
      await reschedule({ appointmentId: id as any, newDate, newTime });
      toast.success("Appointment rescheduled.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reschedule appointment.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EmergencyBar />
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Booking Form */}
          <Card className="bg-card/80 backdrop-blur-sm border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>Connect with licensed mental health professionals.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="p-4 border rounded-md text-sm bg-muted">
                  Please{" "}
                  <Link to="/auth" className="underline text-primary">
                    sign in
                  </Link>{" "}
                  to book an appointment.
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Preferred Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="justify-start w-full"
                          disabled={!isAuthenticated}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Preferred Time</label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      disabled={!isAuthenticated}
                    />
                  </div>
                </div>

                {/* Counselor */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Choose Counselor (optional)</label>
                  <Select
                    value={counselor}
                    onValueChange={setCounselor}
                    disabled={!isAuthenticated}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select counselor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {counselors.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us briefly about the reason for this appointment..."
                    className="min-h-[120px]"
                    disabled={!isAuthenticated}
                  />
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Contact (optional)</label>
                  <Input
                    placeholder="Phone or email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    disabled={!isAuthenticated}
                  />
                </div>

                <Button type="submit" disabled={!isAuthenticated || submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right: Your Appointments */}
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
              <CardDescription>Recent appointment requests</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <p className="text-sm text-muted-foreground">Sign in to view your appointments.</p>
              ) : listMine === undefined ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : listMine.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments yet.</p>
              ) : (
                <div className="space-y-4">
                  {listMine.map((a) => (
                    <div
                      key={a._id}
                      className="rounded-md border p-4 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {a.date} at {a.time}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {a.professionalName ? a.professionalName : "No counselor selected"}
                          </div>
                          <div className="text-xs mt-1">
                            Status: <span className="uppercase">{a.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReschedule(a._id as any)}
                            disabled={a.status === "cancelled"}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleCancel(a._id as any)}
                            disabled={a.status === "cancelled"}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                      {a.notes ? (
                        <div className="text-sm mt-2">
                          <span className="font-medium">Reason: </span>
                          {a.notes}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}