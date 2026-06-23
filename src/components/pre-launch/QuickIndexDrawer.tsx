import { useRef } from "react";
import { ArrowUp, ListChecks } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export default function QuickIndexDrawer({
  open,
  onOpenChange,
}: QuickIndexDrawerProps) {
  // True only when the latest close was triggered by a bubble click,
  // so we can suppress Sheet's default return-focus-to-trigger for
  // navigation closes while preserving it for Escape / overlay / X.
  const bubbleCloseRef = useRef(false);
  // Pending scroll target captured at bubble click time; consumed once
  // the Sheet has finished closing.
  const pendingScrollRef = useRef<string | null>(null);

  const destinations = buildDestinations();

  /**
   * One shared smooth-scroll helper used by every bubble (including
   * Scroll to Top). Closes the drawer first, then on the next frame
   * after Radix has released the scroll lock, scrolls with the
   * existing --nav-height offset and moves keyboard focus to the
   * destination section. Honors prefers-reduced-motion.
   */
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

    // Section wrappers already carry tabIndex={-1}. preventScroll
    // avoids the browser undoing the smooth scroll we just started.
    if (typeof (el as HTMLElement).focus === "function") {
      (el as HTMLElement).focus({ preventScroll: true });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
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
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[88vw] max-w-[22rem] border-r border-white/10 bg-slate-950/85 p-0 text-slate-100 backdrop-blur-xl"
        onCloseAutoFocus={(event) => {
          if (bubbleCloseRef.current) {
            // Bubble-driven close: skip the default return-focus to
            // the trigger so focus lands on the destination section.
            event.preventDefault();
            bubbleCloseRef.current = false;
            const target = pendingScrollRef.current;
            pendingScrollRef.current = null;
            if (target) {
              // Defer until after the close animation so the body
              // scroll lock is fully released.
              window.setTimeout(() => performScroll(target), 0);
            }
          }
        }}
      >
        <div
          className="flex h-full flex-col"
          style={{
            paddingTop: "max(1.25rem, env(safe-area-inset-top))",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          }}
        >
          <SheetHeader className="px-5 pb-4 text-left">
            <SheetTitle className="text-base font-semibold text-slate-100">
              Quick Index
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-300">
              Jump to a section.
            </SheetDescription>
          </SheetHeader>

          <nav
            aria-label="Quick index"
            className="flex-1 overflow-y-auto px-5 pb-2"
          >
            <ul className="flex flex-col gap-2">
              {destinations.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(d.id)}
                    className="min-h-[44px] w-full rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-left text-sm font-medium leading-snug text-emerald-50 backdrop-blur-md transition-colors hover:border-emerald-300/45 hover:bg-emerald-300/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {d.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-white/10 px-5 pt-4">
            <button
              type="button"
              onClick={() => handleNavigate("orientation")}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/35 bg-emerald-300/15 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-md transition-colors hover:border-emerald-300/55 hover:bg-emerald-300/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              <span>Scroll to Top</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
