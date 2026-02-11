import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";

const packages = [
  {
    name: "Simple",
    highlight: "Same-day delivery",
    features: ["Single-page registration", "Standard branding", "Basic email confirmation", "Same-day turnaround"],
    featured: false,
  },
  {
    name: "Medium",
    highlight: "Most popular",
    features: ["Multi-page registration", "Custom branding & design", "Automated email workflows", "Basic reporting setup"],
    featured: true,
  },
  {
    name: "Advanced",
    highlight: "Full customization",
    features: ["Complex conditional logic", "Payment integration", "Multi-session support", "Advanced reporting & analytics"],
    featured: false,
  },
  {
    name: "Complex",
    highlight: "Enterprise-grade",
    features: ["Approval workflows", "API integrations", "Multi-event management", "Dedicated project manager"],
    featured: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24 md:py-32">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Packages</p>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          Four Packages. One Goal.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Starting at $899 for a same-day Simple build. Request a custom quote for your specific needs.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-xl p-6 border transition-all duration-300 ${
              p.featured
                ? "bg-primary text-primary-foreground border-primary shadow-btn scale-[1.02]"
                : "bg-card-gradient border-border/50 shadow-card hover:shadow-card-hover"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-semibold bg-background text-primary rounded-full border border-primary/20">
                Popular
              </span>
            )}
            <h3 className="text-xl font-bold font-display mb-1">{p.name}</h3>
            <p className={`text-sm mb-6 ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {p.highlight}
            </p>
            <ul className="space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.featured ? "text-primary-foreground/80" : "text-primary"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={p.featured ? "secondary" : "outline"}
              className="w-full"
              onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSeEYyhniQStWFKVJzK7zZionatyya3XTXS96yszdJkbE66UYQ/viewform?usp=header", "_blank")}
            >
              Get a Quote <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
