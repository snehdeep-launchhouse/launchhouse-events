import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import bannerImg from "@/assets/get-a-quote-banner.jpg";

/* ── Constants ───────────────────────────────────────────────────── */
const CVENT_TECHNOLOGIES = [
  "Abstract",
  "Appointments",
  "Registration",
  "Event Website",
  "Speaker Resource Center",
  "Exhibitor Management",
  "Attendee Hub",
  "Event App",
  "Other",
];

const REGISTRATION_OPTIONS = ["Single Days Only", "Multiple Days", "Both"];

/* ── Schema ──────────────────────────────────────────────────────── */
const quoteSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required").max(200),
    email: z.string().trim().email("Invalid email address").max(255),
    eventTypeNewOrClone: z.enum(["New Event", "Existing Event"], {
      required_error: "Please select an option",
    }),
    eventType: z.enum(["In-Person", "Virtual", "Hybrid"], {
      required_error: "Please select an event type",
    }),
    cventTechnologies: z
      .array(z.string())
      .min(1, "Select at least one Cvent technology"),
    cventTechnologiesOther: z.string().max(500).optional(),
    registrationTypesCount: z.enum(["0–3", "4–8", "More than 8"], {
      required_error: "Please select a range",
    }),
    sessionsCount: z.enum(["0–10", "11–20", "More than 21"], {
      required_error: "Please select a range",
    }),
    registrationOptions: z.string().min(1, "Please select a registration option"),
    eventLaunchDate: z.date({ required_error: "Event launch date is required" }),
  })
  .refine(
    (d) =>
      !d.cventTechnologies.includes("Other") ||
      (d.cventTechnologiesOther && d.cventTechnologiesOther.trim().length > 0),
    {
      message: "Please specify the other technology",
      path: ["cventTechnologiesOther"],
    }
  );

type QuoteForm = z.infer<typeof quoteSchema>;

/* ── Date Picker helper ──────────────────────────────────────────── */
const DatePicker = ({
  value,
  onChange,
}: {
  value?: Date | null;
  onChange: (d: Date | undefined) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "PPP") : "Pick a date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value ?? undefined}
        onSelect={onChange}
        initialFocus
        disabled={(d) => d < new Date()}
      />
    </PopoverContent>
  </Popover>
);

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState<string>("");

  useEffect(() => {
    document.title = "Get a Quote — LaunchHouse Events";
    return () => {
      document.title = "LaunchHouse Events";
    };
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      cventTechnologies: [],
      registrationOptions: "",
      cventTechnologiesOther: "",
    },
  });

  const watchedTech = watch("cventTechnologies") ?? [];
  const watchedRegOption = watch("registrationOptions") ?? "";

  const onSubmit = async (data: QuoteForm) => {
    setSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke(
        "send-quote-request",
        {
          body: {
            fullName: data.fullName,
            email: data.email,
            eventTypeNewOrClone: data.eventTypeNewOrClone,
            eventType: data.eventType,
            cventTechnologies: data.cventTechnologies,
            cventTechnologiesOther: data.cventTechnologiesOther ?? null,
            registrationTypesCount: data.registrationTypesCount,
            sessionsCount: data.sessionsCount,
            registrationOptions: [data.registrationOptions],
            eventLaunchDate: format(data.eventLaunchDate, "PPP"),
          },
        }
      );
      if (error) throw error;
      setQuoteNumber(result?.quoteNumber ?? "0001");
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Quote submission error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Thank-you screen ──────────────────────────────────────────── */
  if (submitted) {
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
                <h1 className="text-3xl font-bold font-display">Quote Request Received!</h1>
                <p className="text-muted-foreground mt-2 text-base">
                  We'll review your requirements and be in touch shortly.
                </p>
              </div>
            </div>

            {/* Quote number badge */}
            <div className="rounded-xl border border-border bg-secondary/40 px-8 py-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">
                Your Quote Reference
              </p>
              <p className="text-5xl font-bold font-display text-primary">
                Quote #{quoteNumber}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please keep this number for your records.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3">
              <h2 className="font-semibold font-display text-base">What happens next?</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-none">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
                  <span>Our team will review your requirements and prepare a tailored quote.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
                  <span>We'll reach out via email within one business day with your custom pricing.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">3</span>
                  <span>A confirmation email with your quote reference has been sent to your inbox.</span>
                </li>
              </ol>
            </div>

            <p className="text-sm text-muted-foreground">
              Questions? Email us at{" "}
              <a
                href="mailto:sam@launchhouse.events"
                className="text-primary underline hover:text-primary/80"
              >
                sam@launchhouse.events
              </a>
            </p>

            <Button onClick={() => window.close()} size="lg" className="w-full sm:w-auto">
              Close Window
            </Button>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} LaunchHouse Events. All rights reserved.
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <img
          src={bannerImg}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay to ensure logo/text always readable */}
        <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <Logo light />
          <h1 className="text-2xl md:text-4xl font-bold font-display text-white mt-4 drop-shadow-lg">
            Get a Quote
          </h1>
          <p className="text-white/85 text-sm md:text-base mt-2 drop-shadow max-w-md">
            Tell us about your event and we'll prepare a tailored quote for you
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="container max-w-2xl py-10 pb-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ── Contact Info ─────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-card">
            <h2 className="text-lg font-bold font-display border-b border-border pb-3">
              Contact Information
            </h2>

            <Field label="Full Name" required error={errors.fullName?.message}>
              <Input
                {...register("fullName")}
                placeholder="Jane Smith"
                className={errors.fullName ? "border-destructive" : ""}
              />
            </Field>

            <Field label="Email" required error={errors.email?.message}>
              <Input
                type="email"
                {...register("email")}
                placeholder="jane@company.com"
                className={errors.email ? "border-destructive" : ""}
              />
            </Field>
          </div>

          {/* ── Event Details ─────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-card">
            <h2 className="text-lg font-bold font-display border-b border-border pb-3">
              Event Details
            </h2>

            {/* New or clone */}
            <Field
              label="Is this a new event or a cloned event?"
              required
              error={errors.eventTypeNewOrClone?.message}
            >
              <Controller
                control={control}
                name="eventTypeNewOrClone"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-3 mt-1"
                  >
                    {["New Event", "Existing Event"].map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                          field.value === opt
                            ? "border-primary bg-secondary/50"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={opt} />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            {/* Event type */}
            <Field
              label="Event Type"
              required
              error={errors.eventType?.message}
            >
              <Controller
                control={control}
                name="eventType"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-3 mt-1"
                  >
                    {["In-Person", "Virtual", "Hybrid"].map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                          field.value === opt
                            ? "border-primary bg-secondary/50"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={opt} />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            {/* Event launch date */}
            <Field
              label="Event Launch Date"
              required
              error={errors.eventLaunchDate?.message}
            >
              <Controller
                control={control}
                name="eventLaunchDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
          </div>

          {/* ── Cvent Technology ─────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-card">
            <h2 className="text-lg font-bold font-display border-b border-border pb-3">
              Cvent Technology
            </h2>

            <Field
              label="What pieces of Cvent technology are you using?"
              required
              error={errors.cventTechnologies?.message}
            >
              <div className="grid sm:grid-cols-2 gap-3 mt-1">
                {CVENT_TECHNOLOGIES.map((tech) => (
                  <label
                    key={tech}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                      watchedTech.includes(tech)
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={watchedTech.includes(tech)}
                      onCheckedChange={(checked) => {
                        const current = watchedTech;
                        const updated = checked
                          ? [...current, tech]
                          : current.filter((t) => t !== tech);
                        setValue("cventTechnologies", updated, {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <span className="text-sm font-medium">{tech}</span>
                  </label>
                ))}
              </div>
            </Field>

            {/* "Other" text input */}
            {watchedTech.includes("Other") && (
              <Field
                label="Please specify the other technology"
                required
                error={errors.cventTechnologiesOther?.message}
              >
                <Input
                  {...register("cventTechnologiesOther")}
                  placeholder="e.g. Cvent Surveys, OnArrival..."
                  className={
                    errors.cventTechnologiesOther ? "border-destructive" : ""
                  }
                />
              </Field>
            )}
          </div>

          {/* ── Scale & Scope ─────────────────────────────────────── */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-card">
            <h2 className="text-lg font-bold font-display border-b border-border pb-3">
              Scale & Scope
            </h2>

            {/* Registration types */}
            <Field
              label="How many Registration Types?"
              required
              error={errors.registrationTypesCount?.message}
            >
              <Controller
                control={control}
                name="registrationTypesCount"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-3 mt-1"
                  >
                    {["0–3", "4–8", "More than 8"].map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                          field.value === opt
                            ? "border-primary bg-secondary/50"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={opt} />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            {/* Sessions count */}
            <Field
              label="How many tentative sessions in total?"
              required
              error={errors.sessionsCount?.message}
            >
              <Controller
                control={control}
                name="sessionsCount"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-3 mt-1"
                  >
                    {["0–10", "11–20", "More than 21"].map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                          field.value === opt
                            ? "border-primary bg-secondary/50"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={opt} />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            {/* Registration options */}
            <Field
              label="What registration options will be available to attendees?"
              required
              error={errors.registrationOptions?.message}
            >
              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                {REGISTRATION_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                      watchedRegOption === opt
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="registrationOptions"
                      value={opt}
                      checked={watchedRegOption === opt}
                      onChange={() => setValue("registrationOptions", opt, { shouldValidate: true })}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          {/* ── Submit ───────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.close()}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={submitting} className="shadow-btn">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Quote Request"
              )}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default GetAQuote;
