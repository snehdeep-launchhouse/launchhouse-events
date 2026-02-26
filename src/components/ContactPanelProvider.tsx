import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import ContactUsPanel from "./ContactUsPanel";

interface ContactPanelContextValue {
  openContactPanel: () => void;
}

const ContactPanelContext = createContext<ContactPanelContextValue | null>(null);

export const useContactPanel = () => {
  const ctx = useContext(ContactPanelContext);
  if (!ctx) throw new Error("useContactPanel must be used within ContactPanelProvider");
  return ctx;
};

const ContactPanelProvider = ({ children }: { children: ReactNode }) => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContactPanel = useCallback(() => setContactOpen(true), []);

  return (
    <ContactPanelContext.Provider value={{ openContactPanel }}>
      {children}
      <ContactUsPanel open={contactOpen} onOpenChange={setContactOpen} />
    </ContactPanelContext.Provider>
  );
};

export default ContactPanelProvider;
