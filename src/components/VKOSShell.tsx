"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BootSequence } from "@/components/BootSequence";
import { Cursor } from "@/components/Cursor";
import { SystemHeader } from "@/components/SystemHeader";
import { TerminalProvider } from "@/components/TerminalProvider";
import { getBootPending, getBootPendingServer, subscribeBoot } from "@/lib/boot";

/**
 * The persistent operating-system chrome: boot gate, header, cursor, terminal,
 * and the page transition. Everything below the header is `children`.
 */
export function VKOSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const booting = React.useSyncExternalStore(
    subscribeBoot,
    getBootPending,
    getBootPendingServer,
  );

  return (
    <TerminalProvider>
      {booting && <BootSequence />}
      <Cursor />

      <div className="vk-app" data-ready={booting ? undefined : "1"}>
        <SystemHeader />
        <motion.main
          key={pathname}
          id="main"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[calc(100vh-62px)] pt-[62px]"
        >
          {children}
        </motion.main>
      </div>
    </TerminalProvider>
  );
}
