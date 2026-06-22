import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import ContactPanelProvider, { useContactPanel } from "./components/ContactPanelProvider";
import RouteChangeTracker from "./components/RouteChangeTracker";

const CookieBanner = lazy(() => import("./components/CookieBanner"));

// Lazy-loaded routes
const Services = lazy(() => import("./pages/Services"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const BuildRequest = lazy(() => import("./pages/BuildRequest"));
const GetAQuote = lazy(() => import("./pages/GetAQuote"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AdminReport = lazy(() => import("./pages/AdminReport"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const CalculatorV2 = lazy(() => import("./pages/CalculatorV2"));
const ReceptionistWidget = lazy(() => import("./components/ReceptionistWidget").then(m => ({ default: m.ReceptionistWidget })));

const queryClient = new QueryClient();

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

/** Listens for ?book-demo=true and auto-opens the demo panel */
const BookDemoListener = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openDemoPanel } = useContactPanel();

  useEffect(() => {
    if (searchParams.get("book-demo") === "true") {
      openDemoPanel();
      searchParams.delete("book-demo");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, openDemoPanel]);

  return null;
};

/** Defers CookieBanner until after initial paint */
const DeferredCookieBanner = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => setShow(true));
    } else {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);
  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <CookieBanner />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DeferredCookieBanner />
      <BrowserRouter>
        <ErrorBoundary>
          <ContactPanelProvider>
            <RouteChangeTracker />
            <BookDemoListener />
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/build-request" element={<BuildRequest />} />
                <Route path="/get-a-quote" element={<GetAQuote />} />
                <Route path="/contact-us" element={<GetAQuote />} />
                <Route path="/contact" element={<GetAQuote />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/admin-report" element={<AdminReport />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/calculator" element={<CalculatorV2 />} />
                <Route path="/calculator-v2" element={<CalculatorV2 />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Suspense fallback={null}>
              <ReceptionistWidget />
            </Suspense>
          </ContactPanelProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
