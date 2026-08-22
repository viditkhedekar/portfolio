"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appForPath, apps } from "@/lib/data/apps";
import { StatusDot, cx } from "@/components/ui";

const STORAGE_KEY = "vkos.open-apps";

function readOpen(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    /* Ignore ids that no longer exist in the registry. */
    return parsed.filter(
      (id): id is string => typeof id === "string" && apps.some((a) => a.id === id),
    );
  } catch {
    return [];
  }
}

/**
 * The application dock.
 *
 * Tracks which apps have been opened this session so the site behaves like a
 * desktop where programs stay running. Desktop only — on a phone the viewport
 * is too short to give up a fixed strip.
 */
export function Taskbar() {
  const pathname = usePathname();
  const current = appForPath(pathname);
  const [open, setOpen] = React.useState<string[]>([]);

  /* Session storage is read after mount so SSR and hydration agree. */
  React.useEffect(() => {
    setOpen(readOpen());
  }, []);

  React.useEffect(() => {
    if (!current || current.id === "system") return;
    setOpen((prev) => {
      if (prev.includes(current.id)) return prev;
      const next = [...prev, current.id];
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* private mode — the dock simply resets on the next load */
      }
      return next;
    });
  }, [current]);

  /* The dock reserves space via a body attribute rather than page padding, so
     no page has to know it exists. */
  React.useEffect(() => {
    const on = open.length > 0;
    if (on) document.body.setAttribute("data-dock", "on");
    else document.body.removeAttribute("data-dock");
    return () => document.body.removeAttribute("data-dock");
  }, [open.length]);

  if (open.length === 0) return null;

  const running = open
    .map((id) => apps.find((a) => a.id === id))
    .filter((a): a is (typeof apps)[number] => Boolean(a));

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 hidden h-[var(--vk-dock-h)] border-t border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)]/95 backdrop-blur-md md:block"
      aria-label="Running applications"
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-5 px-5 sm:px-8 lg:px-12">
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
          {running.map((a) => {
            const active = current?.id === a.id;
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  data-cursor="FOCUS"
                  data-cursor-sub={a.file}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-2 border px-3 py-1.5 transition-colors",
                    active
                      ? "border-[var(--vk-line-mid)] bg-[var(--vk-bg-raised)]"
                      : "border-transparent hover:border-[var(--vk-line)] hover:bg-[var(--vk-bg-raised)]",
                  )}
                >
                  <StatusDot status={active ? "ACTIVE" : "ARCHIVED"} pulse={active} size={4} />
                  <span
                    className={cx(
                      "vk-mono whitespace-nowrap text-[9px] tracking-[0.14em]",
                      active ? "text-[var(--vk-fg)]" : "text-[var(--vk-fg-faint)]",
                    )}
                  >
                    {a.file}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <span className="vk-mono shrink-0 text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
          {String(running.length).padStart(2, "0")} RUNNING
        </span>
      </div>
    </div>
  );
}
