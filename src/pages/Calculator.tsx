import { useEffect } from "react";
import { EventComplexityCalculator } from "@/components/EventComplexityCalculator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { setPageSeo } from "@/lib/seo-head";

const Calculator = () => {
  useEffect(() => {
    return setPageSeo({
      title: "Event Complexity Calculator | LaunchHouse Events",
      description:
        "Score your Cvent event complexity in 16 questions and get an indicative starting price from LaunchHouse Events — Simple, Medium, or Complex build tiers.",
      path: "/calculator",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EventComplexityCalculator />
      <Footer />
    </div>
  );
};

export default Calculator;