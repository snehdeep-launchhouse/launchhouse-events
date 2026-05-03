import { ShieldCheck, Clock, Award, DollarSign } from "lucide-react";
import TnCTooltip from "@/components/TnCTooltip";

const reasons = [
  {
    icon: Award,
    title: "15+ Years of Combined Experience",
    description: "Practitioners with hands-on experience in event registration, attendee apps, and live event operations.",
  },
  {
    icon: Clock,
    title: "Simple Builds from $899",
    description: "Transparent, project-based pricing. No hidden fees. No bloated retainers.",
  },
  {
    icon: DollarSign,
    title: "Same-Day Delivery from $1,199",
    description: "Available for simple and qualified medium builds. Get your registration live when you need it.",
    hasTnC: true,
  },
  {
    icon: ShieldCheck,
    title: "Dedicated Cvent Execution Support",
    description: "Built for event teams that need practical Cvent support, seamless collaboration, and extra hands without adding internal headcount.",
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
          Built by practitioners with hands-on experience across registration, attendee apps, and live event operations — expert Cvent work that doesn't cost a fortune or take forever.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {reasons.map((r) => (
          <div key={r.title} className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <r.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold font-display">{r.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {r.description}
              {r.hasTnC && <> <TnCTooltip /></>}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUsSection;
