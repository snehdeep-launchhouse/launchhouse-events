import { useRef } from "react";
import { ArrowUp, ListChecks, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SECTIONS } from "@/lib/pre-launch/content";
import { sectionAnchorId } from "./ChecklistSection";

type Destination = { label: string; id: string };

function buildDestinations(): Destination[] {
  const list: Destination[] = [
    { label: "Orientation", id: "orientation" },
    { label: "Timing Guide", id: "timing-guide" },
  ];

  for (const s of SECTIONS) {
    list.push({
      label: `Section ${s.letter} — ${s.title}`,
      id: sectionAnchorId(s),
    });
  }

  list.push({ label: "Red Flags — Pause Launch Criteria", id: "red-flags" });
  list.push({ label: "The LaunchHouse Lens", id: "launchhouse-lens" });
  list.push({ label: "Proof-Safe Guardrails", id: "guardrails" });

  return list;
}

type QuickIndexDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Floating dock-like Quick Index overlay.
 *
 * Renders as a translucent layer above the page with independent
 * glass bubbles instead of a side drawer / sheet. Uses Radix Dialog
 * primitives directly so we control the layout fully (no centered
 * card chrome), while keeping focus trap, Escape-to-close, backdrop
 * click, and return-focus behavior.
 */
export default function QuickIndexDrawer({
  open,
  onOpenChange,
}: QuickIndexDrawerProps) {
  const bubbleCloseRef = useRef(false);
  const pendingScrollRef = useRef<string | null>(null);

  const destinations = buildDestinations();

  const handleNavigate = (targetId: string) => {
    bubbleCloseRef.current = true;
    pendingScrollRef.current = targetId;
    onOpenChange(false);
  };

  const performScroll = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const navVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--nav-height")
      .trim();
    const navOffset = parseInt(navVar, 10) || 64;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const top =
      el.getBoundingClientRect().top + window.scrollY - navOffset - 8;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    if (typeof (el as HTMLElement).focus === "function") {
      (el as HTMLElement).focus({ preventScroll: true });
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          data-pl-quick-index
          aria-label="Open quick index"
          aria-haspopup="dialog"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-sm font-medium border border-border bg-background/70 text-foreground backdrop-blur-md shadow-md hover:bg-background/90 active:scale-[0.98] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          <span>Quick Index</span>
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* Soft translucent scrim — page remains softly visible. */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        />

        <DialogPrimitive.Content
          aria-label="Quick index"
          onCloseAutoFocus={(event) => {
            if (bubbleCloseRef.current) {
              event.preventDefault();
              bubbleCloseRef.current = false;
              const target = pendingScrollRef.current;
              pendingScrollRef.current = null;
              if (target) {
                window.setTimeout(() => performScroll(target), 0);
              }
            }
          }}
          className="fixed inset-0 z-50 flex items-stretch justify-start outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          {/* Click-outside layer — clicking empty space closes overlay. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-transparent"
          />

          {/* Floating cluster — soft glass surface, not a hard panel. */}
          <div
            className="relative pointer-events-none flex h-full w-full max-w-[28rem] flex-col"
            style={{
              paddingTop:
                "max(calc(var(--nav-height, 64px) + 1rem), env(safe-area-inset-top))",
              paddingBottom:
                "max(7rem, calc(env(safe-area-inset-bottom) + 6rem))",
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "1rem",
            }}
          >
            <div className="pointer-events-auto relative flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-slate-950/30 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3 pb-3">
                <div>
                  <DialogPrimitive.Title className="text-base font-semibold text-slate-50">
                    Quick Index
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-0.5 text-sm text-slate-300/90">
                    Jump to a section.
                  </DialogPrimitive.Description>
                </div>
                <DialogPrimitive.Close asChild>
                  <button
                    type="button"
                    aria-label="Close quick index"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DialogPrimitive.Close>
              </div>

              <nav
                aria-label="Quick index destinations"
                className="-mx-1 flex-1 overflow-y-auto px-1 py-2"
              >
                <ul className="flex flex-col gap-2.5">
                  {destinations.map((d) => (
                    <li key={d.id} className="flex">
                      <button
                        type="button"
                        onClick={() => handleNavigate(d.id)}
                        className="min-h-[44px] w-full rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-left text-sm font-medium leading-snug text-emerald-50 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.45)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200/40 hover:bg-emerald-300/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        {d.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleNavigate("orientation")}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200/30 bg-emerald-300/15 px-4 py-3 text-sm font-semibold text-emerald-50 shadow-[0_10px_28px_-14px_rgba(16,185,129,0.55)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200/50 hover:bg-emerald-300/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  <span>Scroll to Top</span>
                </button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
