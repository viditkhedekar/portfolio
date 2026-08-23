"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/components/TerminalProvider";
import { hasGreeted, markGreeted } from "@/lib/greeting";
import { getBootPending, getBootPendingServer, subscribeBoot } from "@/lib/boot";

/** Beat after the interface settles, so the terminal arrives rather than flashes. */
const DELAY_MS = 520;

/**
 * Opens the terminal once per session, on the desktop, after boot has finished.
 * Renders nothing.
 */
export function TerminalGreeter() {
  const pathname = usePathname();
  const terminal = useTerminal();
  const booting = React.useSyncExternalStore(
    subscribeBoot,
    getBootPending,
    getBootPendingServer,
  );

  const open = terminal.open;
  const ready = pathname === "/" && !booting;

  React.useEffect(() => {
    if (!ready || hasGreeted()) return;
    const timer = window.setTimeout(() => {
      markGreeted();
      open();
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [ready, open]);

  return null;
}
