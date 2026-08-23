"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { system } from "@/lib/data/system";
import { useMounted } from "@/lib/hooks";

/** Matches the CSS duration below; the overlay unmounts once it has played. */
const FADE_MS = 180;

/**
 * The operator's photograph: a small circle in the header that opens to a
 * larger view.
 *
 * The blazer shot only exists at 896x1195, and the square this is cut from is
 * 260 pixels across, so the expanded view is deliberately modest. Blown up to
 * fill a screen it would be mush.
 *
 * The fade is plain CSS rather than framer-motion. Inside a portal the library
 * gave neither half of the behaviour: on its own a `motion` element applies
 * `initial` and never animates in, and wrapped in `AnimatePresence` it animates
 * but never unmounts, leaving an invisible full-screen overlay swallowing every
 * click on the page.
 */
export function OperatorPortrait() {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const timer = React.useRef<number | undefined>(undefined);
  const mounted = useMounted();

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const close = React.useCallback(() => {
    setClosing(true);
    timer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      /* Send focus back where it came from, or the header loses its place. */
      trigger.current?.focus();
    }, FADE_MS);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const overlay = !open ? null : (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[var(--vk-bg)]/88 px-6 backdrop-blur-sm ${
        closing
          ? "pointer-events-none opacity-0 transition-opacity duration-200 [transition-timing-function:var(--vk-ease)]"
          : "vk-overlay-in"
      }`}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph of ${system.operator}`}
    >
      <figure
        className={`border border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)] p-3 ${
          closing
            ? "scale-[0.98] opacity-0 transition-all duration-200 [transition-timing-function:var(--vk-ease)]"
            : "vk-panel-in"
        }`}
        /* The backdrop closes; the panel itself should not. */
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src="/operator-large.jpg"
          alt={`${system.operator}, photographed in a lobby`}
          width={320}
          height={320}
          className="block h-[min(320px,68vw)] w-[min(320px,68vw)] object-cover"
        />

        <figcaption className="mt-3 flex items-baseline justify-between gap-6">
          <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
            {system.operator}
          </span>
          <button
            type="button"
            onClick={close}
            className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)] transition-colors hover:text-[var(--vk-accent)] focus-visible:text-[var(--vk-accent)] focus-visible:outline-none"
          >
            CLOSE ESC
          </button>
        </figcaption>
      </figure>
    </div>
  );

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge photograph of ${system.operator}`}
        aria-expanded={open}
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--vk-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vk-bg)]"
      >
        <Image
          src="/operator.jpg"
          alt=""
          aria-hidden
          width={192}
          height={192}
          priority
          className="h-[30px] w-[30px] rounded-full object-cover opacity-85 transition-opacity duration-200 hover:opacity-100"
        />
      </button>

      {/*
        The header sets a backdrop-filter, which makes it the containing block
        for any fixed-position descendant. Left in place the overlay is trapped
        inside a 62px-tall bar, so it is portalled to the body instead.
      */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
