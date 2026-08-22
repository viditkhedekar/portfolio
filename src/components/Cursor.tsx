"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Desktop-only crosshair cursor.
 *
 * Any element carrying data-cursor="LABEL" (optionally data-cursor-sub="…")
 * shows a small readout beside the crosshair while hovered. Disabled entirely
 * on touch devices and under prefers-reduced-motion, where the native cursor
 * is left alone.
 */
export function Cursor() {
  const root = React.useRef<HTMLDivElement>(null);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const calm = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = fine && !calm;
  const [visible, setVisible] = React.useState(false);
  const [readout, setReadout] = React.useState<{ label: string; sub?: string } | null>(null);
  const [pressed, setPressed] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      document.body.removeAttribute("data-vk-cursor");
      return;
    }
    document.body.setAttribute("data-vk-cursor", "on");

    let raf = 0;
    let x = -100;
    let y = -100;

    const paint = () => {
      raf = 0;
      if (root.current) {
        root.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
      if (!visible) setVisible(true);

      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      if (target) {
        setReadout({
          label: target.getAttribute("data-cursor") ?? "",
          sub: target.getAttribute("data-cursor-sub") ?? undefined,
        });
      } else {
        setReadout(null);
      }
    };

    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.body.removeAttribute("data-vk-cursor");
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  const active = readout !== null;

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 160ms linear" }}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(-50%, -50%) scale(${pressed ? 0.82 : 1})`,
          transition: "transform 120ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* crosshair */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 1.5v5M11 15.5v5M1.5 11h5M15.5 11h5"
            stroke={active ? "var(--vk-accent)" : "var(--vk-fg-dim)"}
            strokeWidth="1"
            style={{ transition: "stroke 140ms linear" }}
          />
          <circle
            cx="11"
            cy="11"
            r={active ? 4.5 : 1.4}
            stroke={active ? "var(--vk-accent)" : "transparent"}
            fill={active ? "transparent" : "var(--vk-fg-dim)"}
            strokeWidth="1"
            style={{ transition: "r 160ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
      </div>

      {readout && (
        <div className="absolute left-[18px] top-[10px] whitespace-nowrap border border-[var(--vk-line-mid)] bg-[var(--vk-bg-raised)]/95 px-2 py-1 backdrop-blur-sm">
          <div className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-accent)]">
            {readout.label}
          </div>
          {readout.sub && (
            <div className="vk-mono mt-0.5 text-[9px] tracking-[0.14em] text-[var(--vk-fg-faint)]">
              {readout.sub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
