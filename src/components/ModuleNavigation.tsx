import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { modules } from "@/lib/data/system";
import { liveProjects, projectStats } from "@/lib/data/projects";
import { Label, StatusDot, statusColor } from "@/components/ui";

function moduleMeta(id: string): string {
  switch (id) {
    case "projects":
      return `${projectStats.total} FILES`;
    case "school":
      return "6 SUBJECTS";
    case "finance":
      return "5 AREAS";
    case "certifications":
      return "ARCHIVE";
    case "about":
      return "IDENTITY";
    case "contact":
      return "3 CHANNELS";
    default:
      return "";
  }
}

/** Shared hover treatment: a 1px accent rule that draws in from the left. */
function Sweep() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--vk-accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
    />
  );
}

export function ModuleNavigation() {
  const [primary, ...rest] = modules;

  return (
    <nav aria-label="System modules">
      <div className="grid grid-cols-1 border-l border-t border-[var(--vk-line)] sm:grid-cols-2 lg:grid-cols-3">
        {/* 01 — PROJECTS, dominant */}
        <Link
          href={primary.href}
          data-cursor="ACCESS MODULE"
          data-cursor-sub="01 / PROJECTS"
          className="group relative flex min-h-[280px] flex-col justify-between border-b border-r border-[var(--vk-line)] bg-[var(--vk-bg-panel)] p-6 transition-colors duration-300 hover:bg-[var(--vk-bg-raised)] sm:col-span-2 sm:min-h-[340px] lg:row-span-2 lg:min-h-[420px]"
        >
          <Sweep />

          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="vk-mono text-[11px] tracking-[0.2em] text-[var(--vk-accent)]">
                {primary.index}
              </div>
              <h3 className="vk-display mt-6 text-[clamp(2.4rem,6.5vw,4.5rem)] text-[var(--vk-fg)]">
                {primary.name}
              </h3>
              <p className="vk-label mt-4">{primary.description}</p>
            </div>
            <ArrowUpRight
              size={18}
              strokeWidth={1.25}
              className="shrink-0 text-[var(--vk-fg-ghost)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--vk-accent)]"
            />
          </div>

          {/* File preview strip */}
          <div className="mt-10">
            <ul className="hidden border-t border-[var(--vk-line)] sm:block">
              {liveProjects.slice(0, 3).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 border-b border-[var(--vk-line)] py-2.5"
                >
                  <span className="vk-mono w-[54px] shrink-0 text-[10px] tracking-[0.12em] text-[var(--vk-fg-faint)]">
                    {p.id}
                  </span>
                  <span className="vk-mono flex-1 truncate text-[10px] tracking-[0.12em] text-[var(--vk-fg-ghost)]">
                    {p.name}
                  </span>
                  <StatusDot status={p.status} />
                  <span
                    className="vk-mono w-[62px] shrink-0 text-right text-[9px] tracking-[0.12em]"
                    style={{ color: statusColor(p.status) }}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between">
              <span className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-fg-faint)]">
                {projectStats.total} FILES
                <span className="mx-2 text-[var(--vk-fg-ghost)]">/</span>
                {projectStats.active} ACTIVE
              </span>
              <span className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-accent)]">
                {primary.status}
              </span>
            </div>
          </div>
        </Link>

        {/* 02–06 */}
        {rest.map((m) => (
          <Link
            key={m.id}
            href={m.href}
            data-cursor="ACCESS MODULE"
            data-cursor-sub={`${m.index} / ${m.name}`}
            className="group relative flex min-h-[168px] flex-col justify-between border-b border-r border-[var(--vk-line)] p-6 transition-colors duration-300 hover:bg-[var(--vk-bg-panel)]"
          >
            <Sweep />

            <div className="flex items-start justify-between gap-4">
              <span className="vk-mono text-[11px] tracking-[0.2em] text-[var(--vk-fg-ghost)] transition-colors duration-300 group-hover:text-[var(--vk-accent)]">
                {m.index}
              </span>
              <ArrowUpRight
                size={14}
                strokeWidth={1.25}
                className="shrink-0 text-transparent transition-all duration-300 group-hover:text-[var(--vk-fg-faint)]"
              />
            </div>

            <div>
              <h3 className="text-[22px] tracking-tight text-[var(--vk-fg)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
                {m.name}
              </h3>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Label>{m.description}</Label>
                <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)] transition-opacity duration-300 group-hover:opacity-0">
                  {moduleMeta(m.id)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
