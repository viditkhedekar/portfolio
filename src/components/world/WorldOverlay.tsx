"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { Surface } from "@/lib/surfaces";
import { WorldSurfaces } from "@/components/world/WorldSurfaces";
import { getProject, slugOf } from "@/lib/data/projects";
import { certifications } from "@/lib/data/certifications";

/**
 * The interactive layer over the film: the walls, and what opens when you
 * touch one.
 *
 * Clicking a console does not leave the journey. It opens the file in place,
 * over the world, with a way through to the full module page for anyone who
 * wants the rest. Leaving the world to read one paragraph would waste the
 * thing the world is for.
 */
export function WorldOverlay() {
  const [open, setOpen] = React.useState<Surface | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <WorldSurfaces onOpen={setOpen} />
      {open ? <WorldSheet surface={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function WorldSheet({
  surface,
  onClose,
}: {
  surface: Surface;
  onClose: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const project = surface.project ? getProject(surface.project) : undefined;
  const credential = surface.id.startsWith("credential-")
    ? certifications[Number(surface.id.slice(11))]
    : undefined;

  const title = project?.name ?? credential?.name;
  if (!title) return null;

  return (
    <div className="vk-sheet-layer" role="dialog" aria-modal="true" aria-label={title}>
      {/* The scrim closes, but it is a button rather than a click handler on a
          div so it is reachable without a pointer. */}
      <button type="button" className="vk-sheet-scrim" onClick={onClose} aria-label="Close" />

      <div className="vk-sheet">
        <div className="vk-sheet-head">
          <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-accent)]">
            {project?.id ?? credential?.id}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} className="vk-sheet-close">
            <X aria-hidden="true" size={14} strokeWidth={1.6} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <h2 className="vk-display mt-3 text-[clamp(1.8rem,4vw,2.6rem)] text-[var(--vk-fg)]">
          {title}
        </h2>
        {project ? (
          <p className="vk-mono mt-3 text-[11px] leading-[1.7] tracking-[0.1em] text-[var(--vk-fg-faint)]">
            {project.tagline}
          </p>
        ) : null}

        {/* Every dossier field is optional in the data, and an unfilled one
            should leave no trace rather than print an empty heading. */}
        <dl className="mt-6 space-y-4">
          <Row label="OBJECTIVE" value={project?.objective} />
          <Row label="RESULT" value={project?.result} />
          <Row label="CURRENT STATE" value={project?.currentState} />
          <Row label="ISSUER" value={credential?.issuer} />
          <Row label="DETAIL" value={credential?.summary} />
        </dl>

        <Link
          href={project ? `/projects/${slugOf(project)}` : "/certifications"}
          className="group mt-7 flex items-center justify-between border border-[var(--vk-accent-line)] bg-[var(--vk-accent-ghost)] px-4 py-3 transition-colors hover:border-[var(--vk-accent)] hover:bg-[var(--vk-accent-faint)]"
        >
          <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-accent-soft)] transition-colors group-hover:text-[var(--vk-accent)]">
            {project ? "OPEN THE FULL FILE" : "OPEN THE DATABASE"}
          </span>
          <ArrowRight
            aria-hidden="true"
            size={13}
            strokeWidth={1.5}
            className="text-[var(--vk-accent-soft)] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
        {label}
      </dt>
      <dd className="vk-mono mt-1.5 text-[11px] leading-[1.7] tracking-[0.08em] text-[var(--vk-fg-dim)]">
        {value}
      </dd>
    </div>
  );
}
