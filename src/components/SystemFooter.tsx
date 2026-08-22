import Link from "next/link";
import { CurrentMission } from "@/components/CurrentMission";
import { formatDot, modules, system, uptimeYears } from "@/lib/data/system";
import { projectStats } from "@/lib/data/projects";
import { Label } from "@/components/ui";

export function SystemFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--vk-line)]">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* Identity */}
          <div>
            <div className="vk-mono text-[12px] tracking-[0.22em] text-[var(--vk-fg)]">
              {system.code}
            </div>
            <div className="vk-mono mt-2 max-w-[26ch] text-[10px] leading-[1.7] tracking-[0.16em] text-[var(--vk-fg-faint)]">
              {system.fullName}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Label as="dt">UPTIME</Label>
                <dd className="vk-mono mt-1.5 text-[12px] text-[var(--vk-fg-dim)]">
                  {uptimeYears()} YEARS
                </dd>
              </div>
              <div>
                <Label as="dt">LAST UPDATE</Label>
                <dd className="vk-mono mt-1.5 text-[12px] text-[var(--vk-fg-dim)]">
                  {formatDot(system.lastUpdate)}
                </dd>
              </div>
              <div>
                <Label as="dt">FILES</Label>
                <dd className="vk-mono mt-1.5 text-[12px] text-[var(--vk-fg-dim)]">
                  {String(projectStats.indexed).padStart(2, "0")}
                </dd>
              </div>
              <div>
                <Label as="dt">MODULES</Label>
                <dd className="vk-mono mt-1.5 text-[12px] text-[var(--vk-fg-dim)]">
                  {String(modules.length).padStart(2, "0")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Index */}
          <nav aria-label="Footer module index">
            <Label>INDEX</Label>
            <ul className="mt-4 space-y-2.5">
              {modules.map((m) => (
                <li key={m.id}>
                  <Link
                    href={m.href}
                    className="group flex items-baseline gap-3"
                    data-cursor="ACCESS MODULE"
                    data-cursor-sub={m.name}
                  >
                    <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                      {m.index}
                    </span>
                    <span className="vk-mono text-[11px] tracking-[0.14em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-fg)]">
                      {m.name}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/archive" className="group flex items-baseline gap-3">
                  <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                    ··
                  </span>
                  <span className="vk-mono text-[11px] tracking-[0.14em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-fg)]">
                    ARCHIVE
                  </span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mission */}
          <CurrentMission />
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--vk-line)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
            {system.operator} · {new Date().getFullYear()}
          </span>
          <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
            VKOS 1.0.0 · BUILD {formatDot(system.lastUpdate)}
          </span>
        </div>
      </div>
    </footer>
  );
}
