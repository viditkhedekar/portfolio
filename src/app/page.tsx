import { Container, Label } from "@/components/ui";
import { SystemState, TelemetryPanel } from "@/components/TelemetryPanel";
import { system } from "@/lib/data/system";
import { apps } from "@/lib/data/apps";
import { GithubLink } from "@/components/GithubLink";
import { ParticleHero } from "@/components/ParticleHero";
import { HeadOrbit } from "@/components/HeadOrbit";
import { TerminalHint } from "@/components/TerminalHint";

const CONTEXT = ["PERSONAL SYSTEM", "DESKTOP", "PROJECTS", "EXPERIMENTS"];

export default function Home() {
  return (
    <Container className="pb-4">
      {/* ----------------------------------------------------------- DESKTOP */}
      <section className="pt-10 lg:pt-14" aria-labelledby="apps-heading">
        <div className="flex items-center gap-4 border-b border-[var(--vk-line)] pb-3">
          <h2 id="apps-heading" className="vk-label text-[var(--vk-fg-dim)]">
            APPLICATIONS
          </h2>
          <div className="h-px flex-1 bg-[var(--vk-line)]" />
          <span className="vk-label">{String(apps.length).padStart(2, "0")} INSTALLED</span>
        </div>
        <div className="mt-8">
          <HeadOrbit />
        </div>
      </section>

      {/* ---------------------------------------------------- CONTROL ROOM */}
      <section className="mt-20 grid grid-cols-1 gap-px border-y border-[var(--vk-line)] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col justify-between pb-10 pt-12 lg:pb-12 lg:pr-12 lg:pt-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
                SYSTEM
              </span>
              <span className="h-px w-8 bg-[var(--vk-line-mid)]" />
              <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-faint)]">
                ROOT
              </span>
            </div>

            <ParticleHero className="mt-6" compact />

            <p className="vk-mono mt-6 text-[11px] tracking-[0.22em] text-[var(--vk-fg-dim)]">
              {system.fullName}
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20">
            <div>
              <Label>OPERATOR</Label>
              <p className="mt-3 text-[26px] tracking-tight text-[var(--vk-fg)]">
                {system.operator}
              </p>
              <p className="vk-mono mt-2 text-[10px] tracking-[0.18em] text-[var(--vk-fg-faint)]">
                {system.role} · AGE {system.age}
              </p>
            </div>

            <div>
              <Label>DISCIPLINES</Label>
              <ul className="mt-3 space-y-1.5">
                {system.disciplines.map((d, i) => (
                  <li key={d} className="flex items-baseline gap-3">
                    <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="vk-mono text-[12px] tracking-[0.16em] text-[var(--vk-fg-dim)]">
                      {d}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Instrument column */}
        <aside className="flex flex-col gap-px border-t border-[var(--vk-line)] py-10 lg:border-l lg:border-t-0 lg:py-12 lg:pl-8">
          <TerminalHint />
          <TelemetryPanel />
          <SystemState className="mt-6" />
        </aside>
      </section>

      {/* ------------------------------------------------------ CONTEXT BAR */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-[var(--vk-line)] py-4">
        {CONTEXT.map((c) => (
          <span
            key={c}
            className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-faint)]"
          >
            {c}
          </span>
        ))}
        <span className="vk-mono ml-auto hidden text-[10px] tracking-[0.2em] text-[var(--vk-fg-faint)] sm:inline">
          ⌘K TO OPEN TERMINAL
        </span>
      </div>

      {/* --------------------------------------------------------- SOURCE  */}
      <div className="pt-14">
        <GithubLink />
      </div>
    </Container>
  );
}
