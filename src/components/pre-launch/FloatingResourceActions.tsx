import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { useDownloadGate } from "./DownloadGateContext";
import QuickIndexDrawer from "./QuickIndexDrawer";

/**
 * Fixed lower-left stacked glass capsules.
 * Top: Quick Index — opens the left-side QuickIndexDrawer.
 * Below: Download PDF — opens the shared email-gated download dialog.
 * Hidden in print.
 */
export default function FloatingResourceActions() {
  const { openDownloadGate } = useDownloadGate();
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const [quickIndexOpen, setQuickIndexOpen] = useState(false);

  return (
    <div
      className="print:hidden fixed left-4 md:left-6 bottom-24 md:bottom-8 z-40 flex flex-col gap-2 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <QuickIndexDrawer
        open={quickIndexOpen}
        onOpenChange={setQuickIndexOpen}
      />
      <button
        ref={downloadBtnRef}
        type="button"
        onClick={() => openDownloadGate(downloadBtnRef.current)}
        aria-label="Download the Cvent Pre-Launch QA Checklist PDF"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-sm font-medium border border-primary/30 bg-primary/15 text-primary backdrop-blur-md shadow-md hover:bg-primary/25 hover:border-primary/50 active:scale-[0.98] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>Download PDF</span>
      </button>
    </div>
  );
}
