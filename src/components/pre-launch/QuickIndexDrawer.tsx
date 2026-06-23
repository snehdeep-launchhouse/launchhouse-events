import { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * Tracks the currently-visible destination as the user scrolls.
 *
 * Strategy: compute a "trigger line" placed just below the fixed site header
 * (plus a small breathing buffer). The active section is the destination
 * whose top has crossed above that line but whose bottom is still below it.
 * Falls back to the last destination once the page is scrolled past the end.
 */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const idsKey = ids.join("|");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ids.length === 0) return;

    let rafId: number | null = null;

    const measureHeaderOffset = (): number => {
      const navVar = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-height")
        .trim();
      const navVarPx = parseInt(navVar, 10) || 0;

      let renderedBottom = 0;
      const candidates = document.querySelectorAll<HTMLElement>(
        "header, [data-site-header], nav[role='navigation']",
      );
      for (const node of Array.from(candidates)) {
        const style = window.getComputedStyle(node);
        if (style.position !== "fixed" && style.position !== "sticky") continue;
        if (style.visibility === "hidden" || style.display === "none") continue;
        const rect = node.getBoundingClientRect();
        if (rect.top > 8 || rect.bottom <= 0) continue;
        if (rect.bottom > renderedBottom) renderedBottom = rect.bottom;
      }
      return Math.max(renderedBottom, navVarPx, 0);
    };

    const compute = () => {
      rafId = null;
      const triggerY = measureHeaderOffset() + 16;

      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - triggerY <= 0) {
          current = id;
        } else {
          break;
        }
      }

      // Near page bottom, snap to the last destination so the indicator
      // doesn't get stuck on a mid-page section.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) current = ids[ids.length - 1] ?? current;

      if (!current) current = ids[0] ?? null;
      setActive((prev) => (prev === current ? prev : current));
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return active;
}

type QuickIndexDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Floating dock-like Quick Index overlay with liquid-glass styling and
 * auto-updating active section indicator.
 */
export default function QuickIndexDrawer({
  open,
  onOpenChange,
}: QuickIndexDrawerProps) {
  const bubbleCloseRef = useRef(false);
  const pendingScrollRef = useRef<string | null>(null);

  const destinations = useMemo(() => buildDestinations(), []);
  const destinationIds = useMemo(
    () => destinations.map((d) => d.id),
    [destinations],
  );
  const activeId = useActiveSection(destinationIds);

  const handleNavigate = (targetId: string) => {
    bubbleCloseRef.current = true;
    pendingScrollRef.current = targetId;
    onOpenChange(false);
  };

  const measureHeaderClearance = (): number => {
    const navVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--nav-height")
      .trim();
    const navVarPx = parseInt(navVar, 10) || 0;

    let renderedBottom = 0;
    const candidates = document.querySelectorAll<HTMLElement>(
      "header, [data-site-header], nav[role='navigation']",
    );
    for (const node of Array.from(candidates)) {
      const style = window.getComputedStyle(node);
      if (style.position !== "fixed" && style.position !== "sticky") continue;
      if (style.visibility === "hidden" || style.display === "none") continue;
      const rect = node.getBoundingClientRect();
      if (rect.top > 8 || rect.bottom <= 0) continue;
      if (rect.bottom > renderedBottom) renderedBottom = rect.bottom;
    }

    const base = Math.max(renderedBottom, navVarPx, 0);
    return base + 40;
  };

  const resolveHeadingElement = (targetId: string): HTMLElement | null => {
    const section = document.getElementById(targetId);
    if (!section) return null;
    const tagged = section.querySelector<HTMLElement>(
      "[data-quick-index-heading]",
    );
    if (tagged) return tagged;
    const h2 = section.querySelector<HTMLElement>("h2");
    if (h2) return h2;
    return section;
  };

  const performScroll = (targetId: string) => {
    const section = document.getElementById(targetId);
    const heading = resolveHeadingElement(targetId);
    if (!heading) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const clearance = measureHeaderClearance();
    const headingRect = heading.getBoundingClientRect();
    const targetY = Math.max(
      0,
      window.scrollY + headingRect.top - clearance,
    );

    window.scrollTo({
      top: targetY,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    const focusTarget =
      typeof (heading as HTMLElement).focus === "function" &&
      heading.tabIndex >= 0
        ? heading
        : section ?? heading;
    if (
      focusTarget &&
      typeof (focusTarget as HTMLElement).focus === "function"
    ) {
      (focusTarget as HTMLElement).focus({ preventScroll: true });
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
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:duration-300 data-[state=closed]:duration-200 data-[state=open]:ease-out data-[state=closed]:ease-in motion-reduce:transition-none motion-reduce:animate-none"
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
                window.requestAnimationFrame(() => {
                  window.requestAnimationFrame(() => performScroll(target));
                });
              }
            }
          }}
          className="fixed inset-0 z-50 flex items-stretch justify-start outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-left-4 data-[state=closed]:slide-out-to-left-4 data-[state=open]:duration-300 data-[state=closed]:duration-200 data-[state=open]:ease-out data-[state=closed]:ease-in motion-reduce:transition-none motion-reduce:animate-none"
        >
          {/* Click-outside layer */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-transparent"
          />

          {/* Floating glass cluster */}
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
            {/* Liquid glass panel */}
            <div
              className="
                pointer-events-auto relative flex min-h-0 flex-1 flex-col overflow-hidden
                rounded-3xl border border-white/15
                bg-slate-900/55 supports-[backdrop-filter]:bg-white/[0.06]
                backdrop-blur-xl md:backdrop-blur-2xl backdrop-saturate-150
                shadow-[0_30px_80px_-20px_rgba(8,47,112,0.6)]
                ring-1 ring-inset ring-white/10
                before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent
                after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-white/10 after:via-white/[0.02] after:to-sky-300/10
              "
            >
              {/* Soft highlight sheen at top */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-3xl bg-gradient-to-b from-white/15 to-transparent"
              />
              {/* Gentle bottom sky glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-3xl bg-gradient-to-t from-sky-400/15 to-transparent"
              />

              <div className="relative flex min-h-0 flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3 pb-3">
                  <div>
                    <DialogPrimitive.Title className="text-base font-semibold text-slate-50">
                      Quick Index
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-0.5 text-sm text-sky-100/80">
                      Jump to a section.
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close asChild>
                    <button
                      type="button"
                      aria-label="Close quick index"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sky-50 backdrop-blur-md transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
                    {destinations.map((d) => {
                      const isActive = d.id === activeId;
                      return (
                        <li key={d.id} className="flex">
                          <button
                            type="button"
                            onClick={() => handleNavigate(d.id)}
                            aria-current={isActive ? "location" : undefined}
                            className={`
                              group relative min-h-[44px] w-full overflow-hidden rounded-2xl
                              px-4 py-3 pl-5 text-left text-sm font-medium leading-snug text-sky-50
                              backdrop-blur-md transition-all duration-200
                              hover:-translate-y-0.5 motion-reduce:hover:translate-y-0
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                              before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
                              ${
                                isActive
                                  ? "border border-sky-200/60 bg-sky-300/25 shadow-[0_10px_28px_-14px_rgba(56,128,255,0.6)] ring-1 ring-sky-300/40"
                                  : "border border-white/15 bg-white/[0.06] shadow-[0_8px_24px_-14px_rgba(8,47,112,0.5)] hover:border-white/30 hover:bg-white/[0.12]"
                              }
                            `}
                          >
                            {/* Active accent bar */}
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none absolute left-1.5 top-2 bottom-2 w-[3px] rounded-full transition-opacity duration-200 ${
                                isActive
                                  ? "bg-sky-300 opacity-100"
                                  : "bg-sky-300 opacity-0"
                              }`}
                            />
                            <span className="relative">{d.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => handleNavigate("orientation")}
                    className="
                      relative inline-flex min-h-[44px] w-full items-center justify-center gap-2 overflow-hidden
                      rounded-2xl border border-white/25 bg-white/[0.1]
                      px-4 py-3 text-sm font-semibold text-sky-50
                      shadow-[0_10px_28px_-14px_rgba(56,128,255,0.55)]
                      backdrop-blur-md transition-all duration-200
                      hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.18]
                      motion-reduce:hover:translate-y-0
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
                      before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent
                    "
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    <span>Scroll to Top</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
