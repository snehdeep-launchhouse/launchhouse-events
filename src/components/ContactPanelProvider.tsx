import { createContext, useContext, useState, useCallback, lazy, Suspense, type ReactNode } from "react";

const ContactUsPanel = lazy(() => import("./ContactUsPanel"));
const RequestDemoPanel = lazy(() => import("./RequestDemoPanel"));

interface ContactPanelContextValue {
  openContactPanel: () => void;
  openDemoPanel: () => void;
}

const ContactPanelContext = createContext<ContactPanelContextValue | null>(null);

export const useContactPanel = () => {
  const ctx = useContext(ContactPanelContext);
  if (!ctx) throw new Error("useContactPanel must be used within ContactPanelProvider");
  return ctx;
};

const ContactPanelProvider = ({ children }: { children: ReactNode }) => {
  const [contactOpen, setContactOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  // Track if panels have ever been opened to avoid loading until needed
  const [contactMounted, setContactMounted] = useState(false);
  const [demoMounted, setDemoMounted] = useState(false);

  const openContactPanel = useCallback(() => {
    setContactMounted(true);
    setContactOpen(true);
  }, []);

  const openDemoPanel = useCallback(() => {
    setDemoMounted(true);
    setDemoOpen(true);
  }, []);

  return (
    <ContactPanelContext.Provider value={{ openContactPanel, openDemoPanel }}>
      {children}
      {contactMounted && (
        <Suspense fallback={null}>
          <ContactUsPanel open={contactOpen} onOpenChange={setContactOpen} />
        </Suspense>
      )}
      {demoMounted && (
        <Suspense fallback={null}>
          <RequestDemoPanel open={demoOpen} onOpenChange={setDemoOpen} />
        </Suspense>
      )}
    </ContactPanelContext.Provider>
  );
};

export default ContactPanelProvider;
