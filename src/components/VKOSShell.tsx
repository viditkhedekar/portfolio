"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BootSequence, hasBooted } from "@/components/BootSequence";
import { Cursor } from "@/components/Cursor";
import { SystemHeader } from "@/components/SystemHeader";
import { TerminalProvider } from "@/components/TerminalProvider";

/**
 * The persistent operating-system chrome: boot gate, header, cursor, terminal,
 * and the page transition. Everything below the header is `children`.
 */
export function VKOSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [booting, setBooting] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (hasBooted()) {
      document.documentElement.removeAttribute("data-boot");
      setReady(true);
    } else {
      setBooting(true);
    }
  }, []);

  const finish = React.useCallback(() => {
    document.documentElement.removeAttribute("data-boot");
    setBooting(false);
    setReady(true);
  }, []);

  return (
    <TerminalProvider>
      {booting && <BootSequence onFinish={finish} />}
      <Cursor />

      <div className="vk-app" data-ready={ready ? "1" : undefined}>
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
