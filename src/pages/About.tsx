import { useEffect } from "react";
import { setPageSeo } from "@/lib/seo-head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight, Users, Clock, Award, Globe, Rocket, Heart,
  Target, MapPin, Zap, DollarSign, ShieldCheck,
} from "lucide-react";
import heroBanner from "@/assets/banners/about-banner.jpg";
import ctaBanner from "@/assets/banners/about-cta-banner.jpg";

const BUILD_REQUEST_URL = "/build-request";

/* ── Stats strip ─────────────────────────────────────────────────── */
const stats = [
  { icon: Award, value: "15+", label: "Years of Combined Experience" },
  { icon: MapPin, value: "2025", label: "Founded in Bengaluru" },
  { icon: Clock, value: "24hr", label: "Response Time" },
  { icon: ShieldCheck, value: "Certified", label: "Cvent Experts" },
];

/* ── Team DNA ────────────────────────────────────────────────────── */
const teamPillars = [
  {
    icon: Target,
    title: "Event Consultants",
    description:
      "Domain experts who understand the nuances of event architecture, registration logic, and attendee journeys. They've been in your shoes — and they know exactly how to translate complex requirements into seamless digital experiences.",
  },
  {
    icon: Heart,
    title: "Sales Team",
    description:
      "Advisors who listen first and recommend second. Every conversation starts with understanding your event's scope, audience, and budget — so the solution we propose is the one that actually fits.",
  },
  {
    icon: Rocket,
    title: "Service Team",
    description:
      "Hands-on builders who turn your vision into reality with precision and speed. From first draft to final launch, they obsess over the details so you don't have to.",
  },
];

/* ── Philosophy ──────────────────────────────────────────────────── */
const philosophy = [
  {
    icon: Zap,
    title: "Faster",
    description:
      "Streamlined processes refined over years in the trenches. Same-day delivery capability on simple builds. No sign-off committees, no bureaucratic delays — just expert hands moving at startup speed.",
  },
  {
    icon: DollarSign,
    title: "Cheaper",
    description:
      "Lean operations headquartered in Bengaluru — India's tech capital — mean world-class output without world-class overhead. No bloated retainers, no padded invoices. You pay for craft, not corporate layers.",
  },
  {
    icon: ShieldCheck,
    title: "Better",
    description:
      "Cvent certified. 15+ years of combined event tech expertise. White-glove service standards applied to every build. The result? Registrations that launch on time and experiences that work.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */
const About = () => {
  useEffect(() => {
    return setPageSeo({
      title: "About Us | LaunchHouse Events",
      description:
        "Meet LaunchHouse Events — a Bengaluru-founded Cvent build studio with 30+ years of combined event-tech experience helping commercial event teams ship faster, cheaper, and better.",
      path: "/about",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={[{ name: "About Us", path: "/about" }]} />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[var(--nav-height)] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="banner-img" loading="eager" fetchPriority="high" decoding="async" width={1920} height={1080} />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/60" />
        </div>
        <div className="container relative py-24 md:py-36 flex flex-col items-center text-center gap-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
            <Users className="w-4 h-4" />
            Our Story · Our People · Our Promise
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight max-w-3xl leading-[1.1] text-white">
            Practical Cvent and Event Technology Support for{" "}
            <span className="text-white/80">Lean Event Teams</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            We are practitioners who build, configure, and manage Cvent-powered event experiences on behalf of teams that need expert execution support — not a software pitch.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6">
              Who We Are
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-left md:text-center">
              <p>
                LaunchHouse Events is a B2B professional services company specializing in Cvent event build support, event registration, Attendee Hub configuration, mobile app readiness, OnArrival preparation, event tech QA, reporting, and ongoing event support.
              </p>
              <p>
                We work with lean SMB and commercial event teams — the kind of teams that have a Cvent license, a tight event timeline, and not enough internal bandwidth to build and test event technology properly.
              </p>
              <p>
                Our team brings 15+ years of combined experience working across registration workflows, attendee apps, onsite check-in operations, and live event support. We do not offer generic consulting. We do the work.
              </p>
              <p>
                We built LaunchHouse Events because too many event teams are spending their most limited resource — time — fighting with platform setup instead of running great events. We exist to fix that.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Team DNA */}
      <section className="py-20 md:py-28 section-lazy">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Our Team DNA</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
              Driven by Passion, Backed by Expertise
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Every member of our team shares a singular focus: making event planners' lives easy and painless. Here's who you'll be working with.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {teamPillars.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.title}
                  className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 md:py-28 bg-muted/30 section-lazy">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Our Philosophy</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
              Faster. Cheaper. Better.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Three words that define how we operate — and the competitive edge we pass on to every client.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {philosophy.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Bengaluru */}
      <section className="py-20 md:py-28 section-lazy">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Strategic Advantage</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6">
              Why Bengaluru
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bengaluru isn't just where we're based — it's why we can deliver what we promise. As the epicentre of India's technology ecosystem, the city gives us access to an extraordinary pool of tech-savvy talent, cutting-edge infrastructure, and a culture that thrives on innovation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For our clients, this translates into <strong className="text-foreground">cost-effective operations</strong> passed directly on to you, <strong className="text-foreground">global delivery capability</strong> across every time zone, and a team that works with the rigour and pace of a world-class tech company. It's premium service without the premium postcode.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ctaBanner} alt="" className="banner-img" loading="lazy" decoding="async" width={1920} height={1080} />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/75" />
        </div>
        <div className="container relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 text-white">
            Ready to Talk About Your Next Event Build?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            One of our team members will reach out within 24 hours. No commitment required.
          </p>
          <Button size="lg" className="shadow-btn" onClick={() => window.open(BUILD_REQUEST_URL, "_blank")}>
            Book a Free Consultation <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
          <p className="text-sm text-white/80 mt-6">
            Prefer to talk? Call us at{" "}
            <a href="tel:+15714448523" className="text-white font-semibold hover:underline">
              +1 (571) 444-8523
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
