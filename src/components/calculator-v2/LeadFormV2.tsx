import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  validateEmail,
  verifyEmailDomain,
  type VerificationStatus,
} from "@/lib/email-validation";

// Warm the shared verify-email-domain edge function once per session
// to reduce cold-start latency when the user blurs the email field.
let v2DomainWarmed = false;
import type { QuestionId, ScoringTrace } from "@/lib/calculator-v2/types";
import {
  generateV2ScopeSummary,
  getKeyComplexityDrivers,
  getPublicConfidenceReasons,
  getPublicManualReviewReasons,
} from "@/lib/calculator-v2/scope-summary";

type Answers = Partial<Record<QuestionId, number>>;

interface LeadFormV2Props {
  answers: Answers;
  trace: ScoringTrace;
  onSubmitted: () => void;
}

export function LeadFormV2({ answers, trace, onSubmitted }: LeadFormV2Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [emailStatus, setEmailStatus] = useState<VerificationStatus>("idle");

  // Option B: warm the verify-email-domain edge function on mount so the
  // first real user verification doesn't pay cold-start latency.
  useEffect(() => {
    if (v2DomainWarmed) return;
    v2DomainWarmed = true;
    verifyEmailDomain("warmup@launchhouse.events").catch(() => {
      // Best-effort warmup — never surface failures.
    });
  }, []);



  const handleEmailBlur = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(undefined);
      setEmailStatus("idle");
      return;
    }
    const formatCheck = validateEmail(trimmed);
    if (!formatCheck.valid) {
      setEmailError(formatCheck.message);
      setEmailStatus("invalid");
      return;
    }
    setEmailStatus("verifying");
    setEmailError(undefined);
    const verify = await verifyEmailDomain(trimmed);
    if (!verify.valid) {
      setEmailError(verify.message);
      setEmailStatus("invalid");
    } else {
      setEmailError(undefined);
      setEmailStatus("valid");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !company.trim() || !email.trim()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (emailStatus === "verifying") {
      // Guarded by disabled button, but keep a safe no-op fallback.
      return;
    }
    if (emailStatus !== "valid") {
      toast({
        title: "Please use a valid company email address",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const publicConfidenceReasons = getPublicConfidenceReasons(trace);
      const publicManualReasons = getPublicManualReviewReasons(trace.manualReviewReasons);
      const keyDrivers = getKeyComplexityDrivers(answers);
      const scopeBullets = generateV2ScopeSummary(
        answers,
        trace.selectedProductsForScope,
        trace.eventAppSelected,
        trace.eventAppFeatures,
      );

      const v2Payload = {
        answers,
        products: trace.selectedProductsForScope,
        eventAppSelected: trace.eventAppSelected,
        eventAppFeatures: trace.eventAppFeatures,
        result: {
          tier: trace.result.complexity,
          price: trace.result.price,
          firstDraft: trace.result.firstDraft,
          revisionTurnaround: trace.result.revisionTurnaround,
        },
        confidence: {
          level: trace.confidenceLevel,
          reasons: publicConfidenceReasons,
        },
        manualReview: {
          required: trace.manualReviewRequired,
          reasons: publicManualReasons,
        },
        keyDrivers,
        scopeBullets,
        schemaVersion: 1,
        capturedAt: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("event_complexity_leads")
        .insert({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
          complexity_level: trace.result.complexity,
          starting_price: trace.result.price,
          cvent_products: null,
          attendee_hub_selected: trace.eventAppSelected,
          attendee_hub_features: trace.eventAppFeatures ?? [],
          scope_summary: scopeBullets.join("\n"),
          source: "v2",
          v2_payload: v2Payload,
        });

      if (insertError) {
        throw insertError;
      }

      // Best-effort notification — failure does NOT block result reveal
      try {
        await supabase.functions.invoke("send-lead-notification-v2", {
          body: {
            name: name.trim(),
            email: email.trim(),
            company: company.trim(),
            eventDate: eventDate ? format(eventDate, "PPP") : null,
            complexityLevel: trace.result.complexity,
            startingPrice: trace.result.price,
            firstDraft: trace.result.firstDraft,
            revisionTurnaround: trace.result.revisionTurnaround,
            selectedServices: trace.selectedProductsForScope,
            eventAppSelected: trace.eventAppSelected,
            eventAppFeatures: trace.eventAppFeatures,
            confidenceLevel: trace.confidenceLevel,
            confidenceReasons: publicConfidenceReasons,
            manualReviewRequired: trace.manualReviewRequired,
            manualReviewReasons: publicManualReasons,
            keyDrivers,
            scopeBullets,
          },
        });
      } catch (emailErr) {
        console.error("Failed to send V2 notification emails:", emailErr);
      }

      toast({ title: "Your results are ready!" });
      onSubmitted();
    } catch (err) {
      console.error("V2 lead save error:", err);
      const message =
        err instanceof Error ? err.message : "Please try again in a moment.";
      toast({
        title: "Something went wrong saving your info",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="animate-slide-up border-border shadow-sm">
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">
          Enter your details to unlock your personalised pricing estimate.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <Label htmlFor="v2-name" className="text-xs">
              Name *
            </Label>
            <Input
              id="v2-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="v2-company" className="text-xs">
              Company *
            </Label>
            <Input
              id="v2-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="v2-email" className="text-xs">
              Business email *
            </Label>
            <div className="relative">
              <Input
                id="v2-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) {
                    setEmailError(undefined);
                    setEmailStatus("idle");
                  }
                }}
                onBlur={handleEmailBlur}
                placeholder="you@company.com"
                disabled={saving}
                className={cn(
                  emailError && "border-destructive focus-visible:ring-destructive",
                  emailStatus === "valid" &&
                    "border-success focus-visible:ring-success",
                )}
              />
              {emailStatus === "verifying" && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-xs text-destructive">{emailError}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Event date (optional)</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground",
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
                  onSelect={(d) => {
                    setEventDate(d);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            disabled={saving || emailStatus === "verifying"}
            className="mt-2 w-full gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : emailStatus === "verifying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying email…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Get my results
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
