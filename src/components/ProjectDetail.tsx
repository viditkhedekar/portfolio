import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { Container, Label, Prose, Slot, StatusTag, cx } from "@/components/ui";
import { Display } from "@/components/Display";
import { liveProjects, projects, slugOf } from "@/lib/data/projects";

const SECTIONS: Array<{ key: keyof Project; index: string; title: string }> = [
  { key: "objective", index: "01", title: "OBJECTIVE" },
  { key: "system", index: "02", title: "SYSTEM" },
  { key: "implementation", index: "03", title: "IMPLEMENTATION" },
  { key: "result", index: "04", title: "RESULT" },
  { key: "problems", index: "05", title: "PROBLEMS" },
  { key: "currentState", index: "06", title: "CURRENT STATE" },
  { key: "nextIteration", index: "07", title: "NEXT ITERATION" },
];

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--vk-line)] py-3.5 first:pt-0">
      <Label as="dt">{label}</Label>
      <dd className="vk-mono mt-2 text-[12px] leading-relaxed tracking-[0.1em] text-[var(--vk-fg)]">
        {value}
      </dd>
    </div>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const pool = project.archived ? projects.filter((p) => p.archived) : liveProjects;
  const idx = pool.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? pool[idx - 1] : null;
  const next = idx >= 0 && idx < pool.length - 1 ? pool[idx + 1] : null;

  /* The first live link is promoted to the title block; the metadata LINKS row
     then only earns its place when there is more than one. */
  const links = project.links ?? [];
  const primary = links.find((l) => l.href);
  const secondary = links.filter((l) => l !== primary);

  return (
    <Container>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--vk-line)] py-4">
        <Link
          href={project.archived ? "/archive" : "/projects"}
          className="group flex items-center gap-2"
          data-cursor="RETURN"
          data-cursor-sub={project.archived ? "ARCHIVE" : "PROJECT INDEX"}
        >
          <ArrowLeft
            size={13}
            strokeWidth={1.5}
            className="text-[var(--vk-fg-ghost)] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-[var(--vk-accent)]"
          />
          <span className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-fg-dim)]">
            {project.archived ? "ARCHIVE" : "PROJECT INDEX"}
          </span>
        </Link>
        <span className="vk-mono text-[10px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
          FILE {String(idx + 1).padStart(2, "0")} / {String(pool.length).padStart(2, "0")}
        </span>
      </div>

      {/* Title block */}
      <header className="grid gap-10 border-b border-[var(--vk-line)] py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-16">
        <div>
          <div className="vk-mono text-[11px] tracking-[0.22em] text-[var(--vk-accent)]">
            {project.id}
          </div>
          <h1 className="vk-display mt-6 text-[clamp(2.2rem,6vw,4.5rem)]">
            <Slot className="text-[var(--vk-fg)]">{project.name}</Slot>
          </h1>

          {primary && (
            <a
              href={primary.href}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="OPEN"
              data-cursor-sub={primary.label}
              className="vk-display group mt-3 inline-flex items-center gap-3 text-[clamp(2.2rem,6vw,4.5rem)] text-[var(--vk-accent)] transition-opacity hover:opacity-80"
            >
              Visit site
              <ArrowUpRight
                size={46}
                strokeWidth={1}
                className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
          )}
          {project.tagline && (
            <p className="mt-6 max-w-[26ch] text-[clamp(1.15rem,2.4vw,1.6rem)] leading-[1.35] tracking-tight">
              <Slot className="text-[var(--vk-fg)]">{project.tagline}</Slot>
            </p>
          )}
          <p className="mt-6 max-w-[54ch] text-[15px] leading-[1.75]">
            <Slot className="text-[var(--vk-fg-dim)]">{project.summary}</Slot>
          </p>
        </div>

        <dl className="lg:border-l lg:border-[var(--vk-line)] lg:pl-8">
          <Meta label="PROJECT ID" value={project.id} />
          <Meta label="CATEGORY" value={<Slot>{project.category}</Slot>} />
          <Meta label="STATUS" value={<StatusTag status={project.status} pulse />} />
          <Meta label="YEAR" value={project.year} />
          <Meta
            label="TECHNOLOGY"
            value={
              <span className="flex flex-wrap gap-1.5">
                {project.technologies.map((t, i) => (
                  /* Placeholder values repeat, so the index is part of the key. */
                  <span
                    key={`${t}-${i}`}
                    className="border border-[var(--vk-line)] px-2 py-1 text-[10px] tracking-[0.08em] text-[var(--vk-fg-dim)]"
                  >
                    {t}
                  </span>
                ))}
              </span>
            }
          />
          {secondary.length > 0 && (
            <div className="pt-4">
              <Label>LINKS</Label>
              <ul className="mt-3 space-y-2">
                {secondary.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    {l.href ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="OPEN"
                        data-cursor-sub="EXTERNAL"
                        className="vk-mono block break-words text-[11px] leading-relaxed tracking-[0.1em] text-[var(--vk-fg-dim)] transition-colors hover:text-[var(--vk-accent)]"
                      >
                        {l.label}
                        <ArrowUpRight
                          size={11}
                          strokeWidth={1.5}
                          className="ml-1.5 inline align-[-1px]"
                        />
                      </a>
                    ) : (
                      <span className="vk-mono text-[11px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                        {l.label} · UNCONFIGURED
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </dl>
      </header>

      {/* Primary display */}
      {project.media && project.media.length > 0 && (
        <div className="grid gap-6 py-12 lg:grid-cols-2">
          {project.media.map((m, i) => (
            <Display
              key={`${m.label}-${i}`}
              media={m}
              priority={i === 0}
              className={cx(project.media!.length === 1 && "lg:col-span-2")}
            />
          ))}
        </div>
      )}

      {/* Dossier */}
      <div className="border-t border-[var(--vk-line)]">
        {SECTIONS.map((s) => {
          const body = project[s.key] as string | undefined;
          if (!body) return null;
          return (
            <section
              key={s.key as string}
              className="grid gap-4 border-b border-[var(--vk-line)] py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16"
            >
              <div className="flex items-baseline gap-3 lg:flex-col lg:gap-2">
                <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-fg-ghost)]">
                  {s.index}
                </span>
                <h2 className="vk-mono text-[11px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
                  {s.title}
                </h2>
              </div>
              <Prose>{body}</Prose>
            </section>
          );
        })}
      </div>

      {/* Adjacent files */}
      <nav aria-label="Adjacent files" className="grid gap-px py-12 sm:grid-cols-2">
        {[
          { p: prev, dir: "PREVIOUS FILE", align: "" },
          { p: next, dir: "NEXT FILE", align: "sm:text-right sm:items-end" },
        ].map(({ p, dir, align }) =>
          p ? (
            <Link
              key={dir}
              href={`/projects/${slugOf(p)}`}
              data-cursor="OPEN FILE"
              data-cursor-sub={p.id}
              className={cx(
                "group flex flex-col gap-2 border border-[var(--vk-line)] p-6 transition-colors hover:border-[var(--vk-line-mid)] hover:bg-[var(--vk-bg-panel)]",
                align,
              )}
            >
              <Label>{dir}</Label>
              <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-accent)]">
                {p.id}
              </span>
              <span className="text-[18px] tracking-tight">
                <Slot className="text-[var(--vk-fg)]">{p.name}</Slot>
              </span>
            </Link>
          ) : (
            <div
              key={dir}
              className={cx(
                "flex flex-col gap-2 border border-dashed border-[var(--vk-line)] p-6 opacity-40",
                align,
              )}
            >
              <Label>{dir}</Label>
              <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                END OF INDEX
              </span>
            </div>
          ),
        )}
      </nav>
    </Container>
  );
}
