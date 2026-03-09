import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, CheckCircle, Clock, DollarSign, CalendarCheck } from "lucide-react";
import { useContactPanel } from "@/components/ContactPanelProvider";
import { OptionButtons } from "@/components/OptionButtons";
import { LeadForm } from "@/components/LeadForm";
import { 
  questions, 
  calculateResultWithTrace, 
  getInferredProducts,
  getFilteredCventOptions,
  type QuestionOption,
  type Result,
  type CalculationTrace
} from "@/lib/calculator-data";

export function EventComplexityCalculator() {
  const { openDemoPanel } = useContactPanel();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [trace, setTrace] = useState<CalculationTrace | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const totalSteps = questions.length;
  const progressPercent = (currentStep / totalSteps) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (selected: QuestionOption | QuestionOption[]) => {
    if (currentQuestion.id === "cvent_products" && Array.isArray(selected)) {
      // Handle multi-select Cvent products
      const productNames = selected.map(opt => opt.label);
      setSelectedProducts(productNames);
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selected.length }));
    } else if (!Array.isArray(selected)) {
      // Handle single select
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selected.value }));
    }

    // Move to next step or show result
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate final result
      const finalAnswers = currentQuestion.id === "cvent_products" && Array.isArray(selected) 
        ? { ...answers, [currentQuestion.id]: selected.length }
        : { ...answers, [currentQuestion.id]: (selected as QuestionOption).value };
      
      const finalProducts = currentQuestion.id === "cvent_products" && Array.isArray(selected)
        ? selected.map(opt => opt.label)
        : selectedProducts;

      const { result: calcResult, trace: calcTrace } = calculateResultWithTrace(finalAnswers, finalProducts);
      setResult(calcResult);
      setTrace(calcTrace);
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelectedProducts([]);
    setResult(null);
    setTrace(null);
    setShowResult(false);
    setLeadSubmitted(false);
  };

  // Get filtered options for Cvent products question
  const getQuestionOptions = () => {
    if (currentQuestion.id === "cvent_products") {
      return getFilteredCventOptions(answers);
    }
    return currentQuestion.options;
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {!leadSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                  <Calculator className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  You're almost there!
                </h1>
                <p className="text-muted-foreground">
                  Enter your details to unlock your personalised pricing estimate
                </p>
              </div>

              <div className="animate-slide-up">
                <LeadForm 
                  answers={answers}
                  selectedProducts={trace?.allProducts || selectedProducts}
                  result={result}
                  onSubmitted={() => setLeadSubmitted(true)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 text-success rounded-full mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Your Event Complexity Analysis
                </h1>
                <p className="text-muted-foreground">
                  Based on your answers, here's our recommended approach
                </p>
              </div>

              <div className="space-y-6 animate-slide-up">
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      {result.complexity} Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Starting Price</p>
                          <p className="font-semibold text-foreground">{result.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/50 text-accent-foreground rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">First Draft</p>
                          <p className="font-semibold text-foreground">{result.firstDraft}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/50 text-secondary-foreground rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revisions</p>
                          <p className="font-semibold text-foreground">{result.revisionTurnaround}</p>
                        </div>
                      </div>
                    </div>

                    {trace?.allProducts && trace.allProducts.length > 0 && (
                      <div className="mt-6 p-4 bg-accent/20 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Recommended Cvent Products:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {trace.allProducts.map((product, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={openDemoPanel}
                    className="gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Schedule a Consultation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRestart}
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              Event Complexity Calculator
            </h1>
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="w-full" />
          </div>
        </div>

        <Card className="border-border shadow-sm animate-fade-in">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {currentQuestion.text}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.multiSelect ? "Select all that apply" : "Choose one option"}
              </p>
            </div>

            <OptionButtons
              options={getQuestionOptions()}
              multiSelect={currentQuestion.multiSelect}
              onSelect={handleAnswer}
            />
          </CardContent>
        </Card>

        {/* Inferred Products Preview */}
        {currentStep > 0 && (
          <div className="mt-6">
            <Card className="border-dashed border-muted">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Auto-detected from your answers:</p>
                  {getInferredProducts(answers).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getInferredProducts(answers).map((product, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs">No products auto-detected yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}