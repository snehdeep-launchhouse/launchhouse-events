import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { Button } from "@/components/ui/button";
import { useContactPanel } from "@/components/ContactPanelProvider";
import {
  ArrowUpRight, Check, Zap, DollarSign, Clock, Rocket, Shield, Smartphone,
  BookOpen, Headphones, Wrench,
} from "lucide-react";
import heroBanner from "@/assets/banners/pricing-banner.jpg";
import ctaBanner from "@/assets/banners/pricing-cta-banner.jpg";
import TnCTooltip from "@/components/TnCTooltip";

const GET_A_QUOTE_URL = "/get-a-quote";

/* ── Event Build Tiers ───────────────────────────────────────────── */
const tiers = [
  {
    tier: "Simple",
    price: "$899",
    draft: "2 Business Days",
    revision: "1 Business Day",
    features: ["Single-page registration", "Standard branding", "Basic email confirmation", "Up to 2 registration types"],
  },
  {
    tier: "Medium",
    price: "$2,199",
    draft: "2 Business Days",
    revision: "2 Business Days",
    features: ["Multi-page registration", "Custom branding & design", "Automated email workflows", "Basic reporting setup"],
  },
  {
    tier: "Advanced",
    price: "$3,499",
    draft: "3 Business Days",
    revision: "3 Business Days",
    features: ["Complex conditional logic", "Payment integration", "Multi-session support", "Advanced reporting & analytics"],
  },
  {
    tier: "Complex",
    price: "$4,999",
    draft: "4 Business Days",
    revision: "3 Business Days",
    features: ["Approval workflows", "API integrations", "Multi-event management", "Dedicated project manager"],
  },
];

/* ── Attendee Hub Cards ──────────────────────────────────────────── */
const hubCards = [
  { icon: Smartphone, title: "Standard Hub", timeline: "20+ days", desc: "Initial draft plus three feedback rounds to align your Attendee Hub perfectly with your brand." },
  { icon: Rocket, title: "Rush Hub", timeline: "7–21 days", desc: "Fast-tracked configuration with draft and two consolidated rounds of critical changes." },
  { icon: Shield, title: "Premium Hub Management", timeline: "Ongoing", desc: "Complete peace of mind — we handle drafting, revisions, and post-launch session & speaker updates in real-time." },
];

/* ── Additional Services ─────────────────────────────────────────── */
const additionalServices = [
  { icon: BookOpen, title: "Cvent Platform Training", desc: "Hands-on training sessions for your team to master the Cvent platform and maximize your investment." },
  { icon: Headphones, title: "Post Launch Support", desc: "Ongoing technical support and troubleshooting after your event registration goes live." },
  { icon: Wrench, title: "Custom Tasks", desc: "Ad-hoc requests and custom development work tailored to your unique event requirements." },
];

const Pricing = () => {
  const { openContactPanel } = useContactPanel();

  useEffect(() => {
    document.title = "Pricing — LaunchHouse Events | Transparent, Complexity-Based Pricing";
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
            <Zap className="w-4 h-4" />
            Transparent, Complexity-Based Pricing
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight max-w-4xl leading-[1.1] text-white">
            Know Exactly{" "}
            <span className="text-white/80">What You're Paying For.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            No hidden fees. No surprise invoices. Our pricing is structured around event complexity so you get a fair, predictable quote every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button size="lg" className="shadow-btn" onClick={() => window.open(GET_A_QUOTE_URL, "_blank")}>
              Get a Quote <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20" onClick={openContactPanel}>
              Talk to Us
            </Button>
          </div>

          <p className="text-sm text-white/60 mt-4">
            Starting at <strong className="text-white">$899</strong> · Same-day delivery available <TnCTooltip />
          </p>
        </div>
      </section>

      {/* ── Event Build Tiers ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Event Build Tiers</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Transparent, complexity-based pricing. Unlimited revisions within your allocated hours.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((p) => (
              <div
                key={p.tier}
                className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
              >
                <p className="text-sm font-semibold text-primary mb-1">{p.tier}</p>
                <p className="text-3xl font-bold font-display mb-1">{p.price}</p>
                <p className="text-xs text-muted-foreground mb-4">Starting price</p>
                <div className="text-xs text-muted-foreground space-y-1 mb-4 pb-4 border-b border-border/50">
                  <p>First Draft: <span className="font-medium text-foreground">{p.draft}</span></p>
                  <p>Revisions: <span className="font-medium text-foreground">{p.revision}</span></p>
                </div>
                <ul className="space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Same Day Delivery & Payment Options ──────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Same Day Delivery */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">Same Day Delivery</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Available for <span className="font-semibold text-foreground">Simple</span> and eligible <span className="font-semibold text-foreground">Medium</span> builds. Project must start by <span className="font-semibold text-foreground">8:00 AM ET</span> (Mon–Fri).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Guaranteed delivery by <span className="font-semibold text-foreground">8:00 PM ET</span> — a 12-hour turnaround window. Full refund if we miss the deadline.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Requirements</p>
                <p>100% advance payment required. All creative assets and event logistics must be provided upfront.</p>
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">Payment Options</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 bg-card-gradient p-4 shadow-card">
                  <p className="text-sm font-semibold text-foreground mb-1">Option A — 50 / 50 Split</p>
                  <p className="text-sm text-muted-foreground">50% deposit to start, remaining 50% upon delivery of first draft.</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">Option B — 100% Advance</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Save 10%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Pay in full upfront and receive a 10% discount. Mandatory for Same Day Delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Attendee Hub & Event App ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Attendee Hub</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Attendee Hub & Event App</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Whether you need a branded web hub, mobile app, or both — we have a tier calibrated to your timeline.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {hubCards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold font-display">{c.title}</h4>
                      <span className="text-xs font-semibold text-primary">{c.timeline}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Additional Services ───────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Beyond Builds</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Additional Services</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Extend the value of your Cvent investment with our specialized add-on services.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {additionalServices.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold font-display mb-2">{s.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ctaBanner} alt="" className="banner-img" loading="lazy" decoding="async" width={1920} height={1080} />
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
};

export default Pricing;
