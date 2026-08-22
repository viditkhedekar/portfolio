"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { boot, system } from "@/lib/data/system";
import { markBooted } from "@/lib/boot";

type Phase = "init" | "checks" | "operational" | "welcome" | "done";

export function BootSequence() {
  const [phase, setPhase] = React.useState<Phase>("init");
  const [checked, setChecked] = React.useState(0);
  const finished = React.useRef(false);

  const finish = React.useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    /* Play the exit, then release the interface. */
    setPhase("done");
    window.setTimeout(markBooted, 420);
  }, []);

  /* Skip on any interaction. */
  React.useEffect(() => {
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [finish]);

  /* Timeline. */
  React.useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    let t = 620;
    at(t, () => setPhase("checks"));

    for (let i = 0; i < boot.checks.length; i += 1) {
      t += boot.checks[i].ms;
      at(t, () => setChecked(i + 1));
    }

    t += 320;
    at(t, () => setPhase("operational"));
    t += 620;
    at(t, () => setPhase("welcome"));
    t += 760;
    at(t, finish);

    return () => timers.forEach(window.clearTimeout);
  }, [finish]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--vk-bg)] px-6"
          exit={{ opacity: 0, filter: "blur(2px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="vk-mono text-[13px] tracking-[0.24em] text-[var(--vk-fg)]">
                {system.code}
              </div>
              <div className="vk-mono mt-1.5 text-[10px] tracking-[0.18em] text-[var(--vk-fg-faint)]">
                PERSONAL OPERATING SYSTEM
              </div>
            </motion.div>

            <div className="mt-8 min-h-[188px]">
              {phase === "init" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="vk-mono text-[11px] tracking-[0.16em] text-[var(--vk-fg-dim)]"
                >
                  INITIALISING
                  <span className="vk-caret">_</span>
                </motion.div>
              )}

              {phase !== "init" && (
                <ul className="space-y-[7px]">
                  {boot.checks.slice(0, phase === "checks" ? checked : boot.checks.length).map(
                    (c) => (
                      <motion.li
                        key={c.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2"
                      >
                        <span className="vk-mono shrink-0 text-[11px] tracking-[0.14em] text-[var(--vk-fg-dim)]">
                          {c.label}
                        </span>
                        <span
                          aria-hidden
                          className="mb-[3px] h-px flex-1"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle, var(--vk-fg-ghost) 0.5px, transparent 0.5px)",
                            backgroundSize: "4px 1px",
                          }}
                        />
                        <span className="vk-mono shrink-0 text-[11px] tracking-[0.14em] text-[var(--vk-accent)]">
                          ONLINE
                        </span>
                      </motion.li>
                    ),
                  )}
                </ul>
              )}

              {(phase === "operational" || phase === "welcome") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6 border-t border-[var(--vk-line)] pt-4"
                >
                  <div className="vk-mono text-[11px] tracking-[0.16em] text-[var(--vk-fg)]">
                    ALL SYSTEMS OPERATIONAL
                  </div>
                  {phase === "welcome" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="vk-mono mt-2 text-[11px] tracking-[0.16em] text-[var(--vk-accent)]"
                    >
                      WELCOME, VISITOR.
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            <button
              type="button"
              onClick={finish}
              className="vk-label mt-8 transition-colors hover:text-[var(--vk-fg-dim)]"
            >
              PRESS ANY KEY TO SKIP
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
