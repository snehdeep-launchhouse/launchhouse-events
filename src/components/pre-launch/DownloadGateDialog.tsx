import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import EmailInput from "@/components/EmailInput";
import { zodEmail, type VerificationStatus } from "@/lib/email-validation";
import { isProductionHost, track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { useDownloadGate } from "./DownloadGateContext";

const PDF_HREF = "/resources/LH_Phase_2_Cvent_Pre_Launch_QA_Checklist_v03.pdf";
const PDF_FILENAME = "LaunchHouse-Cvent-Pre-Launch-QA-Checklist.pdf";

const APPROVED_LEAD_TYPE = "pre_launch_checklist_download";
const APPROVED_FORM_NAME = "pre_launch_checklist_download";
const APPROVED_RESOURCE_NAME = "cvent_pre_launch_qa_checklist";
const APPROVED_PAGE_PATH = "/pre-launch-checks";

const GENERIC_ERROR = "Couldn't send your access link. Please try again.";
const NON_PROD_NOTICE =
  "This secure checklist request form is active on the live site.";

type Phase = "form" | "success";

function triggerPdfDownload() {
  const a = document.createElement("a");
  a.href = PDF_HREF;
  a.download = PDF_FILENAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function DownloadGateDialog() {
  const { open, closeDownloadGate, restoreFocus } = useDownloadGate();

  const [email, setEmail] = useState("");
  const [verification, setVerification] = useState<VerificationStatus>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [serverError, setServerError] = useState<string | null>(null);

  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const fallbackLinkRef = useRef<HTMLAnchorElement>(null);

  // Reset internal state whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      // Small delay so closing animation doesn't flash the reset state.
      const t = window.setTimeout(() => {
        setEmail("");
        setVerification("idle");
        setSubmitting(false);
        setServerError(null);
        setPhase("form");
      }, 150);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Move focus to the success heading after success state renders.
  useEffect(() => {
    if (open && phase === "success") {
      requestAnimationFrame(() => {
        (successHeadingRef.current ?? fallbackLinkRef.current)?.focus();
      });
    }
  }, [open, phase]);

  const productionOk = isProductionHost();

  // Zod-validated email (matches existing project convention).
  const emailParse = zodEmail().safeParse(email);
  const regexValid = emailParse.success;

  const canSubmit =
    productionOk &&
    !submitting &&
    regexValid &&
    verification === "valid";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "send-resource-download-notification",
        {
          body: {
            email: email.trim(),
            lead_type: APPROVED_LEAD_TYPE,
            form_name: APPROVED_FORM_NAME,
            resource_name: APPROVED_RESOURCE_NAME,
            page_path: APPROVED_PAGE_PATH,
          },
        },
      );

      if (error) {
        // FunctionsHttpError exposes a safe `context.response` we can read,
        // but to avoid leaking provider details we only surface the safe
        // server-validation message when present, otherwise the generic.
        const ctxResponse = (error as { context?: { response?: Response } }).context?.response;
        let safeMessage: string | null = null;
        if (ctxResponse) {
          try {
            const cloned = ctxResponse.clone();
            const body = await cloned.json();
            if (
              cloned.status === 400 &&
              body &&
              typeof body.error === "string" &&
              body.error.length > 0 &&
              body.error.length < 200
            ) {
              safeMessage = body.error;
            }
          } catch {
            // ignore — fall back to generic
          }
        }
        setServerError(safeMessage ?? GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      if (!data || data.success !== true) {
        setServerError(GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      // ── Success ──
      track("generate_lead", {
        form_name: APPROVED_FORM_NAME,
        lead_type: APPROVED_LEAD_TYPE,
        page_path: APPROVED_PAGE_PATH,
      });

      setPhase("success");
      setSubmitting(false);
      // Kick off the actual download once, after success.
      triggerPdfDownload();
    } catch {
      setServerError(GENERIC_ERROR);
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          closeDownloadGate();
          restoreFocus();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        {phase === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                Get the Cvent Pre-Launch QA Checklist
              </DialogTitle>
              <DialogDescription>
                Enter your work email to access the original printable checklist.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="download-gate-email">Work email</Label>
                <EmailInput
                  id="download-gate-email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (serverError) setServerError(null);
                  }}
                  onVerificationChange={setVerification}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@company.com"
                  required
                  disabled={submitting}
                />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                We'll use your work email to provide access to this checklist.
                We won't add you to a newsletter from this form.
              </p>

              <div
                aria-live="polite"
                role="status"
                className="min-h-[1.25rem] text-sm"
              >
                {!productionOk && (
                  <p className="text-muted-foreground">{NON_PROD_NOTICE}</p>
                )}
                {serverError && (
                  <p className="text-destructive">{serverError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full gap-2"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Email me the checklist
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div aria-live="polite">
            <DialogHeader>
              <DialogTitle asChild>
                <h2
                  ref={successHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-bold font-display tracking-tight outline-none"
                >
                  Your download is starting now.
                </h2>
              </DialogTitle>
              <DialogDescription>
                A confirmation email is also on its way with a fallback link to
                the checklist.
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm mt-4">
              <a
                ref={fallbackLinkRef}
                href={PDF_HREF}
                download={PDF_FILENAME}
                className="text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                If the download does not start, click here.
              </a>
            </p>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeDownloadGate();
                  restoreFocus();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
