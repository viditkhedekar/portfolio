import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusDot } from "@/components/ui";
import { ZoneStage } from "@/components/world/ZoneStage";
import { LandingMode } from "@/components/world/LandingMode";
import { LiteDesktop } from "@/components/LiteDesktop";
import { ModeSwitch } from "@/components/ModeSwitch";
import { TerminalPrompt } from "@/components/world/TerminalPrompt";
import { zones, type Zone } from "@/lib/world";
import { modules, system } from "@/lib/data/system";
import { subjects } from "@/lib/data/school";
import { certifications } from "@/lib/data/certifications";
import { channels } from "@/lib/data/identity";

/**
 * VKOS/01 — the landing page.
 *
 * The panels here are captions, not content. Since the walls of the building
 * carry the real material as HTML mapped onto them, a panel that repeated it
 * would be the same words twice on one screen, read twice by a screen reader.
 * Each one now says where you are, what is around you, and how to get the
 * whole module.
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
  const journey = (
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
            <h1 className="vk-display vk-chrome text-[clamp(2.4rem,9vw,5rem)] leading-none">
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
            <TerminalPrompt />

            <p className="vk-mono mt-8 text-[9px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
              SCROLL TO TRAVEL
            </p>

            {/* Offered at the top, before any of the film has been asked for,
                because after that the offer is worth much less. */}
            <ModeSwitch to="lite" className="mt-5" />
          </div>
        </section>

        {/* ----------------------------------------------------- PROJECTS */}
        <Section zone={Z.projects} side="left">
          <Panel zone={Z.projects} title="Five stations, five builds.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              Five consoles down the hall, one per project. Read them where
              they stand, or open the index.
            </p>
          </Panel>
        </Section>

        {/* ------------------------------------------------------- SCHOOL */}
        <Section zone={Z.school} side="right">
          <Panel zone={Z.school} title="The academic system.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              The record is on the drum wall, and one plinth carries each of
              the {subjects.length} subjects in progress.
            </p>
          </Panel>
        </Section>

        {/* ----------------------------------------------- CERTIFICATIONS */}
        <Section zone={Z.certifications} side="left">
          <Panel zone={Z.certifications} title="The credential vault.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              {certifications.length} safes on this corridor hold something.
              Each one opens where it stands.
            </p>
          </Panel>
        </Section>

        {/* -------------------------------------------------------- ABOUT */}
        <Section zone={Z.about} side="right">
          <Panel zone={Z.about} title="The identity file.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              The file is on the two panels facing each other across the
              chamber, and on the plinth between them.
            </p>
          </Panel>
        </Section>

        {/* ------------------------------------------------------ CONTACT */}
        <Section zone={Z.contact} side="left" trailing>
          <Panel zone={Z.contact} title="Communications.">
            <p className="vk-mono text-[11px] leading-[1.75] tracking-[0.1em] text-[var(--vk-fg-faint)]">
              {channels.length} consoles at the foot of the mast, one per open
              channel. Each connects directly.
            </p>

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

  /* Both landings are described here, and the client picks one. The low-RAM
     branch is the page this site had before the world existed. */
  return <LandingMode world={journey} lite={<LiteDesktop />} />;
}
