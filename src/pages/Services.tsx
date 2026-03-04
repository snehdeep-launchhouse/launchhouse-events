import Navbar from "@/components/Navbar";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight, Zap, Target, Mountain, Clock, Shield, Rocket,
  Smartphone, Video, BookOpen, Headphones, Wrench,
} from "lucide-react";
import heroBanner from "@/assets/banners/services-banner.jpg";
import eventCheckin from "@/assets/banners/cta-banner.jpg";

const BUILD_REQUEST_URL = "/build-request";
const GET_A_QUOTE_URL = "/get-a-quote";

/* ── Timeline benchmarks ─────────────────────────────────────────── */
const benchmarks = [
  { icon: Zap, label: "The Sprint", time: "5 days", desc: "Agile teams with urgent deadlines can launch a fully functional event fast." },
  { icon: Target, label: "The Standard", time: "4 weeks", desc: "The sweet spot for most organisations — room for stakeholder alignment and revisions." },
  { icon: Mountain, label: "The Marathon", time: "3 months", desc: "Complex programmes with layered requirements managed at a comfortable pace." },
];

/* ── Service tier cards ──────────────────────────────────────────── */
const fullBuildCards = [
  { icon: Clock, title: "Standard Deployment", timeline: "30+ days", desc: "Ideal for teams with healthy lead time. Complete First Draft followed by collaborative revision rounds to fine-tune every detail.", terms: "Concludes upon successful event launch." },
  { icon: Rocket, title: "Rapid Deployment", timeline: "5–21 days", desc: "High-velocity service designed for urgency. We prioritise speed without sacrificing quality, moving quickly from draft to launch.", terms: "Concludes upon event launch." },
  { icon: Shield, title: "Lifecycle Support", timeline: "Ongoing", desc: "Our \"White Glove\" experience — we remain on standby post-launch to manage updates, tweaks, and content changes while your event is live.", terms: "Active until event concludes or hours are consumed." },
];

const hubCards = [
  { icon: Smartphone, title: "Standard Hub", timeline: "20+ days", desc: "Initial draft plus three feedback rounds to align your Attendee Hub perfectly with your brand.", terms: "Concludes upon Hub launch." },
  { icon: Rocket, title: "Rush Hub", timeline: "7–21 days", desc: "Fast-tracked configuration with draft and two consolidated rounds of critical changes.", terms: "Concludes upon Hub launch." },
  { icon: Shield, title: "Premium Hub Management", timeline: "Ongoing", desc: "Complete peace of mind — we handle drafting, revisions, and post-launch session & speaker updates in real-time.", terms: "Active until event concludes or hours are consumed." },
];

/* ── SLA rows ────────────────────────────────────────────────────── */
const slaRows = [
  { level: "Simple", draft: "2 Business Days", revision: "1 Business Day" },
  { level: "Medium", draft: "2 Business Days", revision: "2 Business Days" },
  { level: "Advanced", draft: "3 Business Days", revision: "3 Business Days" },
  { level: "Complex", draft: "4 Business Days", revision: "3 Business Days" },
];

/* ── Additional services ─────────────────────────────────────────── */
const additionalServices = [
  { icon: BookOpen, hook: "Got the tool but not the skills?", title: "Enablement & Training", desc: "Customised, high-impact sessions that go beyond manuals. We teach your team workflow optimisation so they can manage complex events in-house with confidence." },
  { icon: Headphones, hook: "Drowning in attendee emails?", title: "Post-Launch Support", desc: "Dedicated support during the live phase of your event — invitee management, reporting adjustments, and real-time troubleshooting so you can focus on the experience." },
  { icon: Wrench, hook: "Stuck on a technical hurdle?", title: "On-Demand Custom Tasks", desc: "Engage us for specific, isolated challenges — complex registration logic, API integrations, or tricky surveys — without committing to a full build package." },
];

/* ── Reusable card component ─────────────────────────────────────── */
const TierCard = ({ card }: { card: typeof fullBuildCards[0] }) => {
  const Icon = card.icon;
  return (
    <div className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold font-display">{card.title}</h4>
          <span className="text-xs font-semibold text-primary">{card.timeline}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{card.desc}</p>
      <p className="text-xs text-muted-foreground/70 mt-4 pt-3 border-t border-border/50 italic">{card.terms}</p>
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────────── */
const Services = () => (
  <div className="min-h-screen bg-background">
    <BreadcrumbJsonLd items={[{ name: "Services", path: "/services" }]} />
    <Navbar />

    {/* Hero */}
    <section className="relative pt-[var(--nav-height)] overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/60" />
      </div>
      <div className="container relative py-16 md:py-22 flex flex-col items-center text-center gap-6 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight max-w-3xl leading-[1.1] text-white">
          The "White Glove" Approach to Event Tech
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
          Reclaim your time. Let us architect the experience.
        </p>
      </div>
    </section>

    {/* How Long Does It Take */}
    <section className="py-20 md:py-28">
      <div className="container">
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed">
          Hand off the heavy lifting of website creation and registration workflows to a team that lives and breathes event technology. We translate your vision into a polished, fully branded digital reality.
        </p>
        <div className="text-center mb-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Timeline</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">How Long Will It Take?</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            The answer depends on scope and content readiness. Beyond event structure, the biggest variable is often asset aggregation — creative assets, speaker bios, agenda logic, and invite lists.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {benchmarks.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card text-center hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">{b.label}</p>
                <p className="text-2xl font-bold font-display mb-2">{b.time}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Service Tiers */}
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Service Tiers</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Tailored to Your Timeline</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Whether you have months to plan or weeks to execute, we have a deployment model calibrated to your schedule.
          </p>
        </div>

        <Tabs defaultValue="full-build" className="w-full">
          <TabsList className="mx-auto flex w-fit mb-8">
            <TabsTrigger value="full-build">Full Event Builds</TabsTrigger>
            <TabsTrigger value="hub">Attendee Hub & App</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="full-build">
            <div className="grid md:grid-cols-3 gap-6">
              {fullBuildCards.map((c) => <TierCard key={c.title} card={c} />)}
            </div>
          </TabsContent>

          <TabsContent value="hub">
            <div className="grid md:grid-cols-3 gap-6">
              {hubCards.map((c) => <TierCard key={c.title} card={c} />)}
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="max-w-lg mx-auto">
              <div className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold font-display mb-2">Custom Attendee Training Video</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A polished, 5-minute personalised video guide designed to drive adoption and reduce help-desk queries. Tailored to your specific implementation — Web Hub, Mobile App, Appointment Scheduling, or On-Arrival experience.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>

    {/* SLA Table */}
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">SLAs</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Delivery & Turnaround Times</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Predictable timelines from the moment we receive your assets.
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-xl border border-border/50 overflow-hidden shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold">Complexity</TableHead>
                <TableHead className="text-primary-foreground font-semibold">First Draft</TableHead>
                <TableHead className="text-primary-foreground font-semibold">Revision Turnaround</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slaRows.map((r) => (
                <TableRow key={r.level}>
                  <TableCell className="font-medium">{r.level}</TableCell>
                  <TableCell>{r.draft}</TableCell>
                  <TableCell>{r.revision}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4 italic">
          Timelines begin once all necessary content and assets are provided.
        </p>
      </div>
    </section>

    {/* Additional Services */}
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Beyond the Build</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Specialised Services & Strategic Support</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Plug into your workflow exactly where you need us most.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {additionalServices.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-primary mb-1">{s.hook}</p>
                <h4 className="text-lg font-bold font-display mb-2">{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Get a Quote CTA */}
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img src={eventCheckin} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/75" />
      </div>
      <div className="container relative text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 text-white">Ready to Get Started?</h2>
        <p className="text-white/80 max-w-lg mx-auto mb-8">
          Tell us about your event and we'll put together a tailored proposal within 24 hours.
        </p>
        <Button size="lg" className="shadow-btn" onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}>
          Get a Quote <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </section>

    <Footer />
  </div>
);

export default Services;
