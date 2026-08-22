"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AppLauncher } from "@/components/AppLauncher";
import { AppWindow } from "@/components/AppWindow";
import { BootSequence } from "@/components/BootSequence";
import { Cursor } from "@/components/Cursor";
import { SystemFooter } from "@/components/SystemFooter";
import { SystemHeader } from "@/components/SystemHeader";
import { Taskbar } from "@/components/Taskbar";
import { TerminalGreeter } from "@/components/TerminalGreeter";
import { TerminalProvider } from "@/components/TerminalProvider";
import { appForPath } from "@/lib/data/apps";
import { getBootPending, getBootPendingServer, subscribeBoot } from "@/lib/boot";

/**
 * The persistent operating-system chrome: boot gate, header, cursor, terminal,
 * launch transition and dock.
 *
 * `/` is the desktop and renders bare. Every other route is an application and
 * renders inside window chrome.
 */
export function VKOSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const app = appForPath(pathname);
  const booting = React.useSyncExternalStore(
    subscribeBoot,
    getBootPending,
    getBootPendingServer,
  );

  /* Safety net: if the sequence is not going to run, release the boot gate the
     inline script may have set. */
  React.useEffect(() => {
    if (!booting) document.documentElement.removeAttribute("data-boot");
  }, [booting]);

  return (
    <TerminalProvider>
      {booting && <BootSequence />}
      <Cursor />
      <AppLauncher />
      <TerminalGreeter />

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
          {app ? <AppWindow app={app}>{children}</AppWindow> : children}
          {/* System chrome, so it sits outside the application window. */}
          <SystemFooter />
        </motion.main>
        <Taskbar />
      </div>
    </TerminalProvider>
  );
}
