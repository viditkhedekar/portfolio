import * as React from "react";
import type { AppDescriptor } from "@/lib/data/apps";

/** The three window dots. Decorative, so they are hidden from assistive tech. */
function WindowDots() {
  return (
    <span aria-hidden className="flex shrink-0 items-center gap-[7px]">
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span
          key={c}
          className="h-[9px] w-[9px] rounded-full opacity-70"
          style={{ background: c }}
        />
      ))}
    </span>
  );
}

/**
 * Window chrome around a running application.
 *
 * Every route except the desktop renders inside one of these: a title bar with
 * the app's filename and shell path, then the page itself as the window body.
 * The controls are decorative — navigation happens through the header, the dock
 * and the terminal.
 */
export function AppWindow({
  app,
  children,
}: {
  app: AppDescriptor;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 pb-10 pt-4 sm:px-5 lg:px-8">
      <div className="border border-[var(--vk-line-mid)] bg-[var(--vk-bg)] shadow-[0_18px_60px_-24px_rgba(0,0,0,0.9)]">
        {/* Title bar */}
        <div className="flex h-10 items-center gap-4 border-b border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)] px-4">
          <WindowDots />

          <div className="flex min-w-0 flex-1 items-baseline justify-center gap-3">
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

          <span className="vk-mono hidden shrink-0 text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)] sm:block">
            {app.index}
          </span>
        </div>

        {/* Window body */}
        <div className="vk-scanlines relative">{children}</div>
      </div>
    </div>
  );
}
