import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDF_HREF = "/resources/LH_Phase_2_Cvent_Pre_Launch_QA_Checklist_v03.pdf";
const PDF_FILENAME = "LaunchHouse-Cvent-Pre-Launch-QA-Checklist.pdf";

export default function DownloadPdfBlock() {
  return (
    <section
      id="download"
      tabIndex={-1}
      aria-labelledby="download-heading"
      className="scroll-mt-[var(--nav-height)] py-16 md:py-20 focus:outline-none"
    >
      <div className="container">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm text-center">
          <h2
            id="download-heading"
            className="text-2xl md:text-3xl font-bold font-display tracking-tight"
          >
            Download the original checklist
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Prefer a printable copy? This is the original PDF version of the
            Cvent Pre-Launch QA Checklist — same 14 sections and 112 checks,
            formatted for offline reading and print.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href={PDF_HREF} download={PDF_FILENAME}>
                <Download className="w-4 h-4" aria-hidden="true" />
                Download original PDF
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
