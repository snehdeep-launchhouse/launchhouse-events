import { useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EVENT_APP_FEATURES } from "@/lib/calculator-v2/questions";

interface EventAppFeaturesV2Props {
  onConfirm: (features: string[]) => void;
}

export function EventAppFeaturesV2({ onConfirm }: EventAppFeaturesV2Props) {
  const [features, setFeatures] = useState<string[]>([]);

  const toggle = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature],
    );
  };

  return (
    <Card className="animate-fade-in border-border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Which features will your Event App include?
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Select all that apply — these help us scope your build.
          </p>
        </div>

        <div className="grid gap-2.5">
          {EVENT_APP_FEATURES.map((feature) => (
            <label
              key={feature}
              className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-3.5 text-sm transition-colors sm:px-4 sm:py-3 ${
                features.includes(feature)
                  ? "border-primary bg-secondary/50"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Checkbox
                checked={features.includes(feature)}
                onCheckedChange={() => toggle(feature)}
                className="h-5 w-5 sm:h-4 sm:w-4"
              />
              <span className="text-[15px] font-medium sm:text-sm">{feature}</span>
            </label>
          ))}
        </div>

        <Button className="mt-6 w-full gap-2" onClick={() => onConfirm(features)}>
          See my results
        </Button>
      </CardContent>
    </Card>
  );
}
