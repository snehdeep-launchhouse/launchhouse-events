import { useState, useEffect, useRef, useCallback } from "react";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
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
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import bannerImg from "@/assets/banners/get-quote-banner.jpg";

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
type Step2Data = z.infer<typeof step2Schema>;

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
  <div className="space-y-2">
    <Label className="text-sm font-semibold">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

/* ── Page ────────────────────────────────────────────────────────── */
const GetAQuote = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailVerification, setEmailVerification] = useState<VerificationStatus>("idle");
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  // Step 2 local state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [step2Error, setStep2Error] = useState("");

  // Abandoned tracking ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.title = "Contact Us — LaunchHouse Events";
    return () => {
      document.title = "LaunchHouse Events";
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  /* ── Abandoned tracking helpers ──────────────────────────────── */
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
          ...(data.captured_data ? { captured_data: data.captured_data as unknown as import("@/integrations/supabase/types").Json } : {}),
        };

        // Try INSERT first; if duplicate email, fall back to UPDATE
        const { error: insertError } = await supabase
          .from("abandoned_contact_requests")
          .insert({ ...payload, status: "partial" });

        if (insertError?.code === "23505") {
          await supabase
            .from("abandoned_contact_requests")
            .update(payload)
            .eq("business_email", data.business_email);
        }
      } catch {
        // silent — tracking should not block the user
      }
    },
    []
  );

  const markAbandonedCompleted = useCallback(async (email: string) => {
    try {
      await supabase
        .from("abandoned_contact_requests")
        .update({ status: "completed" })
        .eq("business_email", email);
    } catch {
      // silent
    }
  }, []);

  /* ── Step 1 → Step 2 ────────────────────────────────────────── */
  const onStep1Submit = async (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);

    // Upsert abandoned record
    await upsertAbandoned({
      first_name: data.firstName,
      last_name: data.lastName,
      business_email: data.email,
      last_active_step: 1,
    });
  };

  /* ── Debounced step 2 tracking ──────────────────────────────── */
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
      const { data: fnResult, error } = await supabase.functions.invoke(
        "send-quote-request",
        {
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
        }
      );
      if (error) throw error;

      // Delete abandoned record on success
      await markAbandonedCompleted(step1Data.email);

      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Contact submission error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Confirmation screen ───────────────────────────────────── */
  if (submitted && step1Data) {
    const whatsappText = encodeURIComponent(
      `Hi, I just submitted a contact request on LaunchHouse Events. My name is ${step1Data.firstName} ${step1Data.lastName}.`
    );
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-primary py-5 px-6 flex items-center justify-center">
          <Logo light />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display">
                  Thank You for Reaching Out!
                </h1>
                <p className="text-muted-foreground mt-2 text-base">
                  We'll get back to you within 3–4 business hours.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3">
              <h2 className="font-semibold font-display text-base">What happens next?</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-none">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
                  <span>Our team will review your requirements and prepare a tailored response.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
                  <span>We'll reach out via email within 3–4 business hours.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">3</span>
                  <span>A confirmation email has been sent to your inbox.</span>
                </li>
              </ol>
            </div>

            {/* Urgent contact options */}
            <div className="rounded-xl border border-border bg-secondary/40 p-6 space-y-4">
              <p className="text-sm font-semibold text-foreground">Need urgent assistance?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:sam@launchhouse.events"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  sam@launchhouse.events
                </a>
                <a
                  href="tel:+919999063734"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +91 9999 063 734
                </a>
                <a
                  href={`https://wa.me/919999063734?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[hsl(142,70%,40%)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[hsl(142,70%,35%)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            <Button onClick={() => (window.location.href = "/")} size="lg" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} LaunchHouse Events. All rights reserved.
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={[{ name: "Contact Us", path: "/contact-us" }]} />
      {/* Banner */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src={bannerImg}
          alt=""
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <Logo light />
          <h1 className="text-2xl md:text-4xl font-bold font-display text-white mt-4 drop-shadow-lg">
            Contact Us
          </h1>
          <p className="text-white/85 text-sm md:text-base mt-2 drop-shadow max-w-md">
            Tell us what you need and we'll be in touch shortly
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="container max-w-xl py-10 pb-16">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
          )}>1</div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
            step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>2</div>
        </div>

        {/* ── Step 1: Contact Info ──────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5 shadow-card">
              <h2 className="text-lg font-bold font-display border-b border-border pb-3">
                Your Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" required error={errors.firstName?.message}>
                  <Input
                    {...register("firstName")}
                    placeholder="Jane"
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                </Field>
                <Field label="Last Name" required error={errors.lastName?.message}>
                  <Input
                    {...register("lastName")}
                    placeholder="Smith"
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                </Field>
              </div>

              <Field label="Business Email" required error={errors.email?.message}>
                <EmailInput
                  {...register("email")}
                  placeholder="jane@company.com"
                  externalError={errors.email?.message}
                  onVerificationChange={setEmailVerification}
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={emailVerification === "verifying" || emailVerification === "invalid"}
                className="shadow-btn"
              >
                Next
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 2: Services & Comments ──────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5 shadow-card">
              <h2 className="text-lg font-bold font-display border-b border-border pb-3">
                What can we help you with?
              </h2>

              <Field
                label="Select the services you're interested in"
                required
                error={step2Error}
              >
                <div className="grid sm:grid-cols-2 gap-2.5 mt-1">
                  {SERVICE_OFFERINGS.map((service) => (
                    <label
                      key={service}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors text-sm",
                        selectedServices.includes(service)
                          ? "border-primary bg-secondary/50"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedServices.includes(service)}
                        onCheckedChange={() => toggleService(service)}
                      />
                      <span className="font-medium leading-tight">{service}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Additional Information" error={undefined}>
                <Textarea
                  placeholder="Tell us more about your event or requirements…"
                  value={additionalInfo}
                  onChange={(e) => handleInfoChange(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={2000}
                />
              </Field>
            </div>

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={onFinalSubmit}
                size="lg"
                disabled={submitting}
                className="shadow-btn"
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
      </div>

      <Footer />
    </div>
  );
};

export default GetAQuote;
