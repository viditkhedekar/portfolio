import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusDot } from "@/components/ui";
import { ZoneStage } from "@/components/world/ZoneStage";
import { zones, type Zone } from "@/lib/world";
import { modules, system } from "@/lib/data/system";
import { liveProjects, projectStats } from "@/lib/data/projects";
import { qualification, school, subjects } from "@/lib/data/school";
import { certificationGroups, certifications } from "@/lib/data/certifications";
import { channels, identity } from "@/lib/data/identity";

/**
 * VKOS/01 — the landing page.
 *
 * One document. Scrolling it flies a camera through a single continuous
 * world, and this file is the readable half of that: six blocks of scroll,
 * each pinning one panel to the middle of the screen for exactly as long as
 * its environment is on camera.
 *
 * Everything here is a teaser. Counts and names are read from the data files
 * so a panel can never contradict the module it opens, and the module pages
 * are where the actual material lives.
 *
 * If the world failed to load, this page is still a complete, ordered
 * description of the whole system. That is the test it has to pass.
 */

/** Zone lookup, so a section can be written in the order it is read. */
const Z: Record<string, Zone> = Object.fromEntries(zones.map((z) => [z.id, z]));

/** Height of a zone's scroll block, from the share of the path it owns. */
function span(zone: Zone, trailing = false): React.CSSProperties {
  const share = zone.range[1] - zone.range[0];
  return {
    minHeight: trailing
      ? `calc(${share} * var(--vk-travel) + 100vh)`
      : `calc(${share} * var(--vk-travel))`,
  };
}

/* ------------------------------------------------------------------ parts */

function Row({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-[var(--vk-line)] py-1.5">
      <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
        {label}
      </span>
      <span
        className={`vk-mono text-[11px] tracking-[0.14em] ${
          dim ? "text-[var(--vk-fg-faint)]" : "text-[var(--vk-fg-dim)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Panel({
  zone,
  title,
  children,
}: {
  zone: Zone;
  title: string;
  children: React.ReactNode;
}) {
  const app = modules.find((m) => m.id === zone.id);

  return (
    <div className="vk-zone-panel">
      <div className="flex items-baseline gap-3">
        <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-accent)]">
          {zone.index}
        </span>
        <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">/</span>
        <h2 className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-dim)]">
          {app?.name ?? zone.location}
        </h2>
        <span className="ml-auto flex items-center gap-2">
          <StatusDot status={app?.status ?? "ONLINE"} />
          <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
            {app?.status}
          </span>
        </span>
      </div>

      <p className="vk-display mt-3.5 text-[clamp(1.5rem,3.4vw,2.1rem)] text-[var(--vk-fg)]">
        {title}
      </p>

      <div className="mt-5">{children}</div>

      {zone.href ? (
        <Link
          href={zone.href}
          data-cursor="ACCESS MODULE"
          data-cursor-sub={`${zone.index} / ${app?.name}`}
          className="group mt-6 flex items-center justify-between border border-[var(--vk-accent-line)] bg-[var(--vk-accent-ghost)] px-4 py-3 transition-colors duration-200 hover:border-[var(--vk-accent)] hover:bg-[var(--vk-accent-faint)]"
        >
          <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-accent-soft)] transition-colors group-hover:text-[var(--vk-accent)]">
            OPEN {app?.name}
          </span>
          <ArrowRight
            aria-hidden="true"
            size={13}
            strokeWidth={1.5}
            className="text-[var(--vk-accent-soft)] transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}

function Section({
  zone,
  side,
  trailing,
  children,
}: {
  zone: Zone;
  side: "left" | "right";
  trailing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={zone.id}
      data-side={side}
      className="vk-zone"
      style={span(zone, trailing)}
      aria-label={zone.location}
    >
      <div className="vk-zone-body">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------- page */

export default function Home() {
  const providers = certificationGroups.length;

  return (
    <>
      {/* The world itself and the HUD over it are mounted by VKOSShell, which
          keeps them clear of the boot fade. This is the readable half. */}
      <ZoneStage>
        {/* -------------------------------------------------- OUTER FIELD */}
        <section
          id="origin"
          className="vk-zone"
          style={span(Z.origin)}
          aria-label={Z.origin.location}
        >
          <div className="vk-zone-body vk-zone-open">
            <h1 className="vk-display text-[clamp(2.4rem,9vw,5rem)] leading-none text-[var(--vk-fg)]">
              {system.code}
            </h1>
            <p className="vk-mono mt-4 text-[10px] tracking-[0.22em] text-[var(--vk-fg-faint)]">
              {system.fullName}
            </p>
            <p className="vk-mono mt-8 text-[11px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
              {system.operator}
              <span className="mx-2 text-[var(--vk-fg-ghost)]">/</span>
              {system.role}
            </p>
            <p className="vk-mono mt-10 text-[9px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
              SCROLL TO TRAVEL
              <span className="mx-2">·</span>
              <span className="hidden sm:inline">⌘K FOR TERMINAL</span>
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------- PROJECTS */}
        <Section zone={Z.projects} side="left">
          <Panel zone={Z.projects} title="Five stations, five builds.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              Every station in the facility is a project that exists. The file
              has the objective, what broke, and where it goes next.
            </p>
            <div className="mt-4">
              {liveProjects.map((p) => (
                <Row key={p.id} label={p.id} value={p.name.toUpperCase()} />
              ))}
              <Row
                label="INDEXED"
                value={`${String(projectStats.indexed).padStart(2, "0")} FILES`}
                dim
              />
            </div>
          </Panel>
        </Section>

        {/* ------------------------------------------------------- SCHOOL */}
        <Section zone={Z.school} side="right">
          <Panel zone={Z.school} title="The academic system.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              One marker on the inner ring for every subject in progress.
            </p>
            <div className="mt-4">
              <Row label="LEVEL" value={school.currentLevel} />
              <Row
                label="SUBJECTS"
                value={String(subjects.length).padStart(2, "0")}
              />
              <Row label="YEAR" value={school.yearGroup} />
              <Row label="COMPLETION" value={school.completion} />
              <Row label={qualification.name} value={qualification.grade} dim />
            </div>
          </Panel>
        </Section>

        {/* ----------------------------------------------- CERTIFICATIONS */}
        <Section zone={Z.certifications} side="left">
          <Panel zone={Z.certifications} title="The credential vault.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              Every lit slot on the wall is a record on file. The empty ones
              are not padding, they are room.
            </p>
            <div className="mt-4">
              <Row
                label="RECORDS"
                value={String(certifications.length).padStart(2, "0")}
              />
              <Row label="PROVIDERS" value={String(providers).padStart(2, "0")} />
              {certificationGroups.map((g) => (
                <Row
                  key={g.id}
                  label={g.provider}
                  value={String(g.items.length).padStart(2, "0")}
                  dim
                />
              ))}
            </div>
          </Panel>
        </Section>

        {/* -------------------------------------------------------- ABOUT */}
        <Section zone={Z.about} side="right">
          <Panel zone={Z.about} title="The identity file.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              {identity.statement}
            </p>
            <div className="mt-4">
              <Row label="NAME" value={identity.name} />
              <Row label="AGE" value={String(identity.age)} />
              <Row label="ROLE" value={identity.role} />
              <Row label="BASED" value={identity.based} />
            </div>
          </Panel>
        </Section>

        {/* ------------------------------------------------------ CONTACT */}
        <Section zone={Z.contact} side="left" trailing>
          <Panel zone={Z.contact} title="Communications.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              One marker at the foot of the mast for each channel that is open.
            </p>
            <div className="mt-4">
              {channels.map((c) => (
                <Row
                  key={c.id}
                  label={c.label}
                  value={c.href ? "OPEN" : "UNCONFIGURED"}
                  dim={!c.href}
                />
              ))}
            </div>

            {/* The landing page has no footer, so the two routes that are not
                stations on the path are reachable from the last panel. */}
            <div className="mt-6 flex items-center gap-5 border-t border-[var(--vk-line)] pt-4">
              <Link
                href="/archive"
                className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)] transition-colors hover:text-[var(--vk-fg-dim)]"
              >
                ARCHIVE
              </Link>
              <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
                VKOS 1.0.0
              </span>
            </div>
          </Panel>
        </Section>
      </ZoneStage>
    </>
  );
}
