import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { QuestionId } from "@/lib/calculator-v2/types";

export interface DescribeEventV2Result {
  answers: Partial<Record<QuestionId, number>>;
  selectedProducts: string[];
  eventAppSelected: boolean;
  fieldsNeedingReview: string[];
  assumptions: string[];
  confidence: "high" | "medium" | "low";
}

interface DescribeEventV2Props {
  onAnalyzed: (result: DescribeEventV2Result) => void;
  onSkip: () => void;
}

export function DescribeEventV2({ onAnalyzed, onSkip }: DescribeEventV2Props) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!description.trim()) {
      toast.error("Please describe your event first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-event-v2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ description: description.trim() }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Analysis failed");
      }

      onAnalyzed({
        answers: data.answers ?? {},
        selectedProducts: Array.isArray(data.selectedProducts) ? data.selectedProducts : [],
        eventAppSelected: Boolean(data.eventAppSelected),
        fieldsNeedingReview: Array.isArray(data.fieldsNeedingReview) ? data.fieldsNeedingReview : [],
        assumptions: Array.isArray(data.assumptions) ? data.assumptions : [],
        confidence: data.confidence ?? "low",
      });
    } catch (err: any) {
      console.error("V2 analysis failed:", err);
      toast.error(err.message || "Failed to analyze event. Please try again or answer manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-3 pt-1">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-1">Describe Your Event</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Optionally describe your event and we'll pre-fill the questions for you. You can review and edit every answer before getting your results.
        </p>
        <Textarea
          placeholder="e.g. A 3-day international tech conference with multiple registration paths, speaker submissions, hotel booking, and a branded event app..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none text-sm"
          disabled={loading}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={analyze} disabled={loading || !description.trim()} size="sm">
            {loading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            )}
            {loading ? "Analyzing..." : "Analyze My Event"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onSkip} disabled={loading}>
            Skip — answer manually
          </Button>
        </div>
      </div>
    </div>
  );
}
