"use client";

import { useTerminal } from "@/components/TerminalProvider";

/**
 * Desktop-only nudge toward the terminal.
 *
 * Sits at the top of the instrument column on the desktop and points up-right
 * at the TERMINAL button in the header. Hidden below `sm`, where that button is
 * not rendered.
 */
export function TerminalHint() {
  const terminal = useTerminal();

  return (
    <button
      type="button"
      onClick={terminal.open}
      data-cursor="OPEN"
      data-cursor-sub="TERMINAL"
      className="group mb-6 hidden w-full items-start gap-3 text-left sm:flex"
    >
      {/* Curves up and to the right, toward the header button. */}
      <svg
        aria-hidden
        width="46"
        height="40"
        viewBox="0 0 46 40"
        fill="none"
        className="mt-1 shrink-0 overflow-visible text-[var(--vk-accent)]"
      >
        <path
          d="M3 37C3 21 9 7 27 4"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className="opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        />
        <path
          d="M20 2.5 27.5 3.6 25 10.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </svg>

      <span className="min-w-0 pt-3">
        <span className="vk-mono block text-[10px] leading-relaxed tracking-[0.16em] text-[var(--vk-accent)]">
          NAVIGATE FROM THE TERMINAL
        </span>
        <span className="vk-mono mt-1.5 block text-[9px] leading-relaxed tracking-[0.14em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-fg-dim)]">
          TRY <span className="text-[var(--vk-fg-dim)]">ls</span> THEN{" "}
          <span className="text-[var(--vk-fg-dim)]">cd projects</span>
          <span className="mx-1.5 text-[var(--vk-fg-ghost)]">·</span>⌘K
        </span>
      </span>
    </button>
  );
}
