"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appForPath, apps } from "@/lib/data/apps";
import {
  getWindows,
  getWindowsServer,
  openApp,
  subscribeWindows,
} from "@/lib/apps-session";
import { useTerminal } from "@/components/TerminalProvider";
import { StatusDot, cx } from "@/components/ui";

/** Rotating status line. Deliberately dull — it should never pull the eye. */
const STATUS = [
  "INDEX SYNCED",
  "MEMORY NOMINAL",
  "NO PENDING JOBS",
  "CACHE WARM",
  "IDLE",
  "DISK QUIET",
];

const STATUS_MS = 45_000;

function StatusLine() {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setI((n) => (n + 1) % STATUS.length),
      STATUS_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="vk-mono hidden text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)] lg:inline">
      {STATUS[i]}
    </span>
  );
}

/**
 * The application dock.
 *
 * Tracks which apps are open this session so the site behaves like a desktop
 * where programs stay running. Minimised apps stay listed and dimmed, and
 * clicking one restores it. Desktop only — on a phone the viewport is too short
 * to give up a fixed strip.
 */
export function Taskbar() {
  const pathname = usePathname();
  const terminal = useTerminal();
  const current = appForPath(pathname);
  const currentId = current?.id;
  const windows = React.useSyncExternalStore(
    subscribeWindows,
    getWindows,
    getWindowsServer,
  );

  /* Unresolved paths are not real applications, so they never join the dock. */
  React.useEffect(() => {
    if (!currentId || currentId === "system") return;
    openApp(currentId);
  }, [currentId]);

  /* The dock reserves space via a body attribute rather than page padding, so
     no page has to know it exists. */
  const running = windows.open.length;
  React.useEffect(() => {
    if (running > 0) document.body.setAttribute("data-dock", "on");
    else document.body.removeAttribute("data-dock");
    return () => document.body.removeAttribute("data-dock");
  }, [running]);

  if (running === 0) return null;

  const chips = windows.open
    .map((id) => apps.find((a) => a.id === id))
    .filter((a): a is (typeof apps)[number] => Boolean(a));

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 hidden h-[var(--vk-dock-h)] border-t border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)]/95 backdrop-blur-md md:block"
      aria-label="Running applications"
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-4 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          data-cursor="RETURN"
          data-cursor-sub="DESKTOP"
          className="vk-mono shrink-0 border border-[var(--vk-line)] px-2.5 py-1 text-[9px] tracking-[0.16em] text-[var(--vk-fg-faint)] transition-colors hover:border-[var(--vk-accent)] hover:text-[var(--vk-accent)]"
        >
          DESKTOP
        </Link>

        <span aria-hidden className="h-4 w-px shrink-0 bg-[var(--vk-line-mid)]" />

        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {chips.map((a) => {
            const minimised = windows.minimised.includes(a.id);
            const active = currentId === a.id && !minimised;
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  data-cursor={minimised ? "RESTORE" : "FOCUS"}
                  data-cursor-sub={a.file}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-2 border px-3 py-1.5 transition-colors",
                    active
                      ? "border-[var(--vk-line-mid)] bg-[var(--vk-bg-raised)]"
                      : "border-transparent hover:border-[var(--vk-line)] hover:bg-[var(--vk-bg-raised)]",
                    minimised && "opacity-55",
                  )}
                >
                  <StatusDot
                    status={active ? "ACTIVE" : "ARCHIVED"}
                    pulse={active}
                    size={4}
                  />
                  <span
                    className={cx(
                      "vk-mono whitespace-nowrap text-[9px] tracking-[0.14em]",
                      active ? "text-[var(--vk-fg)]" : "text-[var(--vk-fg-faint)]",
                    )}
                  >
                    {a.file}
                  </span>
                  {minimised && (
                    <span className="vk-mono whitespace-nowrap text-[8px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                      MIN
                    </span>
                  )}
                </Link>
              </li>
            );
          })}

          {/* The terminal is a program too, so it sits in the dock. */}
          <li>
            <button
              type="button"
              onClick={terminal.toggle}
              data-cursor="OPEN"
              data-cursor-sub="TERMINAL"
              className={cx(
                "flex items-center gap-2 border px-3 py-1.5 transition-colors",
                terminal.isOpen
                  ? "border-[var(--vk-line-mid)] bg-[var(--vk-bg-raised)]"
                  : "border-transparent hover:border-[var(--vk-line)] hover:bg-[var(--vk-bg-raised)]",
              )}
            >
              <StatusDot
                status={terminal.isOpen ? "ACTIVE" : "ARCHIVED"}
                pulse={terminal.isOpen}
                size={4}
              />
              <span
                className={cx(
                  "vk-mono whitespace-nowrap text-[9px] tracking-[0.14em]",
                  terminal.isOpen ? "text-[var(--vk-fg)]" : "text-[var(--vk-fg-faint)]",
                )}
              >
                TERMINAL
              </span>
            </button>
          </li>
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <StatusLine />
          <span aria-hidden className="hidden h-4 w-px bg-[var(--vk-line-mid)] lg:block" />
          <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
            {String(running).padStart(2, "0")} RUNNING
          </span>
        </div>
      </div>
    </div>
  );
}
