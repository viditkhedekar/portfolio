import type { Metadata } from "next";
import { Container, ModuleHeading } from "@/components/ui";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { archivedProjects, liveProjects, projectStats } from "@/lib/data/projects";
import Link from "next/link";
import { Label } from "@/components/ui";

export const metadata: Metadata = {
  title: "Projects",
  description: "PROJECT INDEX — selected builds, experiments and systems.",
};

export default function ProjectsPage() {
  return (
    <Container>
      <ModuleHeading index="01" name="PROJECTS" subtitle="PROJECT INDEX" />

      <div className="grid grid-cols-2 gap-6 border-b border-[var(--vk-line)] py-6 sm:grid-cols-4">
        {[
          { label: "INDEXED", value: liveProjects.length },
          { label: "ACTIVE", value: projectStats.active },
          { label: "BUILDING", value: projectStats.building },
          { label: "R&D", value: projectStats.rd },
        ].map((s) => (
          <div key={s.label}>
            <Label>{s.label}</Label>
            <div className="vk-mono mt-2 text-[28px] leading-none tracking-tight text-[var(--vk-fg)]">
              {String(s.value).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-10">
        <ProjectExplorer projects={liveProjects} />
      </div>

      <div className="py-12">
        <Link
          href="/archive"
          data-cursor="ACCESS"
          data-cursor-sub="ARCHIVE"
          className="group flex items-center justify-between border border-[var(--vk-line)] p-6 transition-colors hover:border-[var(--vk-line-mid)] hover:bg-[var(--vk-bg-panel)]"
        >
          <div>
            <Label>ARCHIVE</Label>
            <p className="mt-2 text-[19px] tracking-tight text-[var(--vk-fg)]">
              {archivedProjects.length} archived builds
            </p>
            <p className="mt-1 text-[13px] text-[var(--vk-fg-faint)]">
              Earlier experiments, prototypes and abandoned ideas.
            </p>
          </div>
          <span className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-fg-ghost)] transition-colors group-hover:text-[var(--vk-accent)]">
            OPEN →
          </span>
        </Link>
      </div>
    </Container>
  );
}
