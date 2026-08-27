import { Container, Label, ModuleHeading, SectionTitle, Slot } from "@/components/ui";
import { identity } from "@/lib/data/identity";
import { uptimeYears } from "@/lib/data/system";

export function AboutModule() {
  return (
    <Container>
      <ModuleHeading index="04" name="ABOUT" subtitle="IDENTITY FILE" photo />

      <div className="grid gap-12 py-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20">
        {/* Record table */}
        <aside>
          <div className="border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]">
            <div className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
              <Label>RECORD</Label>
              <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                READ ONLY
              </span>
            </div>
            <dl>
              {identity.records.map((r) => (
                <div
                  key={r.key}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--vk-line)] px-4 py-3 last:border-b-0"
                >
                  <Label as="dt">{r.key}</Label>
                  <dd className="vk-mono text-[11px] tracking-[0.1em]">
                    <Slot className="text-[var(--vk-fg)]">{r.value}</Slot>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6">
            <Label>INTERESTS</Label>
            <ul className="mt-3 space-y-1.5">
              {identity.interests.map((t, i) => (
                <li key={t} className="flex items-baseline gap-3">
                  <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="vk-mono text-[11px] tracking-[0.16em] text-[var(--vk-fg-dim)]">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-[var(--vk-line)] pt-4">
            <Label>UPTIME</Label>
            <p className="vk-mono mt-2 text-[11px] tracking-[0.12em] text-[var(--vk-fg-faint)]">
              {uptimeYears()} YEARS
            </p>
          </div>
        </aside>

        {/* Statement */}
        <div>
          <p className="max-w-[46ch] text-[clamp(1.25rem,2.6vw,1.75rem)] leading-[1.45] tracking-tight">
            <Slot className="text-[var(--vk-fg)]">{identity.statement}</Slot>
          </p>

          <div className="mt-14">
            <SectionTitle right="PERSONAL">STATEMENT</SectionTitle>
            <div className="mt-2">
              {identity.blocks.map((b, i) => (
                <section
                  key={b.label}
                  className="grid gap-3 border-b border-[var(--vk-line)] py-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12"
                >
                  <div className="flex items-baseline gap-3 lg:flex-col lg:gap-2">
                    <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-fg-ghost)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="vk-mono text-[11px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
                      {b.label}
                    </h3>
                  </div>
                  <p className="max-w-[62ch] text-[15px] leading-[1.75]">
                    <Slot className="text-[var(--vk-fg-dim)]">{b.body}</Slot>
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
