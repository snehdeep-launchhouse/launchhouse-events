import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import TnCTooltip from "@/components/TnCTooltip";
import {
  ArrowUpRight, DollarSign, Layers, Building2, Smartphone,
  Headphones, Video, Code, CheckCircle2, HelpCircle, Zap, Clock, Timer,
} from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import eventCheckin from "@/assets/event-checkin.jpg";

const BUILD_REQUEST_URL = "/build-request";

/* ── Event Build tiers ───────────────────────────────────────────── */
const eventBuilds = [
  {
    icon: CheckCircle2,
    title: "Simple Build",
    price: "From $899",
    description: "Single-page registrations with standard branding and email confirmations. Same-day delivery available.",
    features: ["Single-page registration", "Standard branding", "Email confirmation", "Same-day turnaround"],
    hasTnC: false,
    hasPrice: true,
  },
  {
    icon: Layers,
    title: "Medium Build",
    price: "Custom Quote",
    description: "Multi-page registrations with custom branding, automated workflows, and basic reporting.",
    features: ["Multi-page registration", "Custom branding & design", "Automated email workflows", "Basic reporting setup"],
    hasTnC: false,
    hasPrice: false,
  },
  {
    icon: Building2,
    title: "Advanced Build",
    price: "Custom Quote",
    description: "Complex conditional logic, payment integrations, multi-session support, and advanced analytics.",
    features: ["Complex conditional logic", "Payment integration", "Multi-session support", "Advanced reporting"],
    hasTnC: false,
    hasPrice: false,
  },
  {
    icon: HelpCircle,
    title: "Complex Build",
    price: "Custom Quote",
    description: "Enterprise-grade solutions with approval workflows, API integrations, and dedicated project management.",
    features: ["Approval workflows", "API integrations", "Multi-event management", "Dedicated project manager"],
    hasTnC: false,
    hasPrice: false,
  },
];

/* ── Attendee Hub ────────────────────────────────────────────────── */
const hubServices = [
  {
    icon: Smartphone,
    title: "Attendee Hub Build",
    price: "$1,999",
    description: "Complete Attendee Hub setup including branding, session configuration, speaker profiles, and mobile app readiness.",
  },
  {
    icon: Headphones,
    title: "Premium Hub Support",
    price: "$99/hour",
    description: "Ongoing post-launch support for your Attendee Hub — session updates, speaker changes, and real-time troubleshooting.",
  },
  {
    icon: Video,
    title: "Training Video",
    price: "From $499",
    description: "Custom attendee training video guiding users through your Hub experience, driving adoption and reducing support queries.",
  },
];

/* ── Additional services ─────────────────────────────────────────── */
const additionalServices = [
  {
    icon: Code,
    title: "HTML Support",
    price: "$75/hour",
    category: "Creative Services",
    description: "Custom HTML email templates, registration page enhancements, and branded design elements built to specification.",
  },
  {
    icon: Headphones,
    title: "Post-Launch Support",
    price: "$75/hour",
    category: "Support Services",
    description: "Dedicated technical support during your live event — invitee management, reporting adjustments, and real-time issue resolution.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */
const Pricing = () => {
  useEffect(() => {
    document.title = "Pricing — LaunchHouse Events | Cvent Event Registration Pricing";
    return () => { document.title = "LaunchHouse Events"; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[var(--nav-height)] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/60" />
        </div>
        <div className="container relative py-16 md:py-22 flex flex-col items-center text-center gap-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
            <DollarSign className="w-4 h-4" />
            Transparent Pricing · No Hidden Fees
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight max-w-3xl leading-[1.1] text-white">
            Transparent Pricing, Exceptional Value
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            Premium Cvent expertise without the enterprise price tag. Get a tailored quote in under 24 hours.
          </p>
        </div>
      </section>

      {/* Pricing Philosophy */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Our Approach</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6">
              Why Some Builds Require a Custom Quote
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Think of it this way — building a beach shack is a vastly different undertaking to constructing a five-star resort. Both serve a purpose, but the complexity, materials, and craftsmanship involved are worlds apart. Event registrations work the same way.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A <strong className="text-foreground">Simple Build</strong> follows a well-defined blueprint — we can price it confidently and even deliver it the same day. But Medium, Advanced, and Complex events often carry hidden layers: conditional logic trees, multi-currency payment flows, approval chains, or integrations with your existing tech stack.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Rather than padding a flat rate to cover unknowns, we scope every project individually. That way you only pay for what your event actually needs — nothing more, nothing less. Simple builds start from <strong className="text-foreground">$899</strong>, and for everything else, one of our consultants will provide a transparent breakdown within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Event Build Pricing */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Event Builds</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Registration Build Packages</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Four tiers designed to match every level of event complexity — from a one-page sign-up to a multi-layered enterprise programme.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventBuilds.map((build) => {
              const Icon = build.icon;
              return (
                <div
                  key={build.title}
                  className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-1">{build.title}</h3>
                  <p className="text-2xl font-bold font-display text-primary mb-3">
                    {build.price}
                    {build.hasTnC && <> · <TnCTooltip /></>}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{build.description}</p>
                  <ul className="space-y-2 mb-6">
                    {build.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-auto"
                    variant={build.hasPrice ? "default" : "outline"}
                    onClick={() => window.open(BUILD_REQUEST_URL, "_blank")}
                  >
                    {build.hasPrice ? "Get Started" : "Get a Quote"} <ArrowUpRight className="w-4 h-4 ml-1" />

                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expedited Builds */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Fast-Track</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Expedited Builds</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Need your event live sooner? Our expedited service fast-tracks your build to the front of the queue — without compromising on quality.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl border border-border/50 bg-card-gradient p-8 md:p-10 shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-display">Priority Delivery</h3>
                </div>
                <p className="text-2xl font-bold font-display text-primary mb-4">$299 – $599</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  When timelines are tight and deadlines are non-negotiable, our expedited service ensures your event registration is built, tested, and delivered ahead of schedule. The fee scales with the complexity of your build — a straightforward Simple registration sits at the lower end, while multi-layered Advanced or Complex builds command a higher premium.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Timer className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Prioritised in the build queue — your project jumps to the front</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Accelerated turnaround without cutting corners on quality</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Available across all build tiers — Simple through Complex</span>
                  </li>
                </ul>
                <Button onClick={() => window.open(BUILD_REQUEST_URL, "_blank")}>
                  Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attendee Hub Pricing */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Attendee Hub</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Attendee Hub & Training</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Deliver a polished attendee experience with a branded Hub, ongoing support, and custom training content.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {hubServices.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-1">{s.title}</h3>
                  <p className="text-2xl font-bold font-display text-primary mb-3">{s.price}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.description}</p>
                  <Button className="w-full mt-6" onClick={() => window.open(BUILD_REQUEST_URL, "_blank")}>
                    Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Creative & Support Services */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Specialist Services</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Creative & Support</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              On-demand expertise for HTML builds, post-launch event management, and everything in between.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {additionalServices.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{s.category}</p>
                  <h3 className="text-lg font-bold font-display mb-1">{s.title}</h3>
                  <p className="text-2xl font-bold font-display text-primary mb-3">{s.price}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.description}</p>
                  <Button className="w-full mt-6" onClick={() => window.open(BUILD_REQUEST_URL, "_blank")}>
                    Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventCheckin} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/75" />
        </div>
        <div className="container relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 text-white">
            Ready to Scope Your Event?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Tell us about your event and one of our sales consultants will reach out with a transparent, tailored quote within 24 hours.
          </p>
          <Button size="lg" className="shadow-btn" onClick={() => window.open(BUILD_REQUEST_URL, "_blank")}>
            Contact Us <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
