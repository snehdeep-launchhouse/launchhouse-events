import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const WhyUsSection = lazy(() => import("@/components/WhyUsSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));

const SectionFallback = () => (
  <div className="py-24 md:py-32" aria-hidden="true" />
);

const Index = () => {
  // Dynamically preload hero banner only on home page
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/hero-banner.jpg';
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
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
};

export default Index;
