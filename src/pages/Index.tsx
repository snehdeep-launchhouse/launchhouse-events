import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const WhyUsSection = lazy(() => import("@/components/WhyUsSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));

const SectionFallback = () => (
  <div className="py-24 md:py-32" aria-hidden="true" />
);

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <HeroSection />
      <ServicesSection />
      <div className="section-lazy">
        <Suspense fallback={<SectionFallback />}>
          <WhyUsSection />
        </Suspense>
      </div>
      <div className="section-lazy">
        <Suspense fallback={<SectionFallback />}>
          <PricingSection />
        </Suspense>
      </div>
    </main>
    <Footer />
  </div>
);

export default Index;
