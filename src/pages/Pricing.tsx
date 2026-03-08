import { useState, useRef, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { ChatBubble } from "@/components/ChatBubble";
import { OptionButtons } from "@/components/OptionButtons";
import { ResultCard } from "@/components/ResultCard";
import { LeadForm } from "@/components/LeadForm";
import { DescribeEvent } from "@/components/DescribeEvent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import {
  questions,
  calculateResult,
  getFilteredCventOptions,
  type QuestionOption,
  type Result,
} from "@/lib/calculator-data";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "assistant" | "user";
  content: string;
  questionIndex?: number;
  isResult?: boolean;
  isLeadForm?: boolean;
}

const INTRO_MSG =
  "Hi there! 👋 Welcome to the Launchhouse Event Complexity Calculator.\n\nIn less than 60 seconds, I'll help estimate the complexity of building your event in Cvent, along with typical delivery timelines and starting pricing.\n\nLet's get started.";

const Pricing = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: INTRO_MSG },
  ]);
  const [currentQ, setCurrentQ] = useState(-1); // -1 = describe event phase
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [showOptions, setShowOptions] = useState(true);
  const [showDescribe, setShowDescribe] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Pricing — LaunchHouse Events | Event Complexity Calculator";
    return () => { document.title = "LaunchHouse Events"; };
  }, []);

  const scroll = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, []);

  useEffect(scroll, [messages, scroll]);

  const startManualFlow = () => {
    setShowDescribe(false);
    setCurrentQ(0);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: questions[0].text, questionIndex: 0 },
    ]);
  };

  const handleAIAnalysis = (aiAnswers: Record<string, number>, products: string[]) => {
    setShowDescribe(false);
    setAnswers(aiAnswers);
    setSelectedProducts(products);

    const r = calculateResult(aiAnswers, products);
    setResult(r);
    setCurrentQ(questions.length);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: "✨ Event analyzed automatically" },
      {
        role: "assistant",
        content: "Based on your event description, here's your event assessment:",
        isResult: true,
      },
      { role: "assistant", content: "", isLeadForm: true },
    ]);
  };

  const handleSelect = (selected: QuestionOption | QuestionOption[]) => {
    setShowOptions(false);
    const q = questions[currentQ];

    let userLabel: string;
    let scoreValue: number;

    if (Array.isArray(selected)) {
      userLabel = selected.map((s) => s.label).join(", ");
      scoreValue = selected.reduce((s, o) => s + o.value, 0);
      setSelectedProducts(selected.map((s) => s.label));
    } else {
      userLabel = selected.label;
      scoreValue = selected.value;
    }

    const newAnswers = { ...answers, [q.id]: scoreValue };
    setAnswers(newAnswers);

    const nextQ = currentQ + 1;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userLabel },
    ];

    if (nextQ < questions.length) {
      newMessages.push({
        role: "assistant",
        content: questions[nextQ].text,
        questionIndex: nextQ,
      });
      setCurrentQ(nextQ);
      setTimeout(() => setShowOptions(true), 300);
    } else {
      const r = calculateResult(
        newAnswers,
        Array.isArray(selected) ? selected.map((s) => s.label) : selectedProducts
      );
      setResult(r);
      newMessages.push({
        role: "assistant",
        content: "Based on your answers, here's your event assessment:",
        isResult: true,
      });
      newMessages.push({
        role: "assistant",
        content: "",
        isLeadForm: true,
      });
    }

    setMessages(newMessages);
  };

  const restart = () => {
    setMessages([{ role: "assistant", content: INTRO_MSG }]);
    setCurrentQ(-1);
    setAnswers({});
    setSelectedProducts([]);
    setResult(null);
    setShowOptions(true);
    setShowDescribe(true);
  };

  const progress = result
    ? 100
    : currentQ <= 0
      ? 0
      : (currentQ / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BreadcrumbJsonLd items={[{ name: "Pricing", path: "/pricing" }]} />
      <Navbar />

      {/* Calculator header with progress */}
      <div className="sticky top-[var(--nav-height)] z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold font-display text-foreground">Event Complexity Calculator</h1>
            <p className="text-xs text-muted-foreground">Estimate your Cvent build in under 60 seconds</p>
          </div>
          <div className="flex items-center gap-3">
            {(result || currentQ > 0) && (
              <Button variant="ghost" size="icon" onClick={restart} title="Start over">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-6">
          {messages.map((msg, i) => {
            if (msg.isResult && result) {
              return (
                <div key={i} className="flex flex-col gap-3">
                  <ChatBubble role="assistant">{msg.content}</ChatBubble>
                  <ResultCard result={result} />
                </div>
              );
            }
            if (msg.isLeadForm) {
              return <LeadForm key={i} answers={answers} selectedProducts={selectedProducts} result={result} />;
            }
            return (
              <ChatBubble key={i} role={msg.role}>
                {msg.content}
              </ChatBubble>
            );
          })}

          {/* Describe event section */}
          {showDescribe && !result && (
            <DescribeEvent onAnalyzed={handleAIAnalysis} onSkip={startManualFlow} />
          )}

          {/* Option buttons for current question */}
          {!result && !showDescribe && currentQ >= 0 && showOptions && (
            <OptionButtons
              key={currentQ}
              options={
                questions[currentQ].id === "cvent_products"
                  ? getFilteredCventOptions(answers)
                  : questions[currentQ].options
              }
              multiSelect={questions[currentQ].multiSelect}
              onSelect={handleSelect}
            />
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;