"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import type { ProjectMedia } from "@/lib/types";
import { Label, cx } from "@/components/ui";

/** Full-size view of one capture. Escape or a click outside closes it. */
function FullView({ media, onClose }: { media: ProjectMedia; onClose: () => void }) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px] sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.figure
        role="dialog"
        aria-modal="true"
        aria-label={`${media.label} — full size`}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.995 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-h-full w-full max-w-[1400px] flex-col border border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.85)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <figcaption className="flex h-10 shrink-0 items-center justify-between gap-4 border-b border-[var(--vk-line)] px-4">
          <span className="vk-mono truncate text-[10px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
            {media.label}
            {media.ref && (
              <span className="ml-3 text-[var(--vk-fg-ghost)]">{media.ref}</span>
            )}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close full-size view"
            className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--vk-fg-faint)] transition-colors hover:text-[var(--vk-fg)]"
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </figcaption>

        <div className="min-h-0 flex-1 overflow-auto bg-[var(--vk-bg)] p-2 sm:p-4">
          {/* Intrinsic sizing: the whole capture is visible, uncropped. */}
          <Image
            src={media.src}
            alt={media.alt}
            width={1920}
            height={1080}
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>
      </motion.figure>
    </motion.div>
  );
}

/**
 * A framed "display" inside the VKOS interface. Media is labelled as system
 * output rather than as a screenshot.
 *
 * The frame crops to fill from the centre, so a wide capture loses an equal
 * slice from each side rather than its whole right-hand edge. Selecting it
 * opens the capture uncropped at full size. An empty `src` renders an explicit
 * awaiting-media state instead of a broken image.
 */
export function Display({
  media,
  className,
  priority = false,
}: {
  media: ProjectMedia;
  className?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const empty = !media.src;

  const frame = (
    <div className="vk-scanlines relative aspect-[16/9] w-full overflow-hidden bg-[var(--vk-bg)]">
      {empty ? (
        <div className="vk-grid-bg absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
            NO SIGNAL
          </span>
          <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]/70">
            AWAITING MEDIA
          </span>
        </div>
      ) : media.kind === "video" ? (
        <video
          src={media.src}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          aria-label={media.alt}
        />
      ) : (
        <>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]"
            priority={priority}
          />
          <span className="absolute inset-0 bg-[var(--vk-bg)]/0 transition-colors duration-300 group-hover:bg-[var(--vk-bg)]/25" />
          <span className="vk-mono absolute bottom-3 right-3 flex items-center gap-2 border border-[var(--vk-line-mid)] bg-[var(--vk-bg)]/85 px-2.5 py-1.5 text-[9px] tracking-[0.16em] text-[var(--vk-fg-faint)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Maximize2 size={11} strokeWidth={1.5} />
            FULL SIZE
          </span>
        </>
      )}
    </div>
  );

  return (
    <>
      <figure
        className={cx("border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]", className)}
      >
        <figcaption className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
          <Label>{media.label}</Label>
          {media.ref && (
            <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
              {media.ref}
            </span>
          )}
        </figcaption>

        {empty || media.kind === "video" ? (
          frame
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-cursor="EXPAND"
            data-cursor-sub={media.label}
            aria-label={`View ${media.label} at full size`}
            className="group block w-full cursor-pointer"
          >
            {frame}
          </button>
        )}
      </figure>

      <AnimatePresence>
        {open && <FullView media={media} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
