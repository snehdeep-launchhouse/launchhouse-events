import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/lib/calculator-v2/types";

interface OptionButtonsV2Props {
  options: QuestionOption[];
  onSelect: (option: QuestionOption) => void;
  selectedValue?: number;
}

export function OptionButtonsV2({ options, onSelect, selectedValue }: OptionButtonsV2Props) {
  return (
    <div className="animate-fade-in flex flex-col gap-2 pt-2">
      {options.map((opt) => {
        const isSelected = selectedValue !== undefined && opt.value === selectedValue;
        return (
          <Button
            key={opt.label}
            variant="outline"
            className={cn(
              "h-auto min-h-[3.5rem] w-full max-w-full justify-start whitespace-normal break-words rounded-xl border-border bg-card px-4 py-4 text-left text-sm font-medium leading-snug text-foreground shadow-sm transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground",
              isSelected && "border-primary bg-accent text-accent-foreground",
            )}
            onClick={() => onSelect(opt)}
          >
            <span className="block w-full whitespace-normal break-words">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
