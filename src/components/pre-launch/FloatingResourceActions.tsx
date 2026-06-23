import { Download, ListChecks } from "lucide-react";
import { PRE_LAUNCH_META } from "@/lib/pre-launch/content";

/**
 * Fixed lower-left stacked glass capsules: Download PDF (top) and
 * Browse checklist (bottom). Hidden in print. Hidden on small screens
 * to avoid overlapping the page's existing sticky CTAs / receptionist.
 */
export default function FloatingResourceActions() {
  return (
    <div
      className="print:hidden fixed left-4 md:left-6 bottom-24 md:bottom-8 z-40 flex flex-col gap-2 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={PRE_LAUNCH_META.pdfPath}
        download={PRE_LAUNCH_META.pdfDownloadName}
        aria-label="Download the Cvent Pre-Launch QA Checklist PDF"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-sm font-medium border border-primary/30 bg-primary/15 text-primary backdrop-blur-md shadow-md hover:bg-primary/25 hover:border-primary/50 active:scale-[0.98] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>Download PDF</span>
      </a>
      <a
        href="#index"
        aria-label="Jump to the searchable checklist index"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-sm font-medium border border-border bg-background/70 text-foreground backdrop-blur-md shadow-md hover:bg-background/90 active:scale-[0.98] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        <span>Browse checklist</span>
      </a>
    </div>
  );
}
