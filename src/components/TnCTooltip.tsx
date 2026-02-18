import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { X } from "lucide-react";
import { useState } from "react";

const TnCTooltip = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
          T&C Apply
        </span>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-w-xs p-4 text-left relative">
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <ul className="list-disc list-inside space-y-2 text-xs leading-relaxed pr-4">
          <li>Applies to all Simple and eligible Medium Builds</li>
          <li>Advanced and Complex Builds do not qualify for Same Day Deliveries</li>
          <li>Pre-Requisites for same day delivery — Creative Assets like Event Banner, Headers, Fonts, Branding Guidelines, Text Copies should be readily available. Also event logistics like number of registration types, sessions, Event Ticket types should be available from the onset.</li>
          <li>Delays in handing the information will lead to delivery deadline being pushed</li>
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default TnCTooltip;
