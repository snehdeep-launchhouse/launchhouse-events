import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight } from "lucide-react";
import TnCTooltip from "@/components/TnCTooltip";

const packages = [
  {
    name: "Simple",
    highlight: "Same-day delivery",
    features: ["Single-page registration", "Standard branding", "Basic email confirmation", "Same-day turnaround"],
    hasTnC: true,
  },
  {
    name: "Medium",
    highlight: "Multi-page builds",
    features: ["Multi-page registration", "Custom branding & design", "Automated email workflows", "Basic reporting setup"],
  },
  {
    name: "Advanced",
    highlight: "Full customization",
    features: ["Complex conditional logic", "Payment integration", "Multi-session support", "Advanced reporting & analytics"],
  },
  {
    name: "Complex",
    highlight: "Enterprise-grade",
    features: ["Approval workflows", "API integrations", "Multi-event management", "Dedicated project manager"],
  },
];

const additionalServices = [
  {
    name: "Cvent Platform Training",
    description: "Hands-on training sessions for your team to master the Cvent platform and maximize your investment.",
  },
  {
    name: "Post Launch Support",
    description: "Ongoing technical support and troubleshooting after your event registration goes live.",
  },
  {
    name: "Custom Tasks",
    description: "Ad-hoc requests and custom development work tailored to your unique event requirements.",
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  return (
  <section id="pricing" className="py-24 md:py-32">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Packages</p>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          Four Packages. One Goal.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Starting at $1,199 for a same-day Simple build. <TnCTooltip /> Request a custom quote for your specific needs.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((p) => (
          <div
            key={p.name}
            onClick={() => { navigate("/services"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="relative rounded-xl p-6 border transition-all duration-300 bg-primary text-primary-foreground border-primary shadow-btn cursor-pointer hover:scale-[1.03] hover:shadow-card-hover"
          >
            <h3 className="text-xl font-bold font-display mb-1">{p.name}</h3>
            <p className="text-sm mb-6 text-primary-foreground/70">
              {p.highlight}
            </p>
            <ul className="space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-foreground/80" />
                  <span>
                    {f}
                    {p.hasTnC && f === "Same-day turnaround" && <> <TnCTooltip /></>}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="w-full"
              onClick={(e) => { e.stopPropagation(); window.open("/get-a-quote", "_blank"); }}
            >
              Get a Quote <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      {/* Additional Services */}
      <div className="mt-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Beyond Builds</p>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          Additional Services
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Extend the value of your Cvent investment with our specialized add-on services.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mt-12">
        {additionalServices.map((s) => (
          <div
            key={s.name}
            className="rounded-xl p-6 border border-border/50 bg-card-gradient shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <h3 className="text-lg font-bold font-display mb-2">{s.name}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

};

export default PricingSection;
