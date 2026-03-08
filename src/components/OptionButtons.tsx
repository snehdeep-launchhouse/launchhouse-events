import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/lib/calculator-data";

interface OptionButtonsProps {
  options: QuestionOption[];
  multiSelect?: boolean;
  onSelect: (selected: QuestionOption | QuestionOption[]) => void;
}

export function OptionButtons({ options, multiSelect, onSelect }: OptionButtonsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (multiSelect) {
    const toggle = (label: string) => {
      const next = new Set(selected);
      if (label === "Not sure / Need help deciding") {
        if (next.has(label)) next.delete(label);
        else {
          next.clear();
          next.add(label);
        }
      } else {
        next.delete("Not sure / Need help deciding");
        if (next.has(label)) next.delete(label);
        else next.add(label);
      }
      setSelected(next);
    };

    return (
      <div className="animate-fade-in flex flex-col gap-2 pt-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => toggle(opt.label)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all",
              selected.has(opt.label)
                ? "border-primary bg-accent text-accent-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                selected.has(opt.label)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30"
              )}
            >
              {selected.has(opt.label) && <Check className="h-3 w-3" />}
            </span>
            {opt.label}
          </button>
        ))}
        <Button
          className="mt-1 self-end"
          disabled={selected.size === 0}
          onClick={() =>
            onSelect(options.filter((o) => selected.has(o.label)))
          }
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-wrap gap-2 pt-2">
      {options.map((opt) => (
        <Button
          key={opt.label}
          variant="outline"
          className="rounded-xl border-border bg-card text-foreground shadow-sm transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground"
          onClick={() => onSelect(opt)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}