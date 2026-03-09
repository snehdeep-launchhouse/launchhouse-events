import { useEffect } from "react";
import { EventComplexityCalculator } from "@/components/EventComplexityCalculator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Calculator = () => {
  useEffect(() => {
    document.title = "Calculator";
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