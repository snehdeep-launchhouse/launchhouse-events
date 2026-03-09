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
  "Hi! I'm Chloe, your Launchhouse assistant. I can help answer questions about Cvent event builds, pricing, timelines, and how our services work.";

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

  // Auto-open after 30s idle — desktop only, once per session
  useEffect(() => {
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
  }, [isMobile, clearAllTimers]);

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

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/receptionist-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
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

  // Mobile: bottom-20 to clear sticky CTA bar; Desktop: bottom-5
  const positionClass = isMobile ? "bottom-20 right-3" : "bottom-5 right-5";

  return (
    <>
      {/* Floating pill — entrance after 1s delay */}
      {!open && mounted && (
        <button
          onClick={() => {
            setOpen(true);
            handleUserInteraction();
          }}
          className={cn(
            "fixed z-50 flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 pl-4 pr-2 py-2",
            "animate-widget-pill-entrance",
            showPulse && "animate-widget-pill-pulse",
            positionClass
          )}
          title="Chat with Chloe"
        >
          <span className="text-sm font-medium whitespace-nowrap">Ask me anything</span>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/15">
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-md animate-widget-pill-entrance">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-widget-panel-enter",
            isMobile
              ? "bottom-20 right-3 left-3 h-[28rem]"
              : "bottom-5 right-5 h-[500px] w-[360px]"
          )}
          onMouseEnter={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          onClick={handleUserInteraction}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-primary-foreground">Chloe</p>
              <p className="text-xs text-primary-foreground/70">Launchhouse AI Assistant</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground touch-manipulation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
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
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {showTypingIndicator && (
              <div className="flex justify-start animate-widget-message-slide">
                <div className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2" role="status" aria-label="Chloe is typing">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-typing-dot" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-typing-dot [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-typing-dot [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Action buttons */}
          <div className="border-t border-border px-3 py-2 flex gap-2">
            <button
              onClick={handleConsultation}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:bg-accent/80 transition-colors min-h-[44px] touch-manipulation"
            >
              <Calendar className="h-3.5 w-3.5" />
              Schedule Consultation
            </button>
            <button
              onClick={handleCalculator}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors min-h-[44px] touch-manipulation"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Try Calculator
            </button>
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
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
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ fontSize: "16px" }}
                disabled={loading}
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
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

