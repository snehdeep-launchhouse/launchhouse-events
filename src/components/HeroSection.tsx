import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-[var(--nav-height)] overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-[0.03]" />
      <div className="container relative py-24 md:py-36 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
          <Zap className="w-4 h-4" />
          Cvent Certified · 30+ Years Collective Experience
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight max-w-4xl leading-[1.1]">
          Event Registration,{" "}
          <span className="text-gradient">Done Right.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Your Cvent license is powerful — but only if you know how to use it.
          We build and manage event registrations{" "}
          <strong className="text-foreground">faster, cheaper, and better.</strong>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button size="lg" className="shadow-btn" onClick={() => scrollTo("#pricing")}>
            View Packages <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => scrollTo("#contact")}>
            Talk to Us
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Starting at <strong className="text-foreground">$899</strong> · Same-day delivery available
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
