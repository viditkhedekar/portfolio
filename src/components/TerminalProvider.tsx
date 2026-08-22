"use client";

import * as React from "react";
import { Terminal } from "@/components/Terminal";

interface TerminalApi {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const Ctx = React.createContext<TerminalApi | null>(null);

export function useTerminal(): TerminalApi {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useTerminal must be used inside <TerminalProvider>");
  return ctx;
}

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);

  const api = React.useMemo<TerminalApi>(
    () => ({
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((v) => !v),
    }),
    [isOpen],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={api}>
      {children}
      <Terminal open={isOpen} onClose={api.close} />
    </Ctx.Provider>
  );
}
