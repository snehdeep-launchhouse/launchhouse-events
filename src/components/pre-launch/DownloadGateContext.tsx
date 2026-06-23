import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type DownloadGateContextValue = {
  open: boolean;
  openDownloadGate: (trigger?: HTMLElement | null) => void;
  closeDownloadGate: () => void;
  /** Returns focus to the originating trigger after the dialog closes. */
  restoreFocus: () => void;
};

const DownloadGateContext = createContext<DownloadGateContextValue | null>(null);

export function DownloadGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Stored in a ref — never persisted, never logged.
  const triggerRef = useRef<HTMLElement | null>(null);

  const openDownloadGate = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setOpen(true);
  }, []);

  const closeDownloadGate = useCallback(() => {
    setOpen(false);
  }, []);

  const restoreFocus = useCallback(() => {
    const el = triggerRef.current;
    if (el && typeof el.focus === "function") {
      // Defer so dialog unmount completes before focusing.
      requestAnimationFrame(() => el.focus());
    }
  }, []);

  const value = useMemo<DownloadGateContextValue>(
    () => ({ open, openDownloadGate, closeDownloadGate, restoreFocus }),
    [open, openDownloadGate, closeDownloadGate, restoreFocus],
  );

  return (
    <DownloadGateContext.Provider value={value}>
      {children}
    </DownloadGateContext.Provider>
  );
}

export function useDownloadGate(): DownloadGateContextValue {
  const ctx = useContext(DownloadGateContext);
  if (!ctx) {
    throw new Error("useDownloadGate must be used inside <DownloadGateProvider>");
  }
  return ctx;
}
