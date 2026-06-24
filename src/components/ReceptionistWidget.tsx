import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useContactPanel } from "@/components/ContactPanelProvider";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm Chloe, your LaunchHouse assistant. I can help answer questions about event build services, pricing, timelines, and how our process works.";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Session storage keys for engagement tracking
const SESSION_KEYS = {
  hasInteracted: 'widget_has_interacted',
  hasDismissed: 'widget_has_dismissed',
  hasAutoOpened: 'widget_has_auto_opened',
} as const;

const getSessionFlag = (key: string): boolean =>
  sessionStorage.getItem(key) === 'true';

const setSessionFlag = (key: string, value: boolean): void => {
  if (value) sessionStorage.setItem(key, 'true');
  else sessionStorage.removeItem(key);
};
// Conservative section detector for /pre-launch-checks. Only fires when
// the message clearly references one of sections A–N (e.g. "Section D",
// "A.1", a full known section title, or a recognizable slug phrase).
// Bare standalone letters like "A" or "C" are intentionally not matched.
// Server validates the value independently before using it.
const KNOWN_SECTIONS: Array<{ letter: string; title: string; slug: string }> = [
  { letter: "A", title: "Event Website / Registration Page", slug: "event-website-registration-page" },
  { letter: "B", title: "Registration Paths", slug: "registration-paths" },
  { letter: "C", title: "Registration Questions and Logic", slug: "registration-questions-and-logic" },
  { letter: "D", title: "Session Selection", slug: "session-selection" },
  { letter: "E", title: "Pricing / Payment", slug: "pricing-payment" },
  { letter: "F", title: "Confirmation Emails", slug: "confirmation-emails" },
  { letter: "G", title: "Attendee Communications", slug: "attendee-communications" },
  { letter: "H", title: "Modification / Cancellation Flow", slug: "modification-cancellation-flow" },
  { letter: "I", title: "Invitee and Attendee Data", slug: "invitee-and-attendee-data" },
  { letter: "J", title: "Stakeholder Review", slug: "stakeholder-review" },
  { letter: "K", title: "Mobile / Device Testing", slug: "mobile-device-testing" },
  { letter: "L", title: "Accessibility / Readability", slug: "accessibility-readability" },
  { letter: "M", title: "Final Go-Live Readiness", slug: "final-go-live-readiness" },
  { letter: "N", title: "Attendee Hub & Event App", slug: "attendee-hub-event-app" },
];

function detectFocusSection(text: string): string | undefined {
  const lower = text.toLowerCase();
  // "section X" / "section x" — letter must be A–N
  const sectionWord = lower.match(/\bsection\s+([a-n])\b/);
  if (sectionWord) return sectionWord[1].toUpperCase();
  // "X.1".."X.8" — dotted check reference
  const dotted = text.match(/\b([A-Na-n])\s*\.\s*[1-8]\b/);
  if (dotted) return dotted[1].toUpperCase();
  // Known slug phrase, e.g. "registration paths", "session selection"
  for (const s of KNOWN_SECTIONS) {
    const slugPhrase = s.slug.replace(/-/g, " ");
    if (lower.includes(slugPhrase)) return s.letter;
    if (lower.includes(s.title.toLowerCase())) return s.letter;
  }
  return undefined;
}


// Sample the background behind a fixed-position element and report a
// theme ("light"/"dark") plus a `solid` flag that flips on when the
// surface is too light or visually busy (high luminance variance) for
// translucent glass to stay legible. In `solid` mode the consumer
// switches to a near-opaque surface so Chloe never disappears.
type AdaptiveSurface = { theme: "light" | "dark"; solid: boolean };

function useAdaptiveSurface(
  ref: React.RefObject<HTMLElement>,
  active: boolean
): AdaptiveSurface {
  const [state, setState] = useState<AdaptiveSurface>({ theme: "light", solid: false });

  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    let raf = 0;

    const parseRgb = (s: string): [number, number, number, number] | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
      if (parts.length < 3) return null;
      return [parts[0], parts[1], parts[2], parts[3] ?? 1];
    };

    // Walk the stack at (x,y) and return the first opaque-ish background
    // luminance, defaulting to white when nothing qualifies.
    const lumAt = (x: number, y: number, selfEl: HTMLElement): number => {
      const stack = document.elementsFromPoint(x, y);
      for (const node of stack) {
        if (selfEl.contains(node)) continue;
        const bg = getComputedStyle(node as Element).backgroundColor;
        const rgb = parseRgb(bg);
        if (rgb && rgb[3] > 0.1) {
          return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        }
      }
      return 1; // assume white when transparent all the way down
    };

    const sample = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Sample 5 points: center + 4 inset corners. Used both for the
      // dominant tint (center) and to gauge how busy the area is.
      const inset = 6;
      const pts: Array<[number, number]> = [
        [cx, cy],
        [rect.left + inset, rect.top + inset],
        [rect.right - inset, rect.top + inset],
        [rect.left + inset, rect.bottom - inset],
        [rect.right - inset, rect.bottom - inset],
      ].map(([x, y]) => [
        Math.max(1, Math.min(window.innerWidth - 1, x)),
        Math.max(1, Math.min(window.innerHeight - 1, y)),
      ]);

      const lums = pts.map(([x, y]) => lumAt(x, y, el));
      const center = lums[0];
      const min = Math.min(...lums);
      const max = Math.max(...lums);
      const range = max - min;

      // Theme follows the dominant (center) luminance.
      const theme: "light" | "dark" = center > 0.6 ? "light" : "dark";
      // Fallback to a near-opaque surface when:
      //  - background is very bright (translucent white-on-white vanishes), OR
      //  - the area is visually busy (large luminance spread across samples),
      //    which usually means imagery, gradients, or stacked content.
      const solid = max > 0.85 || range > 0.35;

      setState((prev) =>
        prev.theme === theme && prev.solid === solid ? prev : { theme, solid }
      );
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sample();
      });
    };

    sample();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, active]);

  return state;
}

export function ReceptionistWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasAutoOpenedRef = useRef(false);
  const prevMsgCountRef = useRef(1); // start at 1 for the greeting
  const loadingStartRef = useRef<number>(0);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { openDemoPanel } = useContactPanel();

  // Sample the background behind whichever surface is currently shown.
  const pillTheme = useAdaptiveSurface(pillRef, !open && mounted);
  const panelTheme = useAdaptiveSurface(panelRef, open);


  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (pulseTimerRef.current) { clearTimeout(pulseTimerRef.current); pulseTimerRef.current = null; }
    if (autoCloseTimerRef.current) { clearTimeout(autoCloseTimerRef.current); autoCloseTimerRef.current = null; }
    if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; }
  }, []);

  const scroll = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Delayed pill entrance (avoids showing immediately on load)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Suppress idle auto-open + attention pulse on the checklist route.
  // The widget stays manually accessible; we only disable interruption.
  const suppressInterruption = location.pathname === "/pre-launch-checks";

  // Auto-open after 30s idle — desktop only, once per session.
  // Re-keyed on pathname so SPA navigation re-evaluates suppression and
  // pending timers from a previous route are torn down via cleanup.
  useEffect(() => {
    if (suppressInterruption) {
      // Drop any pulse already showing; clear any pending timers from
      // a previous route. Do NOT mutate session engagement flags here.
      setShowPulse(false);
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      if (pulseTimerRef.current) { clearTimeout(pulseTimerRef.current); pulseTimerRef.current = null; }
      return;
    }
    if (
      isMobile ||
      getSessionFlag(SESSION_KEYS.hasInteracted) ||
      getSessionFlag(SESSION_KEYS.hasDismissed)
    ) return;

    // Pulse at 10s to attract attention before auto-open
    pulseTimerRef.current = setTimeout(() => setShowPulse(true), 10000);

    // Auto-open at 30s
    idleTimerRef.current = setTimeout(() => {
      if (!getSessionFlag(SESSION_KEYS.hasInteracted) && !getSessionFlag(SESSION_KEYS.hasDismissed)) {
        setOpen(true);
        wasAutoOpenedRef.current = true;
        setSessionFlag(SESSION_KEYS.hasAutoOpened, true);
        setShowPulse(false);
      }
    }, 30000);

    return clearAllTimers;
  }, [isMobile, clearAllTimers, suppressInterruption]);

  // Auto-collapse after 15s of no interaction (only when auto-opened)
  useEffect(() => {
    if (!open || !wasAutoOpenedRef.current) return;

    autoCloseTimerRef.current = setTimeout(() => {
      setOpen(false);
      wasAutoOpenedRef.current = false;
    }, 15000);

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [open]);

  // Reset auto-close and mark as interacted on any user activity
  const handleUserInteraction = useCallback(() => {
    setSessionFlag(SESSION_KEYS.hasInteracted, true);
    setShowPulse(false);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  useEffect(scroll, [messages, scroll]);

  // Track new assistant messages that arrive while the widget is closed
  useEffect(() => {
    const newCount = messages.length;
    if (!open && newCount > prevMsgCountRef.current) {
      const newMsgs = messages.slice(prevMsgCountRef.current);
      const newAssistant = newMsgs.filter(m => m.role === "assistant").length;
      if (newAssistant > 0) setUnreadCount(prev => prev + newAssistant);
    }
    prevMsgCountRef.current = newCount;
  }, [messages, open]);

  // Minimum typing indicator display time (300ms)
  const MIN_TYPING_DISPLAY = 300;
  useEffect(() => {
    if (loading && messages[messages.length - 1]?.role === "user") {
      loadingStartRef.current = Date.now();
      setShowTypingIndicator(true);
    } else if (!loading || messages[messages.length - 1]?.role === "assistant") {
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = MIN_TYPING_DISPLAY - elapsed;
      if (remaining > 0) {
        typingTimerRef.current = setTimeout(() => setShowTypingIndicator(false), remaining);
      } else {
        setShowTypingIndicator(false);
      }
    }
    return () => {
      if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; }
    };
  }, [loading, messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      handleUserInteraction();
      setUnreadCount(0);
    }
  }, [open, handleUserInteraction]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";

    // Route-aware optional payload. Only /pre-launch-checks ships page_context.
    const isPreLaunch = location.pathname === "/pre-launch-checks";
    const pageContext = isPreLaunch
      ? { route: "/pre-launch-checks", title: "Cvent Pre-Launch QA Checklist" }
      : undefined;
    const focusSection = isPreLaunch ? detectFocusSection(text) : undefined;

    const requestBody: Record<string, unknown> = {
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    };
    if (pageContext) requestBody.page_context = pageContext;
    if (focusSection) requestBody.focus_section = focusSection;

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/receptionist-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to connect");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > history.length) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error("Receptionist error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    handleUserInteraction();
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    setSessionFlag(SESSION_KEYS.hasDismissed, true);
    wasAutoOpenedRef.current = false;
    clearAllTimers();
  }, [clearAllTimers]);

  const handleConsultation = () => {
    handleUserInteraction();
    setOpen(false);
    openDemoPanel();
  };

  const handleCalculator = () => {
    handleUserInteraction();
    setOpen(false);
    if (location.pathname === "/calculator") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/calculator");
    }
  };

  // Mobile: bottom-20 to clear sticky CTA bar; Desktop: bottom-5.
  // On calculator routes, raise mobile offset so the widget never overlaps
  // calculator controls (e.g. Event App feature cards on /calculator-v2).
  const isCalculatorRoute =
    location.pathname === "/calculator" || location.pathname === "/calculator-v2";
  const mobilePos = isCalculatorRoute ? "bottom-32 right-3" : "bottom-20 right-3";
  const positionClass = isMobile ? mobilePos : "bottom-5 right-5";
  const mobilePanelPos = isCalculatorRoute
    ? "bottom-32 right-3 left-3 h-[24rem]"
    : "bottom-20 right-3 left-3 h-[28rem]";

  // Adaptive glass tokens — recomputed when sampled theme/solid changes.
  // `solid` flips on over very bright or visually busy areas so the surface
  // becomes near-opaque and stays legible without losing the glass look.
  const themeVars = (
    surface: { theme: "light" | "dark"; solid: boolean }
  ): React.CSSProperties => {
    const { theme, solid } = surface;
    return theme === "light"
      ? ({
          ["--chloe-surface" as any]: solid ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.55)",
          ["--chloe-surface-strong" as any]: solid ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.75)",
          ["--chloe-border" as any]: solid ? "rgba(15,23,42,0.22)" : "rgba(15,23,42,0.14)",
          ["--chloe-divider" as any]: solid ? "rgba(15,23,42,0.14)" : "rgba(15,23,42,0.08)",
          ["--chloe-fg" as any]: "rgb(15,23,42)",
          ["--chloe-fg-muted" as any]: "rgba(15,23,42,0.65)",
          ["--chloe-user-bg" as any]: solid ? "rgba(0,106,225,0.22)" : "rgba(0,106,225,0.16)",
          ["--chloe-user-fg" as any]: "rgb(15,23,42)",
          ["--chloe-hairline" as any]: "rgba(15,23,42,0.18)",
          ["--chloe-ring" as any]: "rgba(0,106,225,0.55)",
          ["--chloe-ring-offset" as any]: "rgba(255,255,255,0.9)",
        } as React.CSSProperties)
      : ({
          ["--chloe-surface" as any]: solid ? "rgba(8,15,32,0.92)" : "rgba(15,23,42,0.55)",
          ["--chloe-surface-strong" as any]: solid ? "rgba(8,15,32,0.96)" : "rgba(15,23,42,0.75)",
          ["--chloe-border" as any]: solid ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)",
          ["--chloe-divider" as any]: solid ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.12)",
          ["--chloe-fg" as any]: "rgb(240,249,255)",
          ["--chloe-fg-muted" as any]: "rgba(224,242,254,0.75)",
          ["--chloe-user-bg" as any]: solid ? "rgba(125,211,252,0.32)" : "rgba(125,211,252,0.22)",
          ["--chloe-user-fg" as any]: "rgb(240,249,255)",
          ["--chloe-hairline" as any]: "rgba(255,255,255,0.5)",
          ["--chloe-ring" as any]: "rgba(125,211,252,0.7)",
          ["--chloe-ring-offset" as any]: "rgba(8,47,73,0.9)",
        } as React.CSSProperties);
  };

  return (
    <>
      {/* Floating pill — adaptive glass, entrance after 1s delay */}
      {!open && mounted && (
        <button
          ref={pillRef}
          onClick={() => {
            setOpen(true);
            handleUserInteraction();
          }}
          aria-label="Ask Chloe anything"
          style={{
            ...themeVars(pillTheme),
            background: "var(--chloe-surface)",
            color: "var(--chloe-fg)",
            borderColor: "var(--chloe-border)",
          }}
          className={cn(
            "fixed z-50 pointer-events-auto inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-sm font-medium border backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_-12px_rgba(8,47,112,0.35)] hover:[background:var(--chloe-surface-strong)] active:scale-[0.98] transition-[background-color,color,border-color] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:[--tw-ring-color:var(--chloe-ring)] focus-visible:ring-offset-2",
            "animate-widget-pill-entrance",
            showPulse && "animate-widget-pill-pulse",
            positionClass
          )}
          title="Chat with Chloe"
        >
          <span className="relative inline-flex">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-md">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          <span>Ask me anything</span>
        </button>
      )}


      {/* Chat panel — adaptive liquid glass */}
      {open && (
        <div
          ref={panelRef}
          style={{
            ...themeVars(panelTheme),
            background: "var(--chloe-surface)",
            color: "var(--chloe-fg)",
            borderColor: "var(--chloe-border)",
          }}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden rounded-3xl border ring-1 ring-inset",
            "backdrop-blur-xl md:backdrop-blur-2xl backdrop-saturate-150",
            "shadow-[0_30px_80px_-20px_rgba(8,47,112,0.35)]",
            "transition-[background-color,color,border-color] duration-300",
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:[background:linear-gradient(to_right,transparent,var(--chloe-hairline),transparent)]",
            "animate-widget-panel-enter",
            isMobile
              ? mobilePanelPos
              : "bottom-5 right-5 h-[500px] w-[360px]"
          )}
          onMouseEnter={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          onClick={handleUserInteraction}
        >
          {/* Header */}
          <div
            className="relative flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--chloe-divider)" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--chloe-fg)" }}>Chloe</p>
              <p className="text-xs" style={{ color: "var(--chloe-fg-muted)" }}>Launchhouse AI Assistant</p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close chat"
              style={{
                background: "var(--chloe-surface-strong)",
                color: "var(--chloe-fg)",
                borderColor: "var(--chloe-border)",
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors hover:[background:var(--chloe-surface-strong)] focus:outline-none focus-visible:ring-2 focus-visible:[--tw-ring-color:var(--chloe-ring)] focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex animate-widget-message-slide",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
              >
                <div
                  style={
                    msg.role === "user"
                      ? {
                          background: "var(--chloe-user-bg)",
                          color: "var(--chloe-user-fg)",
                          borderColor: "var(--chloe-border)",
                        }
                      : {
                          background: "var(--chloe-surface-strong)",
                          color: "var(--chloe-fg)",
                          borderColor: "var(--chloe-border)",
                        }
                  }
                  className={cn(
                    "relative max-w-[85%] rounded-2xl px-3 py-2 text-sm border backdrop-blur-md shadow-[0_8px_24px_-14px_rgba(8,47,112,0.35)] transition-[background-color,color,border-color] duration-300",
                    msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&_*]:!text-[color:var(--chloe-fg)] [&_a]:!underline">
                      <div><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {showTypingIndicator && (
              <div className="flex justify-start animate-widget-message-slide">
                <div
                  style={{
                    background: "var(--chloe-surface-strong)",
                    borderColor: "var(--chloe-border)",
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border backdrop-blur-md px-3 py-2"
                  role="status"
                  aria-label="Chloe is typing"
                >
                  <span className="h-2 w-2 rounded-full animate-typing-dot" style={{ background: "var(--chloe-fg-muted)" }} />
                  <span className="h-2 w-2 rounded-full animate-typing-dot [animation-delay:0.2s]" style={{ background: "var(--chloe-fg-muted)" }} />
                  <span className="h-2 w-2 rounded-full animate-typing-dot [animation-delay:0.4s]" style={{ background: "var(--chloe-fg-muted)" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Action buttons */}
          <div
            className="relative border-t px-3 py-2 flex gap-2"
            style={{ borderColor: "var(--chloe-divider)" }}
          >
            <button
              onClick={handleConsultation}
              style={{
                background: "var(--chloe-surface-strong)",
                color: "var(--chloe-fg)",
                borderColor: "var(--chloe-border)",
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border backdrop-blur-md px-3 py-2 text-xs font-medium shadow-[0_8px_24px_-14px_rgba(8,47,112,0.35)] active:scale-[0.98] transition-[background-color,color,border-color] duration-300 min-h-[44px] touch-manipulation"
            >
              <Calendar className="h-3.5 w-3.5" />
              Schedule Consultation
            </button>
            <button
              onClick={handleCalculator}
              style={{
                background: "var(--chloe-surface-strong)",
                color: "var(--chloe-fg)",
                borderColor: "var(--chloe-border)",
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border backdrop-blur-md px-3 py-2 text-xs font-medium shadow-[0_8px_24px_-14px_rgba(8,47,112,0.35)] active:scale-[0.98] transition-[background-color,color,border-color] duration-300 min-h-[44px] touch-manipulation"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Try Calculator
            </button>
          </div>

          {/* Input */}
          <div
            className="relative border-t px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            style={{ borderColor: "var(--chloe-divider)" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleUserInteraction();
                }}
                onKeyDown={handleKeyDown}
                onFocus={handleUserInteraction}
                placeholder="Ask a question..."
                rows={1}
                style={{
                  fontSize: "16px",
                  background: "var(--chloe-surface-strong)",
                  color: "var(--chloe-fg)",
                  borderColor: "var(--chloe-border)",
                }}
                className="flex-1 resize-none rounded-full border backdrop-blur-md px-4 py-2 text-sm placeholder:[color:var(--chloe-fg-muted)] focus:outline-none focus-visible:ring-2 focus-visible:[--tw-ring-color:var(--chloe-ring)] focus-visible:ring-offset-2"
                disabled={loading}
              />
              <Button
                size="icon"
                style={{
                  background: "var(--chloe-surface-strong)",
                  color: "var(--chloe-fg)",
                  borderColor: "var(--chloe-border)",
                }}
                className="h-9 w-9 shrink-0 rounded-full border backdrop-blur-md shadow-[0_8px_24px_-14px_rgba(8,47,112,0.35)] hover:opacity-90"
                onClick={send}
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default ReceptionistWidget;

