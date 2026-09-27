"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AppDescriptor } from "@/lib/data/apps";
import {
  closeApp,
  getWindows,
  getWindowsServer,
  minimiseApp,
  subscribeWindows,
  toggleMaximised,
} from "@/lib/apps-session";
import { cx } from "@/components/ui";
import { ItemMark } from "@/components/ItemMark";

const CONTROLS = [
  { id: "close", colour: "#ff5f57", label: "Close" },
  { id: "minimise", colour: "#febc2e", label: "Minimise" },
  { id: "maximise", colour: "#28c840", label: "Maximise" },
] as const;

/** Tiny L-brackets at the window's corners. Instrument dressing, not structure. */
function CornerMarks() {
  const corners = [
    "left-0 top-0 border-l border-t",
    "right-0 top-0 border-r border-t",
    "left-0 bottom-0 border-l border-b",
    "right-0 bottom-0 border-r border-b",
  ];
  return (
    <>
      {corners.map((c) => (
        <span
          key={c}
          aria-hidden
          className={cx("pointer-events-none absolute h-2 w-2 border-[var(--vk-line-mid)]", c)}
        />
      ))}
    </>
  );
}

/** Live viewport size. Rendered only after mount so nothing hydrates mismatched. */
function ScreenCoords() {
  const [size, setSize] = React.useState<string | null>(null);

  React.useEffect(() => {
    const read = () => setSize(`${window.innerWidth}×${window.innerHeight}`);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  if (!size) return null;
  return (
    <span
      aria-hidden
      className="vk-mono pointer-events-none absolute bottom-2 right-3 text-[8px] tracking-[0.14em] text-[var(--vk-fg-ghost)]/60"
    >
      {size}
    </span>
  );
}

/**
 * Window chrome around a running application.
 *
 * Every route except the desktop renders inside one of these. The three
 * controls are real: close drops the app from the dock, minimise leaves it
 * there to be restored, and maximise widens the window. All three return to the
 * desktop except maximise, which only changes the frame.
 */
export function AppWindow({
  app,
  children,
}: {
  app: AppDescriptor;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const windows = React.useSyncExternalStore(
    subscribeWindows,
    getWindows,
    getWindowsServer,
  );

  const onControl = (id: (typeof CONTROLS)[number]["id"]) => {
    if (id === "maximise") {
      toggleMaximised();
      return;
    }
    if (id === "close") closeApp(app.id);
    else minimiseApp(app.id);
    router.push("/");
  };

  return (
    <div
      className={cx(
        "mx-auto w-full px-3 pb-10 pt-4 sm:px-5 lg:px-8",
        windows.maximised ? "max-w-none" : "max-w-[1440px]",
      )}
    >
      <div className="relative border border-[var(--vk-line-mid)] bg-[var(--vk-bg)] shadow-[0_18px_60px_-24px_rgba(0,0,0,0.9)]">
        <CornerMarks />

        {/* Title bar */}
        <div className="flex h-10 items-center gap-4 border-b border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)] px-4">
          <span className="flex shrink-0 items-center gap-[7px]">
            {CONTROLS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onControl(c.id)}
                aria-label={`${c.label} ${app.file}`}
                data-cursor={c.label.toUpperCase()}
                data-cursor-sub={app.file}
                className="h-[9px] w-[9px] rounded-full opacity-70 transition-opacity hover:opacity-100"
                style={{ background: c.colour }}
              />
            ))}
          </span>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
            <ItemMark itemKey={app.id} label={app.name} kind="app" size={19} className="shrink-0" />
            <span className="vk-mono truncate text-[10px] tracking-[0.16em] text-[var(--vk-fg-dim)]">
              {app.file}
            </span>
            <span
              aria-hidden
              className="vk-mono hidden truncate text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)] sm:inline"
            >
              {app.path}
            </span>
          </div>

          <span className="vk-mono hidden shrink-0 items-center gap-2 text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)] sm:flex">
            {windows.maximised && <span aria-hidden>MAX</span>}
            {app.index}
          </span>
        </div>

        {/* Window body */}
        <div className="vk-scanlines vk-window-grid relative">
          {children}
          <ScreenCoords />
        </div>
      </div>
    </div>
  );
}
