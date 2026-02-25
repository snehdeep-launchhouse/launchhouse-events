import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from "lucide-react";

interface DualListPickerProps {
  available: string[];
  chosen: string[];
  onChangeAvailable: (items: string[]) => void;
  onChangeChosen: (items: string[]) => void;
}

const DualListPicker = ({ available, chosen, onChangeAvailable, onChangeChosen }: DualListPickerProps) => {
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedChosen, setSelectedChosen] = useState<string[]>([]);

  const moveToChosen = () => {
    if (selectedAvailable.length === 0) return;
    onChangeChosen([...chosen, ...selectedAvailable]);
    onChangeAvailable(available.filter((i) => !selectedAvailable.includes(i)));
    setSelectedAvailable([]);
  };

  const moveToAvailable = () => {
    if (selectedChosen.length === 0) return;
    onChangeAvailable([...available, ...selectedChosen]);
    onChangeChosen(chosen.filter((i) => !selectedChosen.includes(i)));
    setSelectedChosen([]);
  };

  const moveAllToChosen = () => {
    onChangeChosen([...chosen, ...available]);
    onChangeAvailable([]);
    setSelectedAvailable([]);
  };

  const moveAllToAvailable = () => {
    onChangeAvailable([...available, ...chosen]);
    onChangeChosen([]);
    setSelectedChosen([]);
  };

  const toggleSelect = (item: string, list: "available" | "chosen") => {
    if (list === "available") {
      setSelectedAvailable((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else {
      setSelectedChosen((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  const ListBox = ({ items, selected, list, label }: { items: string[]; selected: string[]; list: "available" | "chosen"; label: string }) => (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="border border-input rounded-md min-h-[160px] max-h-[240px] overflow-y-auto bg-background touch-pan-y">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground p-3 italic">No items {list === "available" ? "available" : "chosen"}</p>
        )}
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggleSelect(item, list)}
            className={`w-full text-left px-3 py-2.5 sm:py-2 text-sm border-b border-border/30 last:border-0 transition-colors ${
              selected.includes(item)
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted/50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:items-start">
      {/* Available */}
      <ListBox items={available} selected={selectedAvailable} list="available" label="Available" />

      {/* Controls — horizontal on mobile, vertical on desktop */}
      <div className="flex flex-row sm:flex-col justify-center gap-2 sm:pt-8">
        <Button type="button" variant="outline" size="icon" onClick={moveAllToChosen} title="Move all" className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
          <ChevronsDown className="w-4 h-4 sm:hidden" />
          <ChevronsRight className="w-4 h-4 hidden sm:block" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={moveToChosen} disabled={selectedAvailable.length === 0} title="Move selected" className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
          <ChevronDown className="w-4 h-4 sm:hidden" />
          <ChevronRight className="w-4 h-4 hidden sm:block" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={moveToAvailable} disabled={selectedChosen.length === 0} title="Move selected back" className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
          <ChevronUp className="w-4 h-4 sm:hidden" />
          <ChevronLeft className="w-4 h-4 hidden sm:block" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={moveAllToAvailable} title="Move all back" className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
          <ChevronsUp className="w-4 h-4 sm:hidden" />
          <ChevronsLeft className="w-4 h-4 hidden sm:block" />
        </Button>
      </div>

      {/* Chosen */}
      <ListBox items={chosen} selected={selectedChosen} list="chosen" label="Chosen" />
    </div>
  );
};

export default DualListPicker;
