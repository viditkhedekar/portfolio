"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AppLauncher } from "@/components/AppLauncher";
import { AppWindow } from "@/components/AppWindow";
import { BootSequence } from "@/components/BootSequence";
import { Cursor } from "@/components/Cursor";
import { OperatorHead } from "@/components/OperatorHead";
import { SystemFooter } from "@/components/SystemFooter";
import { SystemHeader } from "@/components/SystemHeader";
import { Taskbar } from "@/components/Taskbar";
import { TerminalProvider } from "@/components/TerminalProvider";
import { WorldHUD } from "@/components/world/WorldHUD";
import { WorldOverlay as WorldPanelLayer } from "@/components/world/WorldOverlay";
import { FilmWorld } from "@/components/world/FilmWorld";
import { appForPath } from "@/lib/data/apps";
import { useMode } from "@/lib/mode";
import { getBootPending, getBootPendingServer, subscribeBoot } from "@/lib/boot";

/**
 * The persistent operating-system chrome: boot gate, header, cursor, terminal,
 * launch transition and dock.
 *
 * `/` is the world. It runs without the header, the dock or the footer,
 * because the HUD is its interface and a second set of navigation over the
 * top of it would be two operating systems arguing. In low-RAM mode the same
 * route is an ordinary page and gets all of that chrome back. Every other
 * route is an application and renders inside window chrome as before.
 *
 * The terminal no longer greets anyone on arrival. It used to open itself
 * once per session on the desktop, which worked when the desktop was a page;
 * over a camera arriving out of the dark it is a window unfolding across the
 * one shot the site gets. It is still a keystroke away on every route.
 *
 * The head is mounted here rather than on any page. It is the one element
 * that survives navigation, and it has to: it opens centred on the landing
 * page and walks into the top-left corner, where it stays for the rest of the
 * site. Remounting it per route would restart the scan every time. In low-RAM
 * mode it is not mounted at all, and the header keeps the photograph it had
 * before the world existed.
 */
export function VKOSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const app = appForPath(pathname);
  const mode = useMode();
  /* The desktop is `/`. It renders as the world, or as the low-RAM page that
     stands in for it, and only the first of those replaces the chrome. */
  const world = app === null && mode === "world";
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

      {/* The world and the head sit outside `.vk-app` deliberately. That
          element fades on boot, and an element with a fractional opacity
          becomes the containing block for the fixed layers inside it, which
          would stretch the canvas to the height of the whole document. Both
          carry their own boot fade instead. */}
      {world && <FilmWorld />}
      {world && <WorldPanelLayer />}
      {world && <WorldHUD />}
      {/* Low-RAM mode has its own head, in the middle of the desktop, and two
          point clouds on one page is exactly the cost that mode exists to
          avoid. */}
      {mode === "world" && <OperatorHead />}

      <div className="vk-app" data-ready={booting ? undefined : "1"}>
        {!world && <SystemHeader />}

        {world ? (
          /* No entrance transform here: a transformed ancestor would capture
             the fixed world and HUD the same way an opacity would. */
          <main id="main">{children}</main>
        ) : (
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
        )}

        {!world && <Taskbar />}
      </div>
    </TerminalProvider>
  );
}
