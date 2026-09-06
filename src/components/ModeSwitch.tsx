"use client";

import { setMode, type Mode } from "@/lib/mode";

/**
 * The switch between the world and the low-RAM desktop.
 *
 * Stated plainly, with the cost attached, because that is the only useful
 * thing to say about it: one version downloads several megabytes of rendered
 * film and paints a canvas, and the other does not. Dressing that up as a
 * "performance mode" would hide the one fact a visitor on a bad connection
 * actually needs.
 */
export function ModeSwitch({ to, className }: { to: Mode; className?: string }) {
  const label = to === "lite" ? "LOW RAM MODE" : "FULL WORLD";
  const detail = to === "lite" ? "NO DOWNLOAD" : "5 MB";

  return (
    <button
      type="button"
      onClick={() => setMode(to)}
      className={`vk-mode ${className ?? ""}`}
      data-cursor={to === "lite" ? "SWITCH" : "LOAD"}
      data-cursor-sub={label}
    >
      <span className="vk-mode-dot" aria-hidden="true" />
      <span className="vk-mode-label">{label}</span>
      <span className="vk-mode-detail">{detail}</span>
    </button>
  );
}
