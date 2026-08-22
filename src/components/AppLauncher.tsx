"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { appForPath } from "@/lib/data/apps";
import { useMediaQuery } from "@/lib/hooks";

const LAUNCH_MS = 620;

/**
 * The "opening an application" splash.
 *
 * Runs on client-side navigation into an app, not on first load — a cold load
 * already has the boot sequence, and stacking the two would mean two splashes
 * before anything is readable.
 */
export function AppLauncher() {
  const pathname = usePathname();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const previous = React.useRef<string | null>(null);
  const [launching, setLaunching] = React.useState<string | null>(null);

  React.useEffect(() => {
    const from = previous.current;
    previous.current = pathname;

    /* First render of the session — nothing was navigated away from. */
    if (from === null || from === pathname) return;
    if (reduced) return;

    const app = appForPath(pathname);
    if (!app) return;

    setLaunching(app.file);
    const timer = window.setTimeout(() => setLaunching(null), LAUNCH_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, reduced]);

  return (
    <AnimatePresence>
      {launching && (
        <motion.div
          key={launching}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--vk-bg)] px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-[300px]">
            <div className="vk-mono text-[9px] tracking-[0.22em] text-[var(--vk-fg-ghost)]">
              LAUNCHING
            </div>
            <div className="vk-mono mt-2.5 text-[15px] tracking-[0.14em] text-[var(--vk-accent)]">
              {launching}
            </div>

            <div className="mt-6 h-px w-full bg-[var(--vk-line-mid)]">
              <motion.div
                className="h-px bg-[var(--vk-accent)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: LAUNCH_MS / 1000, ease: "easeInOut" }}
              />
            </div>

            <div className="vk-mono mt-3 text-[9px] tracking-[0.16em] text-[var(--vk-fg-faint)]">
              ALLOCATING MEMORY
              <span className="vk-caret">_</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
