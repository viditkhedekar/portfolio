import Link from "next/link";
import {
  Archive,
  BadgeCheck,
  FolderOpen,
  GraduationCap,
  Send,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apps } from "@/lib/data/apps";
import { liveProjects, projectStats } from "@/lib/data/projects";
import { Label, StatusDot, statusColor } from "@/components/ui";
import { subjects } from "@/lib/data/school";
import { certifications } from "@/lib/data/certifications";
import { channels } from "@/lib/data/identity";

const GLYPH: Record<string, LucideIcon> = {
  projects: FolderOpen,
  school: GraduationCap,
  certifications: BadgeCheck,
  about: UserRound,
  contact: Send,
  archive: Archive,
};

/** Counts come from the data files so an icon never contradicts its app. */
function appMeta(id: string): string {
  switch (id) {
    case "projects":
      return `${String(projectStats.indexed).padStart(2, "0")} FILES`;
    case "school":
      return `${String(subjects.length).padStart(2, "0")} SUBJECTS`;
    case "certifications":
      return `${String(certifications.length).padStart(2, "0")} RECORDS`;
    case "about":
      return "IDENTITY";
    case "contact":
      return `${String(channels.length).padStart(2, "0")} CHANNELS`;
    case "archive":
      return "COLD STORAGE";
    default:
      return "";
  }
}

/**
 * The desktop: application icons rather than a page nav.
 *
 * Icons are ordered by the module rail, with ARCHIVE last as the one app that
 * sits outside the module index.
 */
export function ModuleNavigation() {
  return (
    <nav aria-label="Applications">
      <div className="vk-grid-bg border border-[var(--vk-line)] p-6 sm:p-10">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {apps.map((a) => {
            const Glyph = GLYPH[a.id] ?? FolderOpen;
            return (
              <li key={a.id}>
                <Link
                  href={a.href}
                  data-cursor="LAUNCH"
                  data-cursor-sub={a.file}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Icon plate */}
                  <span className="relative flex aspect-square w-full max-w-[104px] items-center justify-center border border-[var(--vk-line)] bg-[var(--vk-bg-panel)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:border-[var(--vk-accent)] group-hover:bg-[var(--vk-bg-raised)] group-hover:shadow-[0_10px_30px_-14px_var(--vk-accent-soft)]">
                    <span className="vk-mono absolute left-2 top-2 text-[8px] tracking-[0.16em] text-[var(--vk-fg-ghost)] transition-colors group-hover:text-[var(--vk-accent)]">
                      {a.index}
                    </span>
                    <Glyph
                      size={30}
                      strokeWidth={1}
                      className="text-[var(--vk-fg-faint)] transition-colors duration-300 group-hover:text-[var(--vk-accent)]"
                    />
                  </span>

                  <span className="vk-mono mt-4 block text-[10px] tracking-[0.14em] text-[var(--vk-fg-dim)] transition-colors group-hover:text-[var(--vk-fg)]">
                    {a.file}
                  </span>
                  <span className="vk-mono mt-1.5 block text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                    {appMeta(a.id)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Recent files strip — the desktop still shows what is in the system. */}
      <div className="mt-6 border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]">
        <div className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
          <Label>RECENT FILES</Label>
          <Link
            href="/projects"
            className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)] transition-colors hover:text-[var(--vk-accent)]"
          >
            OPEN PROJECTS.app →
          </Link>
        </div>
        <ul>
          {liveProjects.slice(0, 3).map((p) => (
            <li key={p.id} className="border-b border-[var(--vk-line)] last:border-b-0">
              <Link
                href={`/projects/${p.id.toLowerCase()}`}
                data-cursor="OPEN FILE"
                data-cursor-sub={p.id}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--vk-bg-raised)]"
              >
                <span className="vk-mono w-[54px] shrink-0 text-[10px] tracking-[0.12em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-accent)]">
                  {p.id}
                </span>
                <span className="vk-mono min-w-0 flex-1 truncate text-[10px] tracking-[0.12em] text-[var(--vk-fg-faint)]">
                  {p.name}
                </span>
                <StatusDot status={p.status} />
                <span
                  className="vk-mono w-[62px] shrink-0 text-right text-[9px] tracking-[0.12em]"
                  style={{ color: statusColor(p.status) }}
                >
                  {p.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
