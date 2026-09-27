"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Project, ProjectStatus } from "@/lib/types";
import { liveStatuses, slugOf } from "@/lib/data/projects";
import { Label, Slot, cx, statusColor } from "@/components/ui";
import { ItemMark } from "@/components/ItemMark";

/* Only offer filters for statuses that actually exist in the index, so the
   control never presents an empty result as a valid choice. */
const ORDER: ProjectStatus[] = ["ACTIVE", "BUILDING", "R&D"];
const FILTERS: Array<ProjectStatus | "ALL"> = [
  "ALL",
  ...ORDER.filter((s) => liveStatuses.includes(s)),
];

/** A single file row in the index. */
function ProjectFile({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  return (
    <li>
      <a
        href={`/projects/${slugOf(project)}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onOpen(project);
        }}
        data-cursor="OPEN FILE"
        data-cursor-sub={project.id}
        className="group relative block border-b border-[var(--vk-line)] py-6 transition-colors duration-300 hover:bg-[var(--vk-bg-panel)]"
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-[var(--vk-accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
        />

        <div className="grid grid-cols-1 items-center gap-x-6 gap-y-3 px-1 sm:px-4 lg:grid-cols-[112px_minmax(0,1.35fr)_minmax(0,1fr)_84px_110px]">
          {/* ID */}
          <span className="flex items-center gap-2">
            <ItemMark itemKey={project.id} label={project.name} kind="project" size={30} className="shrink-0" />
            <span className="vk-mono whitespace-nowrap text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)] transition-colors duration-300 group-hover:text-[var(--vk-accent)]">
              {project.id}
            </span>
          </span>

          {/* Name + summary */}
          <div className="min-w-0">
            <h3 className="truncate text-[21px] tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 sm:text-[24px]">
              <Slot className="text-[var(--vk-fg)]">{project.name}</Slot>
            </h3>
            <p className="mt-1.5 max-w-[52ch] truncate text-[13px] text-[var(--vk-fg-faint)]">
              <Slot>{project.tagline ?? project.summary}</Slot>
            </p>
          </div>

          {/* Category + tech */}
          <div className="min-w-0">
            <div className="vk-mono truncate text-[10px] tracking-[0.14em] text-[var(--vk-fg-dim)]">
              <Slot>{project.category}</Slot>
            </div>
            <div className="vk-mono mt-1.5 truncate text-[9px] tracking-[0.12em] text-[var(--vk-fg-ghost)]">
              {project.technologies.join(" · ")}
            </div>
          </div>

          {/* Year */}
          <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)]">
            {project.year}
          </span>

          {/* Status */}
          <span className="flex items-center gap-2 lg:justify-end">
            <span
              aria-hidden
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: statusColor(project.status) }}
            />
            <span
              className="vk-mono text-[10px] tracking-[0.14em]"
              style={{ color: statusColor(project.status) }}
            >
              {project.status}
            </span>
          </span>
        </div>

        <span
          aria-hidden
          className="vk-mono pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-[9px] tracking-[0.16em] text-[var(--vk-accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 xl:block"
          style={{ right: "-6px" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </a>
    </li>
  );
}

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<ProjectStatus | "ALL">("ALL");
  const [opening, setOpening] = React.useState<Project | null>(null);

  const visible = React.useMemo(
    () => (filter === "ALL" ? projects : projects.filter((p) => p.status === filter)),
    [filter, projects],
  );

  const open = React.useCallback(
    (p: Project) => {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (calm) {
        router.push(`/projects/${slugOf(p)}`);
        return;
      }
      setOpening(p);
      window.setTimeout(() => router.push(`/projects/${slugOf(p)}`), 520);
    },
    [router],
  );

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[var(--vk-line)] pb-4">
        <Label>FILTER</Label>
        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cx(
                "vk-mono border px-2.5 py-1.5 text-[9px] tracking-[0.16em] transition-colors",
                filter === f
                  ? "border-[var(--vk-accent)] text-[var(--vk-accent)]"
                  : "border-[var(--vk-line)] text-[var(--vk-fg-faint)] hover:border-[var(--vk-line-mid)] hover:text-[var(--vk-fg-dim)]",
              )}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="vk-mono ml-auto text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
          {String(visible.length).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}{" "}
          FILES
        </span>
      </div>

      {/* Column headings */}
      <div className="hidden grid-cols-[112px_minmax(0,1.35fr)_minmax(0,1fr)_84px_110px] gap-x-6 border-b border-[var(--vk-line)] px-4 py-2.5 lg:grid">
        <Label>ID</Label>
        <Label>NAME</Label>
        <Label>CATEGORY</Label>
        <Label>YEAR</Label>
        <Label className="lg:text-right">STATUS</Label>
      </div>

      <ul>
        {visible.map((p, i) => (
          <ProjectFile key={p.id} project={p} index={i} onOpen={open} />
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="vk-mono py-16 text-center text-[11px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
          NO FILES MATCH THIS FILTER.
        </p>
      )}

      {/* Opening-file transition */}
      <AnimatePresence>
        {opening && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-[var(--vk-bg)] px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          >
            <div className="w-full max-w-[420px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-faint)]"
              >
                OPENING FILE
                <span className="vk-caret">_</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6"
              >
                <ItemMark itemKey={opening.id} label={opening.name} kind="project" size={48} />
                <div className="vk-mono text-[11px] tracking-[0.2em] text-[var(--vk-accent)]">
                  {opening.id}
                </div>
                <div className="mt-3 text-[30px] tracking-tight text-[var(--vk-fg)]">
                  <Slot>{opening.name}</Slot>
                </div>
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "linear" }}
                className="mt-8 h-px origin-left bg-[var(--vk-accent)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
