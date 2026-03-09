import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { X } from "lucide-react";
import { useState } from "react";

const TnCTooltip = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-white underline cursor-pointer hover:text-white/80 transition-colors inline text-inherit font-inherit p-0 bg-transparent border-none"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
          T&C Apply
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-w-sm p-4 text-left relative">
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 pr-5">Same Day Delivery — Terms & Conditions</p>
        <ul className="list-disc list-inside space-y-2 text-xs leading-relaxed pr-4">
          <li>Applies to all Simple and eligible Medium Builds only</li>
          <li>Advanced and Complex Builds do not qualify for Same Day Deliveries</li>
          <li>Same Day Delivery means the project will be delivered within 12 hours of receiving all required documents and full advance payment</li>
          <li>Projects must commence on or before 8:00 AM Eastern Time, Monday to Friday, for same-day delivery by 8:00 PM Eastern Time on the same day</li>
          <li>Full payment (100%) in advance is mandatory for all Same Day Delivery engagements</li>
          <li>All creative assets (event banner, headers, fonts, branding guidelines, text copies) and event logistics (registration types, sessions, ticket types) must be provided in full at project commencement</li>
          <li>Delays in handing over any required information will push the delivery deadline accordingly</li>
          <li>If LaunchHouse Events misses the agreed same-day delivery deadline, the client has the right to claim a full refund, which will be processed within 48 hours</li>
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default TnCTooltip;
