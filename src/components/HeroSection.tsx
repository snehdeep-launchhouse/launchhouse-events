import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
const heroBanner = "/hero-banner.jpg";
import TnCTooltip from "@/components/TnCTooltip";
import { useContactPanel } from "@/components/ContactPanelProvider";

const HeroSection = () => {
  const { openContactPanel } = useContactPanel();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-[var(--nav-height)] overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" loading="eager" fetchPriority="high" decoding="async" width={1436} height={808} />
        <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/60" />
      </div>
      <div className="container relative py-24 md:py-36 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
          <Zap className="w-4 h-4" />
          Cvent Certified · 15+ Years Combined Experience
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight max-w-4xl leading-[1.1] text-white">
          Your Cvent Events, Built and Ready to{" "}
          <span className="text-white/80">Launch</span>
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
          Practical Cvent event build support for lean US event teams. We handle registration builds, Attendee Hub, mobile app readiness, and ongoing support — so your team can focus on running the event.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button size="lg" className="shadow-btn" onClick={() => scrollTo("#pricing")}>
            View Packages <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20" onClick={openContactPanel}>
            Talk to Us
          </Button>
        </div>

        <p className="text-sm text-white/60 mt-4">
          Simple builds from <strong className="text-white">$899</strong> · Same-day delivery from $1,199 · <TnCTooltip />
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
