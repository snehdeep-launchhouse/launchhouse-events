import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GA_MEASUREMENT_ID, isProductionHost, ANALYTICS_READY_EVENT } from "@/lib/analytics";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  marketing: boolean;
  performance: boolean;
}

const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  functional: true,
  marketing: true,
  performance: true,
};

function enableGA() {
  // Hard gate: GA4 must never load on preview, lovable.app, localhost, or unknown hosts.
  if (!isProductionHost()) return;
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { window.dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  // send_page_view disabled here; SPA page_view tracking is handled by RouteChangeTracker.
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  // Readiness signal so RouteChangeTracker can send the first page_view for the current route.
  window.dispatchEvent(new Event(ANALYTICS_READY_EVENT));
}

function disableGA() {
  if (typeof window === "undefined") return;
  (window as any)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

declare global {
  interface Window { dataLayer: any[]; }
}

const CATEGORIES = [
  {
    key: "necessary" as const,
    label: "Necessary Cookies",
    description: "These cookies are essential for the website to function and cannot be switched off. They are usually set in response to actions you take such as setting your privacy preferences, logging in, or filling in forms.",
    alwaysActive: true,
  },
  {
    key: "functional" as const,
    label: "Functional Cookies",
    description: "These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have added to our pages.",
    alwaysActive: false,
  },
  {
    key: "marketing" as const,
    label: "Marketing Cookies",
    description: "These cookies may be set through our site by our analytics partners. They may be used to build a profile of your interests and show you relevant content on other sites. They are based on uniquely identifying your browser and internet device.",
    alwaysActive: false,
  },
  {
    key: "performance" as const,
    label: "Performance Cookies",
    description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.",
    alwaysActive: false,
  },
];

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPrefs(parsed);
        if (parsed.marketing) enableGA(); else disableGA();
      } catch {
        if (stored === "accepted") enableGA();
        else disableGA();
      }
    } else {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const handleReopen = () => {
      const stored = localStorage.getItem("cookie-consent");
      if (stored) {
        try { setPrefs(JSON.parse(stored)); } catch {}
      }
      setVisible(true);
      setSettingsOpen(true);
    };
    window.addEventListener("open-cookie-settings", handleReopen);
    return () => window.removeEventListener("open-cookie-settings", handleReopen);
  }, []);

  const saveAndClose = (preferences: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    if (preferences.marketing) enableGA(); else disableGA();
    setVisible(false);
    setSettingsOpen(false);
  };

  const acceptAll = () => saveAndClose(DEFAULT_PREFS);

  const rejectAll = () =>
    saveAndClose({ necessary: true, functional: false, marketing: false, performance: false });

  const confirmChoices = () => saveAndClose(prefs);

  const dismiss = () => {
    // Dismissing without choosing = reject non-essential
    rejectAll();
  };

  if (!visible) return null;

  return (
    <>
      {/* Bottom Banner */}
      {!settingsOpen && (
        <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-border bg-background shadow-lg">
          <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 sm:py-5">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              We use cookies to improve your experience on our site, analyse traffic, and for marketing purposes. For more details, see our{" "}
              <a href="/privacy-policy" className="text-primary underline hover:text-primary/80">
                Privacy Policy
              </a>.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                Cookie Settings
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Accept All
              </Button>
              <button
                onClick={dismiss}
                className="ml-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <svg width={32} height={32} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="10" className="fill-primary" />
                  <path d="M14 34V14h4v16h10v4H14z" fill="white" />
                  <path d="M26 14h4l4 10 4-10h4L36 28l-2 6h-4l-2-6L26 14z" fill="white" opacity="0.85" />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold font-display tracking-tight text-foreground">Launch House</span>
                  <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">Events</span>
                </div>
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Privacy Preference Center
            </DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences, or your device and is mostly used to make the site work as you expect it to. The information does not usually directly identify you, but it can give you a more personalised web experience.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <a
                href="/privacy-policy"
                className="text-primary underline hover:text-primary/80"
                onClick={() => setSettingsOpen(false)}
              >
                More Information
              </a>
            </p>
          </DialogHeader>

          <Separator />

          <div className="p-6 pt-4">
            <h3 className="text-base font-semibold text-foreground mb-3">
              Manage Consent Preferences
            </h3>

            <div className="space-y-0 border border-border rounded-lg overflow-hidden">
              {CATEGORIES.map((cat, i) => {
                const isExpanded = expanded === cat.key;
                return (
                  <div key={cat.key}>
                    {i > 0 && <Separator />}
                    <div className="px-4">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : cat.key)}
                        className="w-full flex items-center justify-between py-3.5 text-left"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          }
                          <span className="text-sm font-medium text-foreground">{cat.label}</span>
                        </div>
                        {cat.alwaysActive ? (
                          <span className="text-xs font-semibold text-primary">Always Active</span>
                        ) : (
                          <Switch
                            checked={prefs[cat.key]}
                            onCheckedChange={(checked) =>
                              setPrefs((p) => ({ ...p, [cat.key]: checked }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </button>
                      {isExpanded && (
                        <p className="text-xs text-muted-foreground pb-3.5 pl-6 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-end gap-2 p-4">
            <Button variant="outline" size="sm" onClick={rejectAll}>
              Reject All
            </Button>
            <Button size="sm" onClick={confirmChoices}>
              Confirm My Choices
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
