import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";

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

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
      {/* Available */}
      <div>
        <p className="text-sm font-medium mb-2">Available</p>
        <div className="border border-input rounded-md min-h-[180px] max-h-[240px] overflow-y-auto bg-background">
          {available.length === 0 && (
            <p className="text-xs text-muted-foreground p-3 italic">No items available</p>
          )}
          {available.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleSelect(item, "available")}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border/30 last:border-0 transition-colors ${
                selectedAvailable.includes(item)
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 pt-8">
        <Button type="button" variant="outline" size="icon" onClick={moveAllToChosen} title="Move all right">
          <ChevronsRight className="w-4 h-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={moveToChosen} disabled={selectedAvailable.length === 0} title="Move selected right">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={moveToAvailable} disabled={selectedChosen.length === 0} title="Move selected left">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={moveAllToAvailable} title="Move all left">
          <ChevronsLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Chosen */}
      <div>
        <p className="text-sm font-medium mb-2">Chosen</p>
        <div className="border border-input rounded-md min-h-[180px] max-h-[240px] overflow-y-auto bg-background">
          {chosen.length === 0 && (
            <p className="text-xs text-muted-foreground p-3 italic">No items chosen</p>
          )}
          {chosen.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleSelect(item, "chosen")}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border/30 last:border-0 transition-colors ${
                selectedChosen.includes(item)
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DualListPicker;
