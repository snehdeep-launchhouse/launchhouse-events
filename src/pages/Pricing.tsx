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
import { RotateCcw, Check, Zap, DollarSign, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ctaBanner from "@/assets/banners/pricing-cta-banner.jpg";

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

      {/* ── Static Pricing Details ─────────────────────────────────── */}

      {/* Pricing Tiers */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Event Build Tiers</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Transparent, complexity-based pricing. Unlimited revisions within your allocated hours.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { tier: "Simple", price: "$899", draft: "2 Business Days", revision: "1 Business Day", features: ["Single-page registration", "Standard branding", "Basic email confirmation", "Up to 2 registration types"] },
              { tier: "Medium", price: "$2,199", draft: "2 Business Days", revision: "2 Business Days", features: ["Multi-page registration", "Custom branding & design", "Automated email workflows", "Basic reporting setup"] },
              { tier: "Advanced", price: "$3,499", draft: "3 Business Days", revision: "3 Business Days", features: ["Complex conditional logic", "Payment integration", "Multi-session support", "Advanced reporting & analytics"] },
              { tier: "Complex", price: "$4,999", draft: "4 Business Days", revision: "3 Business Days", features: ["Approval workflows", "API integrations", "Multi-event management", "Dedicated project manager"] },
            ].map((p) => (
              <div
                key={p.tier}
                className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col"
              >
                <p className="text-sm font-semibold text-primary mb-1">{p.tier}</p>
                <p className="text-3xl font-bold font-display mb-1">{p.price}</p>
                <p className="text-xs text-muted-foreground mb-4">Starting price</p>
                <div className="text-xs text-muted-foreground space-y-1 mb-4 pb-4 border-b border-border/50">
                  <p>First Draft: <span className="font-medium text-foreground">{p.draft}</span></p>
                  <p>Revisions: <span className="font-medium text-foreground">{p.revision}</span></p>
                </div>
                <ul className="space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expedited & Payment Options */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Same Day Delivery */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">Same Day Delivery</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Available for <span className="font-semibold text-foreground">Simple</span> and eligible <span className="font-semibold text-foreground">Medium</span> builds. Project must start by <span className="font-semibold text-foreground">8:00 AM ET</span> (Mon–Fri).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Guaranteed delivery by <span className="font-semibold text-foreground">8:00 PM ET</span> — a 12-hour turnaround window. Full refund if we miss the deadline.
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Requirements</p>
                <p>100% advance payment required. All creative assets and event logistics must be provided upfront.</p>
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display">Payment Options</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 bg-card-gradient p-4 shadow-card">
                  <p className="text-sm font-semibold text-foreground mb-1">Option A — 50 / 50 Split</p>
                  <p className="text-sm text-muted-foreground">50% deposit to start, remaining 50% upon delivery of first draft.</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">Option B — 100% Advance</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Save 10%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Pay in full upfront and receive a 10% discount. Mandatory for Same Day Delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attendee Hub Pricing */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Attendee Hub</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Attendee Hub & Event App</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Whether you need a branded web hub, mobile app, or both — we have a tier calibrated to your timeline.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Standard Hub", timeline: "20+ days", desc: "Initial draft plus three feedback rounds to align your Attendee Hub perfectly with your brand." },
              { title: "Rush Hub", timeline: "7–21 days", desc: "Fast-tracked configuration with draft and two consolidated rounds of critical changes." },
              { title: "Premium Hub Management", timeline: "Ongoing", desc: "Complete peace of mind — we handle drafting, revisions, and post-launch session & speaker updates in real-time." },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-border/50 bg-card-gradient p-6 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300">
                <h4 className="font-bold font-display mb-1">{c.title}</h4>
                <span className="text-xs font-semibold text-primary">{c.timeline}</span>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ctaBanner} alt="" className="banner-img" loading="lazy" decoding="async" width={1920} height={1080} />
          <div className="absolute inset-0 bg-[hsl(220,90%,10%)]/75" />
        </div>
        <div className="container relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 text-white">Ready to Get Started?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Tell us about your event and we'll put together a tailored proposal within 24 hours.
          </p>
          <Button size="lg" className="shadow-btn" onClick={() => window.open("/get-a-quote", "_blank")}>
            Get a Quote <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;