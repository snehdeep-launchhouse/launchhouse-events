import { ShieldCheck, Clock, Award, DollarSign } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "Cvent Certified",
    description: "Our team holds official Cvent certifications — we know the platform inside and out.",
  },
  {
    icon: Clock,
    title: "Same-Day Delivery",
    description: "Need it built today? Our Simple package includes same-day turnaround at just $899.",
  },
  {
    icon: DollarSign,
    title: "Transparent Value",
    description: "No hidden fees, no bloated retainers. You pay for what you need — and nothing more.",
  },
  {
    icon: ShieldCheck,
    title: "30+ Years Experience",
    description: "Collective decades of event tech expertise across industries, audiences, and formats.",
  },
];

const WhyUsSection = () => (
  <section id="why-us" className="py-24 md:py-32 bg-secondary/40">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Why Launch House</p>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          Faster. Cheaper. Better.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          We built our practice around one idea: expert Cvent work shouldn't cost a fortune or take forever.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {reasons.map((r) => (
          <div key={r.title} className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <r.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold font-display">{r.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUsSection;
