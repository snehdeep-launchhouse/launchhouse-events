import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmailInput from "@/components/EmailInput";
import { zodEmail, type VerificationStatus } from "@/lib/email-validation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, ArrowLeft, MessageCircle, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Constants ───────────────────────────────────────────────────── */
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

/* ── Schemas ─────────────────────────────────────────────────────── */
const step1Schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: zodEmail(),
});

const step2Schema = z.object({
  selectedServices: z.array(z.string()).min(1, "Please select at least one service"),
  additionalInfo: z.string().max(2000).optional(),
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
interface ContactUsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactUsPanel = ({ open, onOpenChange }: ContactUsPanelProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailVerification, setEmailVerification] = useState<VerificationStatus>("idle");
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [step2Error, setStep2Error] = useState("");

  const isMobile = useIsMobile();

  // Abandoned contact tracking
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Token returned by INSERT — used for token-bound UPDATEs (security fix)
  const submissionTokenRef = useRef<string | null>(null);

  // Abandoned demo form tracking (new unified table)
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const abandonedDemoRowCreatedRef = useRef(false);
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

  /* ── Abandoned demo form upsert ──────────────────────────────── */
  const upsertAbandonedDemo = useCallback(async (data: { first_name: string; last_name: string; email: string; last_step_reached: number; status?: string }) => {
    try {
      if (abandonedDemoRowCreatedRef.current) {
        await supabase
          .from("abandoned_demo_form" as any)
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            last_step_reached: data.last_step_reached,
            form_type: "contact",
            status: data.status || "partial",
            updated_at: new Date().toISOString(),
          } as any)
          .eq("session_id", sessionIdRef.current);
      } else {
        await supabase
          .from("abandoned_demo_form" as any)
          .insert({
            session_id: sessionIdRef.current,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            last_step_reached: data.last_step_reached,
            form_type: "contact",
            status: data.status || "partial",
          } as any);
        abandonedDemoRowCreatedRef.current = true;
      }
    } catch { /* silent */ }
  }, []);

  /* ── Auto-advance: when email is valid AND names filled ─────── */
  useEffect(() => {
    if (emailVerification === "valid" && step === 1) {
      const values = getValues();
      upsertAbandonedDemo({
        first_name: values.firstName?.trim() || "",
        last_name: values.lastName?.trim() || "",
        email: values.email?.trim() || "",
        last_step_reached: 1,
      });
      if (values.firstName?.trim() && values.lastName?.trim()) {
        handleSubmit(onStep1Submit)();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailVerification]);

  /* ── beforeunload: mark abandoned on tab close ─────────────── */
  useEffect(() => {
    const handler = () => {
      if (step1DataRef.current && !submittedRef.current && abandonedDemoRowCreatedRef.current) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/abandoned_demo_form?session_id=eq.${sessionIdRef.current}`;
        const body = JSON.stringify({ status: "abandoned", updated_at: new Date().toISOString() });
        navigator.sendBeacon(
          url,
          new Blob([body], { type: "application/json" })
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  /* Reset everything when panel closes */
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      if (step1DataRef.current && !submittedRef.current && abandonedDemoRowCreatedRef.current) {
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
        setSelectedServices([]);
        setAdditionalInfo("");
        setStep2Error("");
        setStep1Data(null);
        setEmailVerification("idle");
        sessionIdRef.current = crypto.randomUUID();
        abandonedDemoRowCreatedRef.current = false;
        submissionTokenRef.current = null; // Clear token on reset
        resetForm();
      }, 300);
    }
    onOpenChange(val);
  };

  /* ── Abandoned tracking (existing contact requests table) ──── */
  const upsertAbandoned = useCallback(
    async (data: {
      first_name: string;
      last_name: string;
      business_email: string;
      last_active_step: number;
      captured_data?: Record<string, unknown>;
    }) => {
      try {
        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          business_email: data.business_email,
          last_active_step: data.last_active_step,
          updated_at: new Date().toISOString(),
          ...(data.captured_data
            ? { captured_data: data.captured_data as unknown as import("@/integrations/supabase/types").Json }
            : {}),
        };

        // If we already have a token, UPDATE by token (secure)
        if (submissionTokenRef.current) {
          await supabase
            .from("abandoned_contact_requests")
            .update(payload)
            .eq("submission_token", submissionTokenRef.current);
        } else {
          // Otherwise INSERT and capture the token
          const { data: insertedRow, error: insertError } = await supabase
            .from("abandoned_contact_requests")
            .insert({ ...payload, status: "partial" })
            .select("submission_token")
            .single();

          if (insertError?.code === "23505") {
            // Duplicate email — update by email as fallback (legacy rows)
            const { data: updatedRow } = await supabase
              .from("abandoned_contact_requests")
              .update(payload)
              .eq("business_email", data.business_email)
              .select("submission_token")
              .single();
            if (updatedRow?.submission_token) {
              submissionTokenRef.current = updatedRow.submission_token;
            }
          } else if (insertedRow?.submission_token) {
            // Successful insert — store the token
            submissionTokenRef.current = insertedRow.submission_token;
          }
        }
      } catch {
        // silent
      }
    },
    []
  );

  const deleteAbandoned = useCallback(async (email: string) => {
    try {
      await supabase.from("abandoned_contact_requests").update({ status: "completed" }).eq("business_email", email);
    } catch {
      // silent
    }
  }, []);

  /* ── Step transitions ────────────────────────────────────────── */
  const onStep1Submit = async (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
    await upsertAbandoned({
      first_name: data.firstName,
      last_name: data.lastName,
      business_email: data.email,
      last_active_step: 1,
    });
    upsertAbandonedDemo({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      last_step_reached: 2,
    });
  };

  const trackStep2 = useCallback(
    (services: string[], info: string) => {
      if (!step1Data) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        upsertAbandoned({
          first_name: step1Data.firstName,
          last_name: step1Data.lastName,
          business_email: step1Data.email,
          last_active_step: 2,
          captured_data: { selectedServices: services, additionalInfo: info },
        });
      }, 1500);
    },
    [step1Data, upsertAbandoned]
  );

  const toggleService = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    setSelectedServices(updated);
    setStep2Error("");
    trackStep2(updated, additionalInfo);
  };

  const handleInfoChange = (val: string) => {
    setAdditionalInfo(val);
    trackStep2(selectedServices, val);
  };

  /* ── Final submission ────────────────────────────────────────── */
  const onFinalSubmit = async () => {
    if (!step1Data) return;
    const result = step2Schema.safeParse({ selectedServices, additionalInfo });
    if (!result.success) {
      setStep2Error(result.error.errors[0]?.message ?? "Please fix errors");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-quote-request", {
        body: {
          fullName: `${step1Data.firstName} ${step1Data.lastName}`,
          email: step1Data.email,
          eventTypeNewOrClone: "",
          eventType: "",
          cventTechnologies: selectedServices,
          cventTechnologiesOther: additionalInfo || null,
          registrationTypesCount: "",
          sessionsCount: "",
          registrationOptions: [],
          eventLaunchDate: "",
        },
      });
      if (error) throw error;
      await deleteAbandoned(step1Data.email);
      if (abandonedDemoRowCreatedRef.current) {
        try {
          await supabase
            .from("abandoned_demo_form" as any)
            .update({ status: "completed", updated_at: new Date().toISOString() } as any)
            .eq("session_id", sessionIdRef.current);
        } catch { /* silent */ }
      }
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Contact submission error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Form content (shared between Sheet and Drawer) ──────────── */
  const formContent = (
    <ScrollArea className="flex-1">
      <div className="px-6 py-5">
        {submitted && step1Data ? (
          <ConfirmationContent
            step1Data={step1Data}
            onClose={() => handleOpenChange(false)}
          />
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step === 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/20 text-primary"
                )}
              >
                1
              </div>
              <div className="w-10 h-0.5 bg-border" />
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step === 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                2
              </div>
            </div>

            {/* ── Step 1 ─────────────────────────────────────── */}
            {step === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-5">
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-card">
                  <h2 className="text-base font-bold font-display border-b border-border pb-2">
                    Your Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="First Name" required error={errors.firstName?.message}>
                      <Input
                        {...register("firstName")}
                        placeholder="Jane"
                        className={cn(
                          "text-base md:text-sm",
                          errors.firstName ? "border-destructive" : ""
                        )}
                      />
                    </Field>
                    <Field label="Last Name" required error={errors.lastName?.message}>
                      <Input
                        {...register("lastName")}
                        placeholder="Smith"
                        className={cn(
                          "text-base md:text-sm",
                          errors.lastName ? "border-destructive" : ""
                        )}
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
                <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-card">
                  <h2 className="text-base font-bold font-display border-b border-border pb-2">
                    What can we help you with?
                  </h2>
                  <Field
                    label="Select the services you're interested in"
                    required
                    error={step2Error}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {SERVICE_OFFERINGS.map((service) => (
                        <label
                          key={service}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm min-h-[44px] touch-manipulation",
                            selectedServices.includes(service)
                              ? "border-primary bg-secondary/50"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Checkbox
                            checked={selectedServices.includes(service)}
                            onCheckedChange={() => toggleService(service)}
                          />
                          <span className="font-medium leading-tight">
                            {service}
                          </span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Additional Information" error={undefined}>
                    <Textarea
                      placeholder="Tell us more about your event or requirements…"
                      value={additionalInfo}
                      onChange={(e) => handleInfoChange(e.target.value)}
                      className="min-h-[70px] text-base md:text-sm"
                      maxLength={2000}
                    />
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
                  <Button
                    onClick={onFinalSubmit}
                    disabled={submitting}
                    className="shadow-btn min-h-[44px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );

  /* ── Render: Drawer on mobile, Sheet on desktop ──────────────── */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="px-6 pt-4 pb-3 border-b border-border flex-shrink-0">
            <DrawerTitle className="text-xl font-bold font-display">Contact Us</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Tell us what you need and we'll be in touch shortly
            </DrawerDescription>
          </DrawerHeader>
          {formContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <SheetTitle className="text-xl font-bold font-display">Contact Us</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Tell us what you need and we'll be in touch shortly
          </SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
};

/* ── Confirmation sub-component ──────────────────────────────────── */
function ConfirmationContent({
  step1Data,
  onClose,
}: {
  step1Data: Step1Data;
  onClose: () => void;
}) {
  const whatsappText = encodeURIComponent(
    `Hi, I just submitted a contact request on LaunchHouse Events. My name is ${step1Data.firstName} ${step1Data.lastName}.`
  );

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold font-display mb-2">Thank You, {step1Data.firstName}!</h3>
        <p className="text-sm text-muted-foreground">
          We've received your request and will get back to you within{" "}
          <strong>3–4 business hours</strong>.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-left shadow-card">
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
          href={`https://wa.me/919999063734?text=${whatsappText}`}
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
          +91 999 906 3734
        </a>
      </div>

      <Button onClick={onClose} variant="outline" className="w-full min-h-[44px]">
        Close
      </Button>
    </div>
  );
}

export default ContactUsPanel;
