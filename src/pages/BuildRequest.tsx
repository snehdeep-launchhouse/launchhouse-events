import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ArrowLeft, ArrowRight, X, Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DualListPicker from "@/components/DualListPicker";
import Logo from "@/components/Logo";
import bannerImg from "@/assets/event-checkin.jpg";

/* ── Constants ──────────────────────────────────────────────────── */
const US_TIMEZONES = [
  "Eastern (ET)", "Central (CT)", "Mountain (MT)", "Pacific (PT)",
  "Alaska (AKT)", "Hawaii (HT)", "Atlantic (AT)", "Newfoundland (NT)",
];

const TIME_SLOTS = [
  "9:00 AM EST", "10:00 AM EST", "11:00 AM EST", "12:00 PM EST",
  "1:00 PM EST", "2:00 PM EST", "3:00 PM EST", "4:00 PM EST",
];

const SOLUTIONS = [
  "Event Registration & Website Design",
  "Attendee Hub (Website and/or event app)",
  "Appointments",
  "Abstract Management",
  "Survey",
  "On Arrival (Onsite/Badge Creation)",
];

const GLOBAL_TIMEZONES = [
  "UTC-12:00 (Baker Island)", "UTC-11:00 (Samoa)", "UTC-10:00 (Hawaii)", "UTC-09:00 (Alaska)",
  "UTC-08:00 (Pacific)", "UTC-07:00 (Mountain)", "UTC-06:00 (Central)", "UTC-05:00 (Eastern)",
  "UTC-04:00 (Atlantic)", "UTC-03:30 (Newfoundland)", "UTC-03:00 (Buenos Aires)",
  "UTC-02:00 (South Georgia)", "UTC-01:00 (Azores)", "UTC+00:00 (London/GMT)",
  "UTC+01:00 (Berlin/Paris)", "UTC+02:00 (Cairo/Helsinki)", "UTC+03:00 (Moscow/Riyadh)",
  "UTC+03:30 (Tehran)", "UTC+04:00 (Dubai)", "UTC+04:30 (Kabul)",
  "UTC+05:00 (Karachi)", "UTC+05:30 (Mumbai/Delhi)", "UTC+05:45 (Kathmandu)",
  "UTC+06:00 (Dhaka)", "UTC+06:30 (Yangon)", "UTC+07:00 (Bangkok/Jakarta)",
  "UTC+08:00 (Singapore/Beijing)", "UTC+09:00 (Tokyo/Seoul)",
  "UTC+09:30 (Adelaide)", "UTC+10:00 (Sydney)", "UTC+11:00 (Solomon Islands)",
  "UTC+12:00 (Auckland)", "UTC+13:00 (Samoa)", "UTC+14:00 (Line Islands)",
];

const CVENT_LINKS = [
  { label: "Event Management", url: "https://support.cvent.com/s/communityarticle/Getting-Started-with-Event-Management" },
  { label: "Attendee Hub", url: "https://support.cvent.com/s/communityarticle/Welcome-to-Attendee-Hub" },
  { label: "Abstract Management", url: "https://support.cvent.com/s/communityarticle/Creating-an-Abstract-Project" },
  { label: "Appointments", url: "https://support.cvent.com/s/communityarticle/Getting-Started-with-Appointments" },
  { label: "Surveys", url: "https://support.cvent.com/s/communityarticle/Getting-Started-with-Survey" },
];

/* ── Schemas ────────────────────────────────────────────────────── */
const step1Schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  companyName: z.string().trim().min(1, "Company name is required").max(500),
});

const pocContactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
});

const step2Schema = z.object({
  contacts: z.array(pocContactSchema).min(1, "At least one point of contact is required"),
  primaryPocPhone: z.string().trim().min(1, "Contact number is required").max(50),
  kickoffTimezone: z.string().min(1, "Time zone is required"),
  kickoffDate1: z.date({ required_error: "Preference 1 date is required" }),
  kickoffTime1: z.string().min(1, "Preference 1 time is required"),
  kickoffDate2: z.date().optional().nullable(),
  kickoffTime2: z.string().optional(),
  chosenSolutions: z.array(z.string()).min(1, "Select at least one solution"),
});

const step3Schema = z.object({
  accountNumber: z.string().trim().min(1, "Account number is required").max(100),
  plannerFirstName: z.string().trim().min(1, "Planner first name is required").max(100),
  plannerLastName: z.string().trim().min(1, "Planner last name is required").max(100),
  plannerEmail: z.string().trim().email("Invalid email address").max(255),
  eventTitle: z.string().trim().min(1, "Event title is required").max(500),
  eventStartDate: z.date({ required_error: "Start date is required" }),
  eventStartTime: z.string().min(1, "Start time is required"),
  eventEndDate: z.date({ required_error: "End date is required" }),
  eventEndTime: z.string().min(1, "End time is required"),
  eventTimezone: z.string().min(1, "Time zone is required"),
  goLiveDate: z.date({ required_error: "Go-live date is required" }),
  additionalInfo: z.string().max(5000).optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

/* ── DatePicker helper ──────────────────────────────────────────── */
const DatePicker = ({ value, onChange, placeholder }: { value?: Date | null; onChange: (d: Date | undefined) => void; placeholder?: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "PPP") : placeholder || "Pick a date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={value ?? undefined} onSelect={onChange} initialFocus />
    </PopoverContent>
  </Popover>
);

/* ── Generate event time options ───────────────────────────────── */
const EVENT_TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ["00", "15", "30", "45"]) {
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";
    EVENT_TIMES.push(`${hour12}:${m} ${ampm}`);
  }
}

/* ── Page Component ─────────────────────────────────────────────── */
const BuildRequest = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { firstName: "", lastName: "", email: "", companyName: "" } });
  // Step 2
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { contacts: [{ fullName: "", email: "" }], primaryPocPhone: "", kickoffTimezone: "", kickoffTime1: "", kickoffTime2: "", chosenSolutions: [] } });
  // Step 3
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: { accountNumber: "N/A", plannerFirstName: "", plannerLastName: "", plannerEmail: "", eventTitle: "", eventStartTime: "", eventEndTime: "", eventTimezone: "", additionalInfo: "" } });

  const [availableSolutions, setAvailableSolutions] = useState<string[]>([...SOLUTIONS]);
  const [chosenSolutions, setChosenSolutions] = useState<string[]>([]);

  // Sync dual list with form
  useEffect(() => {
    form2.setValue("chosenSolutions", chosenSolutions, { shouldValidate: chosenSolutions.length > 0 });
  }, [chosenSolutions, form2]);

  useEffect(() => {
    document.title = "Build Request — LaunchHouse Events";
    return () => { document.title = "LaunchHouse Events"; };
  }, []);

  const progress = step === 1 ? 33 : step === 2 ? 67 : 100;

  const handleNext1 = form1.handleSubmit(() => setStep(2));
  const handleNext2 = form2.handleSubmit(() => setStep(3));

  const handleSubmit = form3.handleSubmit(async (data3) => {
    setSubmitting(true);
    try {
      const payload = {
        ...form1.getValues(),
        ...form2.getValues(),
        ...data3,
        // Format dates as strings
        kickoffDate1: form2.getValues().kickoffDate1 ? format(form2.getValues().kickoffDate1!, "PPP") : "",
        kickoffDate2: form2.getValues().kickoffDate2 ? format(form2.getValues().kickoffDate2!, "PPP") : "",
        eventStartDate: format(data3.eventStartDate, "PPP"),
        eventEndDate: format(data3.eventEndDate, "PPP"),
        goLiveDate: format(data3.goLiveDate, "PPP"),
        chosenSolutions: chosenSolutions,
      };

      const { data, error } = await supabase.functions.invoke("send-build-request", { body: payload });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Build request submitted successfully!");
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  const handleCancel = () => {
    window.close();
  };

  if (submitted) {
    const s1 = form1.getValues();
    const s3 = form3.getValues();
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header strip */}
        <div className="bg-primary py-5 px-6 flex items-center justify-center">
          <Logo />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Checkmark */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display">Request Submitted!</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                  Thank you, {s1.firstName}!
                </p>
              </div>
            </div>

            {/* Summary card */}
            <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4">
              <h2 className="font-semibold font-display text-base">What happens next?</h2>
              <ol className="space-y-3 text-sm text-muted-foreground list-none">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
                  <span>Our team will review your build request for <strong className="text-foreground">{s3.eventTitle}</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
                  <span>We'll confirm your preferred kick-off call date and send you a calendar invite.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">3</span>
                  <span>A confirmation email has been sent to <strong className="text-foreground">{s1.email}</strong>.</span>
                </li>
              </ol>
            </div>

            <p className="text-sm text-muted-foreground">
              Questions? Email us at{" "}
              <a href="mailto:sam@launchhouse.events" className="text-primary underline hover:text-primary/80">
                sam@launchhouse.events
              </a>
            </p>

            <Button onClick={() => window.close()} size="lg" className="w-full sm:w-auto">
              Close Window
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 text-center text-xs text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} LaunchHouse Events. All rights reserved.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={bannerImg} alt="Build Request" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <Logo />
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white mt-3 drop-shadow-lg">Event Build Request</h1>
          <p className="text-white/90 text-sm mt-1 drop-shadow">Tell us about your event and we'll start building</p>
        </div>
      </div>

      {/* Progress */}
      <div className="container max-w-3xl py-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {progress}% Complete ({step} of 3)
          </span>
          <span className="text-sm font-medium text-primary">
            {step === 1 ? "Basic Information" : step === 2 ? "Contact Information" : "Event Details"}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form */}
      <div className="container max-w-3xl pb-16">
        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleNext1} className="space-y-6">
            <h2 className="text-xl font-bold font-display">Basic Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...form1.register("firstName")} placeholder="John" />
                {form1.formState.errors.firstName && <p className="text-sm text-destructive">{form1.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...form1.register("lastName")} placeholder="Doe" />
                {form1.formState.errors.lastName && <p className="text-sm text-destructive">{form1.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...form1.register("email")} placeholder="john@company.com" />
              {form1.formState.errors.email && <p className="text-sm text-destructive">{form1.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Textarea id="companyName" {...form1.register("companyName")} placeholder="Your company name" />
              {form1.formState.errors.companyName && <p className="text-sm text-destructive">{form1.formState.errors.companyName.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit">Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleNext2} className="space-y-6">
            <h2 className="text-xl font-bold font-display">Contact Information</h2>

            {/* Dynamic POC contacts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Points of Contact *</Label>
                {form2.watch("contacts").length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form2.getValues("contacts");
                      form2.setValue("contacts", [...current, { fullName: "", email: "" }], { shouldValidate: false });
                    }}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Contact
                  </Button>
                )}
              </div>
              {form2.watch("contacts").map((_, idx) => (
                <div key={idx} className="rounded-lg border border-border p-4 space-y-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Contact {idx + 1}{idx === 0 ? " (Primary)" : ""}</span>
                    {idx > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current = form2.getValues("contacts");
                          form2.setValue("contacts", current.filter((_, i) => i !== idx), { shouldValidate: true });
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Full Name *</Label>
                      <Input
                        {...form2.register(`contacts.${idx}.fullName`)}
                        placeholder="Jane Smith"
                      />
                      {form2.formState.errors.contacts?.[idx]?.fullName && (
                        <p className="text-xs text-destructive">{form2.formState.errors.contacts[idx]?.fullName?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email Address *</Label>
                      <Input
                        {...form2.register(`contacts.${idx}.email`)}
                        type="email"
                        placeholder="jane@company.com"
                      />
                      {form2.formState.errors.contacts?.[idx]?.email && (
                        <p className="text-xs text-destructive">{form2.formState.errors.contacts[idx]?.email?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {form2.formState.errors.contacts && !Array.isArray(form2.formState.errors.contacts) && (
                <p className="text-sm text-destructive">{(form2.formState.errors.contacts as any).message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Contact number of primary POC *</Label>
              <Input {...form2.register("primaryPocPhone")} placeholder="+1 (555) 123-4567" />
              {form2.formState.errors.primaryPocPhone && <p className="text-sm text-destructive">{form2.formState.errors.primaryPocPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Your preferred time zone for the Event Build kick off call *</Label>
              <Select value={form2.watch("kickoffTimezone")} onValueChange={(v) => form2.setValue("kickoffTimezone", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select time zone" /></SelectTrigger>
                <SelectContent>
                  {US_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
              {form2.formState.errors.kickoffTimezone && <p className="text-sm text-destructive">{form2.formState.errors.kickoffTimezone.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kick Off Call Date - Preference 1 *</Label>
                <DatePicker value={form2.watch("kickoffDate1")} onChange={(d) => form2.setValue("kickoffDate1", d!, { shouldValidate: true })} />
                {form2.formState.errors.kickoffDate1 && <p className="text-sm text-destructive">{form2.formState.errors.kickoffDate1.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Time Slot - Preference 1 *</Label>
                <Select value={form2.watch("kickoffTime1")} onValueChange={(v) => form2.setValue("kickoffTime1", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form2.formState.errors.kickoffTime1 && <p className="text-sm text-destructive">{form2.formState.errors.kickoffTime1.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kick Off Call Date - Preference 2</Label>
                <DatePicker value={form2.watch("kickoffDate2")} onChange={(d) => form2.setValue("kickoffDate2", d)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Time Slot - Preference 2</Label>
                <Select value={form2.watch("kickoffTime2") || ""} onValueChange={(v) => form2.setValue("kickoffTime2", v)}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cvent Links */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                New to Cvent or not sure which platform to use? Click the links below to learn more before making your selection.
              </p>
              <div className="flex flex-wrap gap-3">
                {CVENT_LINKS.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline hover:text-primary/80">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Dual List */}
            <div className="space-y-2">
              <Label>What solutions does your build project need to include? *</Label>
              <DualListPicker
                available={availableSolutions}
                chosen={chosenSolutions}
                onChangeAvailable={setAvailableSolutions}
                onChangeChosen={setChosenSolutions}
              />
              {form2.formState.errors.chosenSolutions && <p className="text-sm text-destructive">{form2.formState.errors.chosenSolutions.message}</p>}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-1" /> Previous</Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button type="submit">Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold font-display">Event Details</h2>
            <p className="text-sm text-muted-foreground">In this section we will collect some basic information about your event.</p>

            <div className="space-y-2">
              <Label>Account Number (write N/A if you don't have one) *</Label>
              <Input {...form3.register("accountNumber")} placeholder="N/A" />
              {form3.formState.errors.accountNumber && <p className="text-sm text-destructive">{form3.formState.errors.accountNumber.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Planner First Name *</Label>
                <Input {...form3.register("plannerFirstName")} />
                {form3.formState.errors.plannerFirstName && <p className="text-sm text-destructive">{form3.formState.errors.plannerFirstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Planner Last Name *</Label>
                <Input {...form3.register("plannerLastName")} />
                {form3.formState.errors.plannerLastName && <p className="text-sm text-destructive">{form3.formState.errors.plannerLastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Planner Email Address *</Label>
              <Input type="email" {...form3.register("plannerEmail")} placeholder="planner@company.com" />
              <p className="text-xs text-muted-foreground">It will be used for email communication via event</p>
              {form3.formState.errors.plannerEmail && <p className="text-sm text-destructive">{form3.formState.errors.plannerEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Event Title *</Label>
              <Input {...form3.register("eventTitle")} />
              {form3.formState.errors.eventTitle && <p className="text-sm text-destructive">{form3.formState.errors.eventTitle.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Start Date *</Label>
                <DatePicker value={form3.watch("eventStartDate")} onChange={(d) => form3.setValue("eventStartDate", d!, { shouldValidate: true })} />
                {form3.formState.errors.eventStartDate && <p className="text-sm text-destructive">{form3.formState.errors.eventStartDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Event Start Time *</Label>
                <Select value={form3.watch("eventStartTime")} onValueChange={(v) => form3.setValue("eventStartTime", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form3.formState.errors.eventStartTime && <p className="text-sm text-destructive">{form3.formState.errors.eventStartTime.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event End Date *</Label>
                <DatePicker value={form3.watch("eventEndDate")} onChange={(d) => form3.setValue("eventEndDate", d!, { shouldValidate: true })} />
                {form3.formState.errors.eventEndDate && <p className="text-sm text-destructive">{form3.formState.errors.eventEndDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Event End Time *</Label>
                <Select value={form3.watch("eventEndTime")} onValueChange={(v) => form3.setValue("eventEndTime", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form3.formState.errors.eventEndTime && <p className="text-sm text-destructive">{form3.formState.errors.eventEndTime.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Time Zone *</Label>
              <Select value={form3.watch("eventTimezone")} onValueChange={(v) => form3.setValue("eventTimezone", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select time zone" /></SelectTrigger>
                <SelectContent>
                  {GLOBAL_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
              {form3.formState.errors.eventTimezone && <p className="text-sm text-destructive">{form3.formState.errors.eventTimezone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Expected Go Live Date *</Label>
              <DatePicker value={form3.watch("goLiveDate")} onChange={(d) => form3.setValue("goLiveDate", d!, { shouldValidate: true })} />
              {form3.formState.errors.goLiveDate && <p className="text-sm text-destructive">{form3.formState.errors.goLiveDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Additional Information</Label>
              <Textarea {...form3.register("additionalInfo")} placeholder="Any other details you'd like to share..." rows={4} />
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-1" /> Previous</Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...</> : "Submit"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BuildRequest;
