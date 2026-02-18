import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const TnCTooltip = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors">
        T&C Apply
      </span>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="max-w-xs p-4 text-left space-y-2">
      <ul className="list-disc list-inside space-y-2 text-xs leading-relaxed">
        <li>Applies to all Simple and eligible Medium Builds</li>
        <li>Advanced and Complex Builds do not qualify for Same Day Deliveries</li>
        <li>Pre-Requisites for same day delivery — Creative Assets like Event Banner, Headers, Fonts, Branding Guidelines, Text Copies should be readily available. Also event logistics like number of registration types, sessions, Event Ticket types should be available from the onset.</li>
        <li>Delays in handing the information will lead to delivery deadline being pushed</li>
      </ul>
    </TooltipContent>
  </Tooltip>
);

export default TnCTooltip;
