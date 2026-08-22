import type { Metadata } from "next";
import Link from "next/link";
import { Container, Label, ModuleHeading, Slot, StatusTag } from "@/components/ui";
import { archivedProjects, slugOf } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Archive",
  description: "ARCHIVE — earlier builds, experiments, prototypes and abandoned ideas.",
};

export default function ArchivePage() {
  return (
    <Container>
      <ModuleHeading index="··" name="ARCHIVE" subtitle="COLD STORAGE" />

      <p className="max-w-[58ch] py-8 text-[15px] leading-relaxed text-[var(--vk-fg-dim)]">
        Projects that were shelved, outgrown or replaced. Kept because the failures
        are part of the record.
      </p>

      <ul className="border-t border-[var(--vk-line)]">
        {archivedProjects.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${slugOf(p)}`}
              data-cursor="OPEN FILE"
              data-cursor-sub={p.id}
              className="group grid gap-x-8 gap-y-4 border-b border-[var(--vk-line)] py-7 transition-colors hover:bg-[var(--vk-bg-panel)] lg:grid-cols-[76px_minmax(0,1fr)_minmax(0,1.1fr)_110px]"
            >
              <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-accent)]">
                {p.id}
              </span>

              <div>
                <h2 className="text-[20px] tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                  <Slot className="text-[var(--vk-fg-dim)]">{p.name}</Slot>
                </h2>
                <div className="vk-mono mt-2 text-[10px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                  <Slot>{p.category}</Slot>
                  <span className="mx-2">·</span>
                  {p.year}
                </div>
              </div>

              <div>
                <Label>NOTE</Label>
                <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed">
                  <Slot className="text-[var(--vk-fg-faint)]">{p.archiveNote}</Slot>
                </p>
              </div>

              <div className="lg:text-right">
                <StatusTag status={p.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="py-12">
        <Link
          href="/projects"
          className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-fg-faint)] transition-colors hover:text-[var(--vk-accent)]"
        >
          ← RETURN TO PROJECT INDEX
        </Link>
      </div>
    </Container>
  );
}
