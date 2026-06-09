import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  RefreshCw,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoringTrace } from "@/lib/calculator-v2/types";
import { EVENT_APP_PRICE } from "@/lib/calculator-v2/pricing";
import {
  describeConfidence,
  getKeyComplexityDrivers,
} from "@/lib/calculator-v2/scope-summary";

const tierBadgeColor: Record<string, string> = {
  Simple: "bg-success text-success-foreground",
  Medium: "bg-primary text-primary-foreground",
  Advanced: "bg-accent-foreground text-primary-foreground",
  Complex: "bg-destructive text-destructive-foreground",
};

const confidenceBadgeColor: Record<string, string> = {
  high: "bg-success/15 text-success-foreground border-success/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-destructive/10 text-destructive border-destructive/30",
};

interface ResultCardV2Props {
  trace: ScoringTrace;
  answers: Partial<Record<string, number>>;
}

function parsePrice(s: string): number {
  return parseInt(s.replace(/[^\d]/g, ""), 10) || 0;
}

function formatUSD(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function ResultCardV2({ trace, answers }: ResultCardV2Props) {
  const { result, confidenceLevel, manualReviewRequired, manualReviewReasons } = trace;
  const confidence = describeConfidence(confidenceLevel);
  const drivers = getKeyComplexityDrivers(answers as Partial<Record<import("@/lib/calculator-v2/types").QuestionId, number>>);

  const eventBuildPrice = parsePrice(result.price);
  const eventAppPriceN = trace.eventAppSelected ? parsePrice(EVENT_APP_PRICE) : 0;
  const total = eventBuildPrice + eventAppPriceN;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Tier card */}
      <Card className="overflow-hidden border-primary/20 shadow-lg">
        <div className="border-b border-border bg-accent/40 px-6 py-6 text-center">
          <Badge className={cn("mb-3 text-xs", tierBadgeColor[result.complexity])}>
            {result.complexity}
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            {result.complexity} Event Build
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on your answers, your event build falls into this complexity tier.
          </p>
        </div>

        <CardContent className="grid gap-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Starting Price
                </p>
                <p className="text-2xl font-bold text-foreground">{result.price}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  First Draft
                </p>
                <p className="text-base font-semibold text-foreground">{result.firstDraft}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Revision Turnaround
                </p>
                <p className="text-base font-semibold text-foreground">
                  {result.revisionTurnaround}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Estimated Starting Investment
                </p>
                <p className="text-2xl font-bold text-foreground">{formatUSD(total)}</p>
                {trace.eventAppSelected && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Includes Event App add-on ({EVENT_APP_PRICE})
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            Confidence in this estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <Badge
              variant="outline"
              className={cn("self-start text-xs", confidenceBadgeColor[confidenceLevel])}
            >
              {confidence.title}
            </Badge>
            <p className="text-sm text-muted-foreground">{confidence.body}</p>
          </div>
        </CardContent>
      </Card>

      {/* Manual scoping recommendation */}
      {manualReviewRequired && manualReviewReasons.length > 0 && (
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-primary" />
              Scoping call recommended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              A few aspects of your event would benefit from a short scoping conversation so
              we can confirm pricing and timeline accurately:
            </p>
            <ul className="ml-5 list-disc space-y-1 text-sm text-foreground">
              {manualReviewReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Key complexity drivers */}
      {drivers.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Key complexity drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-5 list-disc space-y-1 text-sm text-foreground">
              {drivers.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Selected services */}
      {trace.selectedProductsForScope.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Selected services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-5 list-disc space-y-1 text-sm text-foreground">
              {trace.selectedProductsForScope.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Event App add-on */}
      {trace.eventAppSelected && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-primary" />
              Event App add-on
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Separate add-on — does not affect your event build tier.
              </p>
              <Badge className="text-xs">{EVENT_APP_PRICE}</Badge>
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">
              Event App scope is confirmed during onboarding based on the features you
              selected.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
