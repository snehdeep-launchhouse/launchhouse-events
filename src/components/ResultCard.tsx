import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, DollarSign, RefreshCw, CheckCircle2 } from "lucide-react";
import type { Result } from "@/lib/calculator-data";
import { cn } from "@/lib/utils";

const badgeColor: Record<string, string> = {
  Simple: "bg-success text-success-foreground",
  Medium: "bg-primary text-primary-foreground",
  Advanced: "bg-accent-foreground text-primary-foreground",
  Complex: "bg-destructive text-destructive-foreground",
};

const includes = [
  "Event website configuration",
  "Registration setup and workflows",
  "Agenda and session management",
  "Branding and design customization",
  "Testing and launch support",
];

export function ResultCard({ result }: { result: Result }) {
  return (
    <Card className="animate-slide-up overflow-hidden border-primary/20 shadow-lg">
      {/* Header */}
      <div className="border-b border-border bg-accent/40 px-6 py-6 text-center">
        <Badge className={cn("mb-3 text-xs", badgeColor[result.complexity])}>
          {result.complexity}
        </Badge>
        <h2 className="text-2xl font-bold text-foreground">
          {result.complexity} Event Build
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Based on your answers, your event build falls into this complexity
          tier.
        </p>
      </div>

      <CardContent className="grid gap-5 p-6">
        {/* Price & Timeline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Starting Price
              </p>
              <p className="text-2xl font-bold text-foreground">
                {result.price}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  First Draft
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {result.firstDraft}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Revision Turnaround
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {result.revisionTurnaround}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="rounded-xl border border-primary/15 bg-accent/50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            What this usually includes
          </h3>
          <ul className="grid gap-2">
            {includes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}