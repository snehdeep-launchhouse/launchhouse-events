import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const GA_ID = "G-JDM9N7HJD3";

function enableGA() {
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { window.dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}

function disableGA() {
  (window as any)[`ga-disable-${GA_ID}`] = true;
}

declare global {
  interface Window { dataLayer: any[]; }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent === "accepted") {
      enableGA();
    } else if (consent === "rejected") {
      disableGA();
    } else {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    enableGA();
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    disableGA();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-foreground/90 backdrop-blur-sm text-background p-4 sm:p-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left">
          We use cookies to analyze site traffic and improve your experience. By clicking "Accept All", you consent to our use of cookies.
        </p>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={reject} className="border-background/30 text-background hover:bg-background/10 hover:text-background">
            Reject All
          </Button>
          <Button size="sm" onClick={accept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
