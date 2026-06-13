import { useMemo, useState } from "react";
import { ArrowLeft, Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { questions, getRegPathOptionsForContactTypes } from "@/lib/calculator-v2/questions";
import type { QuestionId, QuestionOption, ScoringTrace } from "@/lib/calculator-v2/types";
import { calculateV2 } from "@/lib/calculator-v2/scoring-engine";
import { OptionButtonsV2 } from "./OptionButtonsV2";
import { ProductPickerV2 } from "./ProductPickerV2";
import { EventAppFeaturesV2 } from "./EventAppFeaturesV2";
import { ResultCardV2 } from "./ResultCardV2";
import { LeadFormV2 } from "./LeadFormV2";
import { DescribeEventV2, type DescribeEventV2Result } from "./DescribeEventV2";

type Answers = Partial<Record<QuestionId, number>>;
type Stage = "describe" | "questions" | "products" | "eventAppFeatures" | "lead" | "results";

const EVENT_APP_LABEL = "Event App";

export function CalculatorV2Wizard() {
  const [stage, setStage] = useState<Stage>("describe");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [eventAppFeatures, setEventAppFeatures] = useState<string[]>([]);
  const [trace, setTrace] = useState<ScoringTrace | null>(null);
  const [aiSuggestedProducts, setAiSuggestedProducts] = useState<string[] | null>(null);
  const [aiSuggestedEventApp, setAiSuggestedEventApp] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStep];

  const progressPercent = useMemo(() => {
    const denom = totalQuestions + 3; // products + eventAppFeatures(optional) + lead
    if (stage === "describe") return 0;
    if (stage === "questions") return (currentStep / denom) * 100;
    if (stage === "products") return (totalQuestions / denom) * 100;
    if (stage === "eventAppFeatures") return ((totalQuestions + 1) / denom) * 100;
    if (stage === "lead") return ((totalQuestions + 2) / denom) * 100;
    return 100;
  }, [stage, currentStep, totalQuestions]);

  const handleAnswer = (option: QuestionOption) => {
    const next = { ...answers, [currentQuestion.id]: option.value };
    setAnswers(next);
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setStage("products");
    }
  };

  const handleProductsConfirm = (products: string[]) => {
    setSelectedProducts(products);
    if (products.includes(EVENT_APP_LABEL)) {
      setStage("eventAppFeatures");
    } else {
      computeTraceAndGoToLead(products, [], false);
    }
  };

  const handleEventAppFeaturesConfirm = (features: string[]) => {
    setEventAppFeatures(features);
    computeTraceAndGoToLead(selectedProducts, features, true);
  };

  const computeTraceAndGoToLead = (
    products: string[],
    features: string[],
    eventAppSelected: boolean,
  ) => {
    const result = calculateV2(answers, {
      selectedProducts: products,
      eventAppSelected,
      eventAppFeatures: features,
    });
    setTrace(result);
    setStage("lead");
  };

  const handleLeadSubmitted = () => {
    setStage("results");
  };

  const handleBack = () => {
    // Results stage uses "Start over" only — no back button.
    if (stage === "lead") {
      if (trace?.eventAppSelected) {
        setStage("eventAppFeatures");
      } else {
        setStage("products");
      }
      return;
    }
    if (stage === "eventAppFeatures") {
      setStage("products");
      return;
    }
    if (stage === "products") {
      setStage("questions");
      setCurrentStep(totalQuestions - 1);
      return;
    }
    if (stage === "questions" && currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleRestart = () => {
    setStage("describe");
    setCurrentStep(0);
    setAnswers({});
    setSelectedProducts([]);
    setEventAppFeatures([]);
    setTrace(null);
    setAiSuggestedProducts(null);
    setAiSuggestedEventApp(false);
  };

  const handleDescribeAnalyzed = (r: DescribeEventV2Result) => {
    setAnswers(r.answers);
    setAiSuggestedProducts(r.selectedProducts);
    setAiSuggestedEventApp(r.eventAppSelected);
    setStage("questions");
    setCurrentStep(0);
  };

  const handleDescribeSkip = () => {
    setStage("questions");
    setCurrentStep(0);
  };

  const headerLabel = (() => {
    if (stage === "describe") return "Describe your event (optional)";
    if (stage === "questions") return `Question ${currentStep + 1} of ${totalQuestions}`;
    if (stage === "products") return "Services";
    if (stage === "eventAppFeatures") return "Event App features";
    if (stage === "lead") return "Almost there";
    return "Your results";
  })();

  const canGoBack =
    (stage === "questions" && currentStep > 0) ||
    stage === "products" ||
    stage === "eventAppFeatures" ||
    stage === "lead";

  const backButton = canGoBack ? (
    <Button
      type="button"
      variant="outline"
      onClick={handleBack}
      className="flex w-full items-center justify-center gap-2 sm:w-auto"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  ) : null;

  return (
    <div className="min-h-screen bg-background pb-12 pt-[calc(var(--nav-height)+1.5rem)]">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Complexity Calculator
            </h1>
            {stage === "results" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </Button>
            ) : (
              backButton
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{headerLabel}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="w-full" />
          </div>
        </div>

        {stage === "questions" && (
          <Card className="border-border shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <Calculator className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {currentQuestion.text}
                </h2>
              </div>
              <OptionButtonsV2
                key={currentQuestion.id}
                options={
                  currentQuestion.id === "reg_paths"
                    ? getRegPathOptionsForContactTypes(answers.contact_types)
                    : currentQuestion.options
                }
                selectedValue={answers[currentQuestion.id]}
                onSelect={handleAnswer}
              />
              {backButton && <div className="mt-4 flex justify-start">{backButton}</div>}
            </CardContent>
          </Card>
        )}

        {stage === "describe" && (
          <DescribeEventV2 onAnalyzed={handleDescribeAnalyzed} onSkip={handleDescribeSkip} />
        )}

        {stage === "products" && (
          <Card className="border-border shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="mb-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Which services would you like included?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select all that apply. This helps us scope your build — it does not
                  change your event tier.
                </p>
              </div>
              <ProductPickerV2
                initial={selectedProducts.length > 0 ? selectedProducts : (aiSuggestedProducts ?? [])}
                onConfirm={handleProductsConfirm}
              />
              {backButton && <div className="mt-4 flex justify-start">{backButton}</div>}
            </CardContent>
          </Card>
        )}

        {stage === "eventAppFeatures" && (
          <div className="space-y-4">
            <EventAppFeaturesV2 initial={eventAppFeatures} onConfirm={handleEventAppFeaturesConfirm} />
            {backButton && <div className="flex justify-start">{backButton}</div>}
          </div>
        )}

        {stage === "lead" && trace && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                You're almost there
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your details to unlock your personalised pricing estimate.
              </p>
            </div>
            <LeadFormV2
              answers={answers}
              trace={trace}
              onSubmitted={handleLeadSubmitted}
            />
            {backButton && <div className="flex justify-start">{backButton}</div>}
          </div>
        )}

        {stage === "results" && trace && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Your results are ready
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We've also emailed a copy for your records.
              </p>
            </div>
            <ResultCardV2 trace={trace} answers={answers} />
          </div>
        )}
      </div>
    </div>
  );
}
