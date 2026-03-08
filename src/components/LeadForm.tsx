import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/lib/calculator-data";

interface LeadFormProps {
  answers?: Record<string, number>;
  selectedProducts?: string[];
  result?: Result | null;
}

// Map calculator question IDs to database column names
const answerToColumnMap: Record<string, string> = {
  event_length: "event_length",
  sessions: "sessions",
  reg_paths: "registration_paths",
  contact_types: "contact_types",
  reg_rules: "registration_rules",
  hotel: "hotel_required",
  languages: "languages",
  integrations: "integrations",
  speakers: "speaker_management",
  appointments: "appointment_scheduling",
  pages: "website_pages",
  branding: "branding_level",
};

export function LeadForm({ answers = {}, selectedProducts = [], result }: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Build the row from calculator answers
      const answerColumns: Record<string, string> = {};
      for (const [qId, value] of Object.entries(answers)) {
        const col = answerToColumnMap[qId];
        if (col) answerColumns[col] = String(value);
      }

      const { error } = await supabase.from("event_complexity_leads").insert({
        name,
        email,
        company,
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        complexity_level: result?.complexity ?? null,
        starting_price: result?.price ?? null,
        cvent_products: selectedProducts.length > 0 ? selectedProducts.join(", ") : null,
        ...answerColumns,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Thank you! We'll be in touch shortly." });
    } catch (err: any) {
      console.error("Lead save error:", err);
      toast({
        title: "Something went wrong saving your info",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <Card className="animate-slide-up border-success/30 bg-accent/30">
        <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground">
            <Send className="h-5 w-5" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Consultation Requested!
          </p>
          <p className="text-sm text-muted-foreground">
            We'll reach out to <span className="font-medium">{email}</span>{" "}
            shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up border-border shadow-sm">
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">
          Ready to get started? Let us know how to reach you.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <Label htmlFor="name" className="text-xs">
              Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label htmlFor="company" className="text-xs">
              Company *
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div>
            <Label className="text-xs">Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="mt-1 w-full gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {saving ? "Saving…" : "Schedule a Consultation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}