import { formatDot, system, uptimeYears } from "@/lib/data/system";
import { projectStats } from "@/lib/data/projects";
import { Label, StatusDot, cx } from "@/components/ui";

function Readout({
  label,
  value,
  accent,
  dot,
}: {
  label: string;
  value: string;
  accent?: boolean;
  dot?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--vk-line)] px-4 py-3 last:border-b-0">
      <Label as="dt">{label}</Label>
      <dd className="flex items-center gap-2">
        {dot && <StatusDot status={dot} pulse />}
        <span
          className={cx(
            "vk-mono text-[12px] tracking-[0.06em]",
            accent ? "text-[var(--vk-accent)]" : "text-[var(--vk-fg)]",
          )}
        >
          {value}
        </span>
      </dd>
    </div>
  );
}

export function TelemetryPanel({ className }: { className?: string }) {
  return (
    <section
      className={cx(
        "border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]",
        className,
      )}
      aria-label="System telemetry"
    >
      <div className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
        <Label>TELEMETRY</Label>
        <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
          LIVE
        </span>
      </div>
      <dl>
        <Readout label="SYSTEM STATUS" value="ONLINE" dot="ONLINE" accent />
        <Readout label="PROJECTS" value={String(projectStats.total)} />
        <Readout label="ACTIVE" value={String(projectStats.active)} />
        <Readout label="BUILDING" value={String(projectStats.building)} />
        <Readout label="ARCHIVED" value={String(projectStats.archived)} />
        <Readout label="UPTIME" value={`${uptimeYears()} YEARS`} />
        <Readout label="LAST UPDATE" value={formatDot(system.lastUpdate)} />
      </dl>
    </section>
  );
}

/** The four system states, one of which is active. */
export function SystemState({ className }: { className?: string }) {
  return (
    <section
      className={cx("border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]", className)}
      aria-label="Current system state"
    >
      <div className="flex h-9 items-center border-b border-[var(--vk-line)] px-4">
        <Label>CURRENT SYSTEM STATE</Label>
      </div>
      <ul className="p-4">
        {system.states.map((s) => {
          const active = s === system.state;
          return (
            <li key={s} className="flex items-center gap-3 py-1.5">
              <span
                aria-hidden
                className={cx(
                  "h-[5px] w-[5px] shrink-0 rounded-full",
                  active ? "bg-[var(--vk-accent)]" : "bg-[var(--vk-fg-ghost)]",
                  active && "vk-pulse",
                )}
              />
              <span
                className={cx(
                  "vk-mono text-[12px] tracking-[0.16em]",
                  active ? "text-[var(--vk-fg)]" : "text-[var(--vk-fg-ghost)]",
                )}
              >
                {s}
              </span>
              {active && (
                <span className="vk-mono ml-auto text-[9px] tracking-[0.14em] text-[var(--vk-accent)]">
                  ACTIVE
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
