import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRODUCT_OPTIONS } from "@/lib/calculator-v2/questions";

const NOT_SURE = "Not sure / Need guidance";

interface ProductPickerV2Props {
  onConfirm: (selected: string[]) => void;
}

export function ProductPickerV2({ onConfirm }: ProductPickerV2Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    const next = new Set(selected);
    if (label === NOT_SURE) {
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.clear();
        next.add(label);
      }
    } else {
      next.delete(NOT_SURE);
      if (next.has(label)) next.delete(label);
      else next.add(label);
    }
    setSelected(next);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-2 pt-2">
      {PRODUCT_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
            selected.has(opt)
              ? "border-primary bg-accent text-accent-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
              selected.has(opt)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30",
            )}
          >
            {selected.has(opt) && <Check className="h-3 w-3" />}
          </span>
          {opt}
        </button>
      ))}
      <Button
        className="mt-2 self-end"
        disabled={selected.size === 0}
        onClick={() => onConfirm(Array.from(selected))}
      >
        Continue
      </Button>
    </div>
  );
}
