"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { modules, system } from "@/lib/data/system";
import { StatusDot, cx } from "@/components/ui";
import { useTerminal } from "@/components/TerminalProvider";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function useNow() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function SystemHeader() {
  const pathname = usePathname();
  const now = useNow();
  const [open, setOpen] = React.useState(false);
  const terminal = useTerminal();

  React.useEffect(() => setOpen(false), [pathname]);

  const dateLabel = now
    ? `${String(now.getDate()).padStart(2, "0")} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
    : " ";
  const timeLabel = now
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds(),
      ).padStart(2, "0")}`
    : " ";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--vk-line)] bg-[var(--vk-bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[62px] w-full max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          {/* Identity */}
          <Link
            href="/"
            className="group shrink-0"
            data-cursor="RETURN"
            data-cursor-sub="SYSTEM ROOT"
            aria-label="VKOS/01 home"
          >
            <div className="vk-mono text-[12px] tracking-[0.22em] text-[var(--vk-fg)] transition-colors group-hover:text-[var(--vk-accent)]">
              {system.code}
            </div>
            <div className="vk-mono mt-[3px] text-[9px] tracking-[0.18em] text-[var(--vk-fg-faint)]">
              {system.operator}
            </div>
          </Link>

          {/* Module strip — desktop */}
          <nav aria-label="System modules" className="hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-1">
              {modules.map((m) => {
                const active = pathname === m.href || pathname.startsWith(`${m.href}/`);
                return (
                  <li key={m.id}>
                    <Link
                      href={m.href}
                      data-cursor="ACCESS MODULE"
                      data-cursor-sub={`${m.index} / ${m.name}`}
                      className={cx(
                        "flex items-center gap-1.5 px-2.5 py-1.5 transition-colors",
                        active
                          ? "text-[var(--vk-fg)]"
                          : "text-[var(--vk-fg-faint)] hover:text-[var(--vk-fg-dim)]",
                      )}
                    >
                      <span
                        className={cx(
                          "vk-mono text-[9px] tracking-[0.14em]",
                          active ? "text-[var(--vk-accent)]" : "text-[var(--vk-fg-ghost)]",
                        )}
                      >
                        {m.index}
                      </span>
                      <span className="vk-mono text-[10px] tracking-[0.14em]">{m.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status */}
          <div className="flex shrink-0 items-center gap-5">
            <button
              type="button"
              onClick={terminal.open}
              data-cursor="OPEN"
              data-cursor-sub="TERMINAL"
              className="hidden items-center gap-2 border border-[var(--vk-line)] px-2.5 py-1.5 transition-colors hover:border-[var(--vk-line-strong)] sm:flex"
            >
              <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-dim)]">
                TERMINAL
              </span>
              <kbd className="vk-mono text-[9px] tracking-[0.1em] text-[var(--vk-fg-ghost)]">
                ⌘K
              </kbd>
            </button>

            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-2">
                <StatusDot status="ONLINE" pulse />
                <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-dim)]">
                  SYSTEM ONLINE
                </span>
              </div>
              <div
                className="vk-mono mt-[3px] text-[9px] tracking-[0.16em] text-[var(--vk-fg-faint)]"
                suppressHydrationWarning
              >
                {dateLabel}
                <span className="mx-1.5 text-[var(--vk-fg-ghost)]">/</span>
                {timeLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center border border-[var(--vk-line)] text-[var(--vk-fg-dim)] lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Close module index" : "Open module index"}
            >
              {open ? <X size={14} strokeWidth={1.5} /> : <Menu size={14} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile module index */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--vk-bg)] pt-[62px] lg:hidden"
          >
            <nav aria-label="System modules" className="h-full overflow-y-auto">
              <ul>
                {modules.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-[var(--vk-line)]"
                  >
                    <Link href={m.href} className="flex items-baseline gap-4 px-5 py-5 sm:px-8">
                      <span className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-accent)]">
                        {m.index}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[19px] tracking-tight text-[var(--vk-fg)]">
                          {m.name}
                        </span>
                        <span className="vk-label mt-1 block">{m.description}</span>
                      </span>
                      <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                        {m.status}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="px-5 py-6 sm:px-8">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    terminal.open();
                  }}
                  className="vk-mono w-full border border-[var(--vk-line)] py-3 text-[10px] tracking-[0.18em] text-[var(--vk-fg-dim)]"
                >
                  OPEN TERMINAL
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
