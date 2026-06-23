import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmailInput from "@/components/EmailInput";
import { zodEmail, type VerificationStatus } from "@/lib/email-validation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, CheckCircle2, ArrowLeft, X, Plus, Video, CalendarDays, ExternalLink, AlertTriangle, Clock, Mail, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, addMinutes } from "date-fns";
import Logo from "@/components/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Constants ───────────────────────────────────────────────────── */
const NY_TIMEZONE = "America/New_York";

const SERVICE_OFFERINGS = [
  "Event Registration And Website",
  "Attendee Hub (Website and/or Event App)",
  "Appointments",
  "Abstract Management",
  "Survey",
  "On Arrival (Onsite/Badge Creation)",
  "Creative Services",
  "Post Launch Services",
  "Trainings",
];

/* ── Schemas ──────────────────────────────────────────────────────── */
const step1Schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: zodEmail(),
});

type Step1Data = z.infer<typeof step1Schema>;

/* ── Field wrapper ───────────────────────────────────────────────── */
const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ── Panel ───────────────────────────────────────────────────────── */
interface RequestDemoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestDemoPanel = ({ open, onOpenChange }: RequestDemoPanelProps) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailVerification, setEmailVerification] = useState<VerificationStatus>("idle");
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  // Step 2
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [step2Error, setStep2Error] = useState("");

  // Step 3
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [additionalAttendees, setAdditionalAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendeeError, setAttendeeError] = useState("");

  // Confirmation data
  const [confirmationData, setConfirmationData] = useState<{
    meetLink: string;
    eventLink: string;
    date: string;
    time: string;
  } | null>(null);

  // Abandoned tracking
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const abandonedRowCreatedRef = useRef(false);
  const step1DataRef = useRef<Step1Data | null>(null);
  const stepRef = useRef<number>(1);
  const submittedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    getValues,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  // Keep refs in sync
  useEffect(() => { step1DataRef.current = step1Data; }, [step1Data]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);

  /* ── Background capture: upsert on email valid ────────────── */
  const upsertAbandonedDemo = useCallback(async (data: { first_name: string; last_name: string; email: string; last_step_reached: number; status?: string }) => {
    try {
      if (abandonedRowCreatedRef.current) {
        await supabase.rpc("update_abandoned_demo_by_session" as any, {
          p_session_id: sessionIdRef.current,
          p_first_name: data.first_name,
          p_last_name: data.last_name,
          p_email: data.email,
          p_last_step_reached: data.last_step_reached,
          p_form_type: "demo",
          p_status: data.status || "partial",
        });
      } else {
        await supabase
          .from("abandoned_demo_form" as any)
          .insert({
            session_id: sessionIdRef.current,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            last_step_reached: data.last_step_reached,
            form_type: "demo",
            status: data.status || "partial",
          } as any);
        abandonedRowCreatedRef.current = true;
      }
    } catch { /* silent */ }
  }, []);

  /* ── Auto-advance: when email is valid AND names filled ─────── */
  useEffect(() => {
    if (emailVerification === "valid" && step === 1) {
      const values = getValues();
      // Background capture immediately
      upsertAbandonedDemo({
        first_name: values.firstName?.trim() || "",
        last_name: values.lastName?.trim() || "",
        email: values.email?.trim() || "",
        last_step_reached: 1,
      });
      // Only auto-advance if names are non-empty
      if (values.firstName?.trim() && values.lastName?.trim()) {
        handleSubmit(onStep1Submit)();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailVerification]);

  /* ── beforeunload: mark abandoned on tab close ─────────────── */
  useEffect(() => {
    const handler = () => {
      if (step1DataRef.current && !submittedRef.current && abandonedRowCreatedRef.current) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/update_abandoned_demo_by_session`;
        const body = JSON.stringify({
          p_session_id: sessionIdRef.current,
          p_status: "abandoned",
        });
        navigator.sendBeacon(
          url,
          new Blob([body], { type: "application/json" })
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      // Mark as abandoned if step1 data exists and not submitted
      if (step1DataRef.current && !submittedRef.current && abandonedRowCreatedRef.current) {
        upsertAbandonedDemo({
          first_name: step1DataRef.current.firstName,
          last_name: step1DataRef.current.lastName,
          email: step1DataRef.current.email,
          last_step_reached: stepRef.current,
          status: "abandoned",
        });
      }
      setTimeout(() => {
        setStep(1);
        setSubmitted(false);
        setSubmitting(false);
        setSelectedProducts([]);
        setStep2Error("");
        setStep1Data(null);
        setEmailVerification("idle");
        setSelectedDate(undefined);
        setAvailableSlots([]);
        setSelectedTime(null);
        setAdditionalAttendees([]);
        setAttendeeInput("");
        setAttendeeError("");
        setConfirmationData(null);
        resetForm();
        // Reset session for next open
        sessionIdRef.current = crypto.randomUUID();
        abandonedRowCreatedRef.current = false;
      }, 300);
    }
    onOpenChange(val);
  };

  /* ── Step 1 ──────────────────────────────────────────────────── */
  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
    // Update abandoned record with step 2
    upsertAbandonedDemo({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      last_step_reached: 2,
    });
  };

  /* ── Step 2 ──────────────────────────────────────────────────── */
  const toggleProduct = (product: string) => {
    const updated = selectedProducts.includes(product)
      ? selectedProducts.filter((p) => p !== product)
      : [...selectedProducts, product];
    setSelectedProducts(updated);
    setStep2Error("");
  };

  const onStep2Next = () => {
    if (selectedProducts.length === 0) {
      setStep2Error("Please select at least one product");
      return;
    }
    setStep(3);
    if (step1Data) {
      upsertAbandonedDemo({
        first_name: step1Data.firstName,
        last_name: step1Data.lastName,
        email: step1Data.email,
        last_step_reached: 3,
      });
    }
  };

  /* ── Step 3 ──────────────────────────────────────────────────── */
  const fetchAvailability = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime(null);

    try {
      const dateStr = format(date, "yyyy-MM-dd");

      const { data, error } = await supabase.functions.invoke("get-demo-availability", {
        body: { date: dateStr, timezone: NY_TIMEZONE },
      });

      if (error) throw error;

      let slots: Array<{ time: string; available: boolean }> = data?.slots ?? [];

      // Apply 90-minute lead time filter in NY time
      if (isToday(date)) {
        const nowInNY = new Date(new Date().toLocaleString("en-US", { timeZone: NY_TIMEZONE }));
        const cutoff = addMinutes(nowInNY, 90);
        slots = slots.map((slot) => {
          const [h, m] = slot.time.split(":").map(Number);
          const slotDate = new Date(nowInNY);
          slotDate.setHours(h, m, 0, 0);
          if (slotDate <= cutoff) {
            return { ...slot, available: false };
          }
          return slot;
        });
      }

      setAvailableSlots(slots);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      toast.error("Failed to load available times. Please try again.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) fetchAvailability(date);
  };

  const formatTime12h = (time24: string) => {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const addAttendee = () => {
    const email = attendeeInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAttendeeError("Please enter a valid email address");
      return;
    }

    if (additionalAttendees.includes(email)) {
      setAttendeeError("This email is already added");
      return;
    }

    if (step1Data && email === step1Data.email.toLowerCase()) {
      setAttendeeError("This is already your email");
      return;
    }

    setAdditionalAttendees([...additionalAttendees, email]);
    setAttendeeInput("");
    setAttendeeError("");
  };

  const removeAttendee = (email: string) => {
    setAdditionalAttendees(additionalAttendees.filter((a) => a !== email));
  };

  /* ── Final submission ────────────────────────────────────────── */
  const onConfirmBooking = async () => {
    if (!step1Data || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      const { data, error } = await supabase.functions.invoke("book-demo", {
        body: {
          firstName: step1Data.firstName,
          lastName: step1Data.lastName,
          email: step1Data.email,
          products: selectedProducts,
          date: dateStr,
          time: selectedTime,
          timezone: NY_TIMEZONE,
          additionalAttendees,
        },
      });

      if (error) throw error;

      // Mark abandoned row as completed
      if (abandonedRowCreatedRef.current) {
        try {
          await supabase.rpc("update_abandoned_demo_by_session" as any, {
            p_session_id: sessionIdRef.current,
            p_status: "completed",
          });
        } catch { /* silent */ }
      }

      setConfirmationData({
        meetLink: data?.meetLink ?? "",
        eventLink: data?.eventLink ?? "",
        date: format(selectedDate, "EEEE, MMMM d, yyyy"),
        time: selectedTime,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Demo booking error:", err);
      toast.error("Failed to book demo. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Form content (shared between Sheet & Drawer) ──────────── */
  const formContent = (
    <div className="px-6 py-5">
      {/* Logo at top of every step */}
      <div className="flex justify-center mb-5">
        <Logo size={36} className="pointer-events-none" />
      </div>

      {/* ── Confirmation ──────────────────────────────────── */}
      {submitted && confirmationData ? (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display mb-2">Demo Confirmed!</h3>
            <p className="text-sm text-muted-foreground">
              Your demo has been scheduled. A confirmation email has been sent.
            </p>
          </div>

          <div className="rounded-xl border border-sky-200/50 bg-white/55 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-5 space-y-3 text-left shadow-card">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="font-medium">{confirmationData.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 flex items-center justify-center text-primary font-bold text-xs">⏰</span>
              <span className="font-medium">{formatTime12h(confirmationData.time)} ET</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Products:</span>
              <span>{selectedProducts.join(", ")}</span>
            </div>
            {additionalAttendees.length > 0 && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Attendees:</span>
                <span className="ml-2">{additionalAttendees.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {confirmationData.meetLink && (
              <a
                href={confirmationData.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Video className="w-4 h-4" />
                Join Google Meet
              </a>
            )}
            {confirmationData.eventLink && (
              <a
                href={confirmationData.eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View in Google Calendar
              </a>
            )}
          </div>

          <div className="rounded-xl border border-sky-200/50 bg-white/55 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-5 space-y-4 text-left shadow-card">
            <h4 className="text-sm font-semibold border-b border-border pb-2">
              Need to reach us sooner?
            </h4>
            <a
              href="mailto:sam@launchhouse.events"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors min-h-[44px]"
            >
              <Mail className="w-4 h-4 text-primary" />
              sam@launchhouse.events
            </a>
            <a
              href="https://wa.me/919999063734"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp Us
            </a>
            <a
              href="tel:+919999063734"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span><span className="text-muted-foreground font-medium mr-1">India:</span>+91 999 906 3734</span>
            </a>
            <a
              href="tel:+15714448523"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span><span className="text-muted-foreground font-medium mr-1">US:</span>+1 (571) 444-8523</span>
            </a>
          </div>

          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : step > s
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s ? "✓" : s}
                </div>
                {i < 2 && <div className="w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>

          {/* ── Step 1 ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-5">
              <div className="rounded-xl border border-sky-200/50 bg-white/55 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-5 space-y-4 shadow-card">
                <h2 className="text-base font-bold font-display border-b border-border pb-2">
                  Your Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="First Name" required error={errors.firstName?.message}>
                    <Input
                      {...register("firstName")}
                      placeholder="Jane"
                      className={cn("text-base md:text-sm", errors.firstName ? "border-destructive" : "")}
                    />
                  </Field>
                  <Field label="Last Name" required error={errors.lastName?.message}>
                    <Input
                      {...register("lastName")}
                      placeholder="Smith"
                      className={cn("text-base md:text-sm", errors.lastName ? "border-destructive" : "")}
                    />
                  </Field>
                </div>
                <Field label="Business Email" required error={errors.email?.message}>
                  <EmailInput
                    {...register("email")}
                    placeholder="jane@company.com"
                    externalError={errors.email?.message}
                    onVerificationChange={setEmailVerification}
                    className="text-base md:text-sm"
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    emailVerification === "verifying" ||
                    emailVerification === "invalid"
                  }
                  className="shadow-btn min-h-[44px]"
                >
                  Next
                </Button>
              </div>
            </form>
          )}

          {/* ── Step 2 ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-sky-200/50 bg-white/55 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-5 space-y-4 shadow-card">
                <h2 className="text-base font-bold font-display border-b border-border pb-2">
                  What would you like a demo of?
                </h2>
                <Field
                  label="Select the products you're interested in"
                  required
                  error={step2Error}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {SERVICE_OFFERINGS.map((product) => (
                      <label
                        key={product}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm min-h-[44px] backdrop-blur-sm",
                          selectedProducts.includes(product)
                            ? "border-primary bg-primary/15"
                            : "border-sky-200/50 bg-white/45 hover:bg-white/70 hover:border-primary/40"
                        )}
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product)}
                          onCheckedChange={() => toggleProduct(product)}
                        />
                        <span className="font-medium leading-tight">
                          {product}
                        </span>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={onStep2Next} className="shadow-btn min-h-[44px]">
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3 ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-sky-200/50 bg-white/55 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-5 space-y-4 shadow-card">
              <h2 className="text-base font-bold font-display border-b border-border pb-2">
                  Pick a Date & Time
                </h2>

                {/* Scarcity banner */}
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span className="font-semibold">High Demand:</span>
                  <span>Limited Demo Slots Available</span>
                </div>

                {/* NY timezone indicator */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  All times shown in New York Time (ET)
                </div>

                <div className="flex justify-center w-full max-w-[calc(100vw-3rem)] mx-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today || date.getDay() === 0 || date.getDay() === 6;
                    }}
                    className="p-3 pointer-events-auto"
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Available Times — {format(selectedDate, "MMM d, yyyy")}
                    </Label>

                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading available slots…</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No available slots for this date. Please try another day.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]",
                              !slot.available
                                ? "border-border bg-muted/50 text-muted-foreground/50 cursor-not-allowed opacity-50"
                                : selectedTime === slot.time
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/50 hover:bg-secondary/30"
                            )}
                          >
                            {slot.available ? formatTime12h(slot.time) : "Slot Booked"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Attendees */}
              <div className="rounded-xl border border-sky-200/50 bg-white/55 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-5 space-y-3 shadow-card">
                <h2 className="text-base font-bold font-display border-b border-border pb-2">
                  Additional Attendees <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                </h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="colleague@company.com"
                    value={attendeeInput}
                    onChange={(e) => {
                      setAttendeeInput(e.target.value);
                      setAttendeeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAttendee();
                      }
                    }}
                    className="flex-1 text-base md:text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addAttendee} className="min-h-[44px] min-w-[44px]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {attendeeError && <p className="text-xs text-destructive">{attendeeError}</p>}
                {additionalAttendees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {additionalAttendees.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeAttendee(email)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="gap-2 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={onConfirmBooking}
                  disabled={submitting || !selectedDate || !selectedTime}
                  className="shadow-btn min-h-[44px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking…
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  /* ── Render: Drawer on mobile, Sheet on desktop ────────────── */
  const glassPanelClass =
    "bg-sky-50/55 supports-[backdrop-filter]:bg-sky-100/35 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/50 shadow-[0_30px_80px_-20px_rgba(0,106,225,0.25)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-32 after:bg-gradient-to-t after:from-sky-300/20 after:to-transparent";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className={cn("max-h-[95vh] flex flex-col overflow-hidden border-sky-200/50", glassPanelClass)}>
          <DrawerHeader className="relative px-6 pt-4 pb-3 border-b border-sky-200/40 flex-shrink-0 bg-transparent">
            <DrawerTitle className="text-xl font-bold font-display text-foreground">Book a Free Consultation</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Talk to a member of our team about your event build. We will ask the right questions, understand your timeline and requirements, and let you know exactly how we can help. No sales pitch. No commitment.
            </DrawerDescription>
            <DrawerClose className="absolute right-4 top-4 rounded-full border border-sky-200/50 bg-white/55 backdrop-blur-md p-2 hover:bg-white/75 transition-colors">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </DrawerHeader>
          <ScrollArea className="relative flex-1 overflow-y-auto">
            {formContent}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className={cn("w-full sm:max-w-md md:max-w-lg p-0 flex flex-col overflow-hidden border-l border-sky-200/50", glassPanelClass)}
      >
        <SheetHeader className="relative px-6 pt-6 pb-4 border-b border-sky-200/40 flex-shrink-0 bg-transparent">
          <SheetTitle className="text-xl font-bold font-display text-foreground">Book a Free Consultation</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Tell us about your event needs and pick a time that works for you
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="relative flex-1">
          {formContent}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default RequestDemoPanel;
