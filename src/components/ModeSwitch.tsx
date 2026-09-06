"use client";

import { setMode, type Mode } from "@/lib/mode";

/**
 * The switch between the immersive world and the low-RAM desktop.
 *
 * Stated plainly, with the cost attached, because that is the only useful
 * thing to say about it: one version downloads several megabytes of rendered
 * film and paints a canvas, and the other does not. Dressing that up as a
 * "performance mode" would hide the one fact a visitor on a bad connection
 * actually needs.
 *
 * The way back matters as much as the way out. Someone who drops to the
 * reduced page and then opens a module has to be able to change their mind
 * from there, so the compact variant lives in the system header on every
 * route rather than only on the desktop.
 */
export function ModeSwitch({
  to,
  className,
  compact,
}: {
  to: Mode;
  className?: string;
  /** Header-sized: no download figure, and a shorter label. */
  compact?: boolean;
}) {
  const label = to === "lite" ? "LOW RAM MODE" : "IMMERSIVE MODE";
  const detail = to === "lite" ? "NO DOWNLOAD" : "5 MB";

  return (
    <button
      type="button"
      onClick={() => setMode(to)}
      className={`vk-mode${compact ? " is-compact" : ""} ${className ?? ""}`}
      data-cursor={to === "lite" ? "SWITCH" : "LOAD"}
      data-cursor-sub={to === "lite" ? "REDUCED PAGE" : "THE WORLD"}
      title={
        to === "lite"
          ? "Switch to the low-RAM page. Downloads nothing."
          : "Switch back to the immersive world. Downloads about 5 MB."
      }
    >
      <span className="vk-mode-dot" aria-hidden="true" />
      <span className="vk-mode-label">{compact ? "IMMERSIVE" : label}</span>
      {compact ? null : <span className="vk-mode-detail">{detail}</span>}
    </button>
  );
}
