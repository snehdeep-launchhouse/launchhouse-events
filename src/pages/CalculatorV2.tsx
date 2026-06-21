import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalculatorV2Wizard } from "@/components/calculator-v2/CalculatorV2Wizard";
import { setPageSeo } from "@/lib/seo-head";

const CalculatorV2 = () => {
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
      <CalculatorV2Wizard />
      <Footer />
    </div>
  );
};

export default CalculatorV2;
