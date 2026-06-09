import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalculatorV2Wizard } from "@/components/calculator-v2/CalculatorV2Wizard";

const CalculatorV2 = () => {
  useEffect(() => {
    document.title = "Calculator V2";
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
