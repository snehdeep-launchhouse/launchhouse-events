import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi! I'm the Launchhouse assistant. I can help answer questions about Cvent event builds, pricing, timelines, and how our services work.";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Session storage keys
const SESSION_KEYS = {
  hasInteracted: 'widget_has_interacted',
  hasDismissed: 'widget_has_dismissed', 
  hasAutoOpened: 'widget_has_auto_opened'
} as const;

// Helper functions for session storage
const getSessionFlag = (key: string): boolean => {
  return sessionStorage.getItem(key) === 'true';
};

const setSessionFlag = (key: string, value: boolean): void => {
  if (value) {
    sessionStorage.setItem(key, 'true');
  } else {
    sessionStorage.removeItem(key);
  }
};

export function ReceptionistWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasAutoOpenedRef = useRef(false);
  
  const isMobile = useIsMobile();

  // Helper function to clear all timers
  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (pulseTimerRef.current) {
      clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const scroll = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Mark as mounted after 1s to show entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-open logic: trigger after 30s idle (not on mobile, not if dismissed/interacted)
  useEffect(() => {
    if (isMobile || getSessionFlag(SESSION_KEYS.hasInteracted) || getSessionFlag(SESSION_KEYS.hasDismissed)) {
      return;
    }

    // Start pulse animation after 10s
    pulseTimerRef.current = setTimeout(() => {
      setShowPulse(true);
    }, 10000);

    // Auto-open after 30s
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

  // Auto-close if no interaction (only for auto-opened widgets)
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

  // Reset auto-close timer on user interaction
  const handleUserInteraction = useCallback(() => {
    setSessionFlag(SESSION_KEYS.hasInteracted, true);
    setShowPulse(false);
    
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  useEffect(scroll, [messages, scroll]);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      handleUserInteraction();
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

  return (
    <>
      {/* Floating button */}
      {!open && mounted && (
        <button
          onClick={() => {
            setOpen(true);
            handleUserInteraction();
          }}
          className={cn(
            "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
            "animate-widget-pill-entrance",
            showPulse && "animate-widget-pill-pulse"
          )}
          title="Chat with Launchhouse"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div 
          className="fixed bottom-5 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-widget-panel-enter"
          onMouseEnter={handleUserInteraction}
          onClick={handleUserInteraction}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-primary-foreground">
                Launchhouse Assistant
              </p>
              <p className="text-xs text-primary-foreground/70">
                Ask me anything
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex animate-widget-message-slide",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ 
                  animationDelay: `${i * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && !messages[messages.length - 1]?.content && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-secondary px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Schedule button */}
          <div className="px-4 pb-2">
            <button
              onClick={() => {
                handleUserInteraction();
                setOpen(false);
                document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/80 transition-colors"
            >
              <Calendar className="h-3 w-3" />
              Schedule a Consultation
            </button>
          </div>

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
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
