import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import ContactUsPanel from "./ContactUsPanel";
import RequestDemoPanel from "./RequestDemoPanel";

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
  const openContactPanel = useCallback(() => setContactOpen(true), []);
  const openDemoPanel = useCallback(() => setDemoOpen(true), []);

  return (
    <ContactPanelContext.Provider value={{ openContactPanel, openDemoPanel }}>
      {children}
      <ContactUsPanel open={contactOpen} onOpenChange={setContactOpen} />
      <RequestDemoPanel open={demoOpen} onOpenChange={setDemoOpen} />
    </ContactPanelContext.Provider>
  );
};

export default ContactPanelProvider;
