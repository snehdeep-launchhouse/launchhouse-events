import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { Button } from "@/components/ui/button";
import { useContactPanel } from "@/components/ContactPanelProvider";
import {
  ArrowUpRight, CheckCircle2, Zap, DollarSign, Clock,
  Smartphone, Headphones, Code2, Video,
  CircleCheckBig, Layers, FileBarChart, HelpCircle,
} from "lucide-react";
import heroBanner from "@/assets/banners/pricing-banner.jpg";
import ctaBanner from "@/assets/banners/pricing-cta-banner.jpg";

const GET_A_QUOTE_URL = "/get-a-quote";

/* ── Registration Build Packages ─────────────────────────────────── */
const buildPackages = [
  {
    icon: CircleCheckBig,
    title: "Simple Build",
    price: "From $899",
    desc: "Single-page registrations with standard branding and email confirmations. Same-day delivery available.",
    features: ["Single-page registration", "Standard branding", "Email confirmation", "Same-day turnaround"],
    cta: "Get Started",
    ctaVariant: "default" as const,
  },
  {
    icon: Layers,
    title: "Medium Build",
    price: "Custom Quote",
    desc: "Multi-page registrations with custom branding, automated workflows, and basic reporting.",
    features: ["Multi-page registration", "Custom branding & design", "Automated email workflows", "Basic reporting setup"],
    cta: "Get a Quote",
    ctaVariant: "outline" as const,
  },
  {
    icon: FileBarChart,
    title: "Advanced Build",
    price: "Custom Quote",
    desc: "Complex conditional logic, payment integrations, multi-session support, and advanced analytics.",
    features: ["Complex conditional logic", "Payment integration", "Multi-session support", "Advanced reporting"],
    cta: "Get a Quote",
    ctaVariant: "outline" as const,
  },
  {
    icon: HelpCircle,
    title: "Complex Build",
    price: "Custom Quote",
    desc: "Enterprise-grade solutions with approval workflows, API integrations, and dedicated project management.",
    features: ["Approval workflows", "API integrations", "Multi-event management", "Dedicated project manager"],
    cta: "Get a Quote",
    ctaVariant: "outline" as const,
  },
];

/* ── Attendee Hub & Training ─────────────────────────────────────── */
const hubCards = [
  {
    icon: Smartphone,
    title: "Attendee Hub Build",
    price: "$1,999",
    desc: "Complete Attendee Hub setup including branding, session configuration, speaker profiles, and mobile app readiness.",
  },
  {
    icon: Headphones,
    title: "Premium Hub Support",
    price: "$99/hour",
    desc: "Ongoing post-launch support for your Attendee Hub — session updates, speaker changes, and real-time troubleshooting.",
  },
  {
    icon: Video,
    title: "Training Video",
    price: "From $499",
    desc: "Custom attendee training video guiding users through your Hub experience, driving adoption and reducing support queries.",
  },
];

/* ── Specialist Services ─────────────────────────────────────────── */
const specialistServices = [
  {
    icon: Code2,
    category: "CREATIVE SERVICES",
    title: "HTML Support",
    price: "$75/hour",
    desc: "Custom HTML email templates, registration page enhancements, and branded design elements built to specification.",
  },
  {
    icon: Headphones,
    category: "SUPPORT SERVICES",
    title: "Post-Launch Support",
    price: "$75/hour",
    desc: "Dedicated technical support during your live event — invitee management, reporting adjustments, and real-time issue resolution.",
  },
];

const Pricing = () => {
  const { openContactPanel } = useContactPanel();

  useEffect(() => {
    document.title = "Pricing — LaunchHouse Events | Transparent Pricing, Exceptional Value";
    return () => { document.title = "LaunchHouse Events"; };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BreadcrumbJsonLd items={[{ name: "Pricing", path: "/pricing" }]} />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-[var(--nav-height)] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="banner-img" loading="eager" fetchPriority="high" decoding="async" width={1920} height={1080} />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/60" />
        </div>
        <div className="container relative py-24 md:py-36 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
            <DollarSign className="w-4 h-4" />
            Transparent Pricing · No Hidden Fees
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight max-w-4xl leading-[1.1] text-white">
            Transparent Pricing,{" "}
            <span className="text-white/80">Exceptional Value</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Premium Cvent expertise without the enterprise price tag. Get a tailored quote in under 24 hours.
          </p>
        </div>
      </section>

      {/* ── Why Some Builds Require a Custom Quote ────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Our Approach</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-8">
            Why Some Builds Require a Custom Quote
          </h2>
          <div className="text-muted-foreground leading-relaxed space-y-4 text-sm md:text-base">
            <p>
              Think of it this way — building a beach shack is a vastly different undertaking to constructing a five-star resort. Both serve a purpose, but the complexity, materials, and craftsmanship involved are worlds apart. Event registrations work the same way.
            </p>
            <p>
              A <strong className="text-foreground">Simple Build</strong> follows a well-defined blueprint — we can price it confidently and even deliver it the same day. But Medium, Advanced, and Complex events often carry hidden layers: conditional logic trees, multi-currency payment flows, approval chains, or integrations with your existing tech stack.
            </p>
            <p>
              Rather than padding a flat rate to cover unknowns, we scope every project individually. That way you only pay for what your event actually needs — nothing more, nothing less. Simple builds start from <strong className="text-foreground">$899</strong>, and for everything else, one of our consultants will provide a transparent breakdown within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Registration Build Packages ───────────────────────────────── */}
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
            {buildPackages.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-xl border border-border/50 bg-card p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-1">{p.title}</h3>
                  <p className="text-xl font-bold font-display text-primary mb-3">{p.price}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.desc}</p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Expedited Builds ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Fast-Track</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Expedited Builds</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Need your event live sooner? Our expedited service fast-tracks your build to the front of the queue — without compromising on quality.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border/50 bg-card p-8 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">Priority Delivery</h3>
              </div>
              <p className="text-xl font-bold font-display text-primary mb-4">$299 – $599</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                When timelines are tight and deadlines are non-negotiable, our expedited service ensures your event registration is built, tested, and delivered ahead of schedule. The fee scales with the complexity of your build — a straightforward Simple registration sits at the lower end, while multi-layered Advanced or Complex builds command a higher premium.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Prioritised in the build queue — your project jumps to the front",
                  "Accelerated turnaround without cutting corners on quality",
                  "Available across all build tiers — Simple through Complex",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}>
                Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Attendee Hub & Training ───────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Attendee Hub</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Attendee Hub & Training</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Deliver a polished attendee experience with a branded Hub, ongoing support, and custom training content.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {hubCards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="rounded-xl border border-border/50 bg-card p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold font-display mb-1">{c.title}</h4>
                  <p className="text-xl font-bold font-display text-primary mb-3">{c.price}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{c.desc}</p>
                  <Button className="w-full" onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}>
                    Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Specialist Services: Creative & Support ───────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Specialist Services</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Creative & Support</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              On-demand expertise for HTML builds, post-launch event management, and everything in between.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {specialistServices.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-xl border border-border/50 bg-card p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">{s.category}</p>
                  <h4 className="text-lg font-bold font-display mb-1">{s.title}</h4>
                  <p className="text-xl font-bold font-display text-primary mb-3">{s.price}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{s.desc}</p>
                  <Button className="w-full" onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}>
                    Get Started <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Terms section hidden from UI — data retained for AI agent context */}

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ctaBanner} alt="" className="banner-img" loading="lazy" decoding="async" width={1920} height={1080} />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/75" />
        </div>
        <div className="container relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 text-white">Ready to Scope Your Event?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Tell us about your event and one of our sales consultants will reach out with a transparent, tailored quote within 24 hours.
          </p>
          <Button size="lg" className="shadow-btn" onClick={openContactPanel}>
            Contact Us <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
