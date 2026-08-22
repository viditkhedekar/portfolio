import {
  Container,
  Label,
  ModuleHeading,
  SectionTitle,
  Slot,
} from "@/components/ui";
import {
  demoInstruments,
  financeIntro,
  notes,
  syntheticSeries,
  topics,
} from "@/lib/data/finance";

/* --------------------------------------------------------------- charts */

function toPath(values: number[], w: number, h: number, pad = 2): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function Sparkline({ values, accent = false }: { values: number[]; accent?: boolean }) {
  return (
    <svg viewBox="0 0 120 28" className="h-7 w-[120px]" preserveAspectRatio="none" aria-hidden>
      <path
        d={toPath(values, 120, 28)}
        fill="none"
        stroke={accent ? "var(--vk-accent)" : "var(--vk-fg-faint)"}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function LineChart({ values }: { values: number[] }) {
  const W = 900;
  const H = 260;
  const path = toPath(values, W, H, 12);
  const last = values[values.length - 1];
  const first = values[0];
  const up = last >= first;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[220px] w-full sm:h-[280px]"
        preserveAspectRatio="none"
        role="img"
        aria-label="Synthetic demonstration series, not market data"
      >
        <defs>
          <linearGradient id="vk-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--vk-accent)" stopOpacity="0.13" />
            <stop offset="100%" stopColor="var(--vk-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={0}
            x2={W}
            y1={H * t}
            y2={H * t}
            stroke="var(--vk-line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#vk-fade)" />
        <path
          d={path}
          fill="none"
          stroke={up ? "var(--vk-accent)" : "var(--vk-fg-dim)"}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Illustrative long-call payoff. A concept diagram, not a price series. */
function PayoffDiagram() {
  return (
    <svg viewBox="0 0 300 150" className="h-[150px] w-full" role="img" aria-label="Illustrative long call payoff diagram">
      <line x1="20" y1="110" x2="285" y2="110" stroke="var(--vk-line-mid)" strokeWidth="1" />
      <line x1="20" y1="15" x2="20" y2="130" stroke="var(--vk-line-mid)" strokeWidth="1" />
      <line
        x1="150"
        y1="15"
        x2="150"
        y2="130"
        stroke="var(--vk-line)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path d="M20,128 L150,128 L275,25" fill="none" stroke="var(--vk-accent)" strokeWidth="1.25" />
      <path d="M20,110 L285,110" fill="none" stroke="transparent" />
      <text x="150" y="145" textAnchor="middle" className="vk-mono" fontSize="7" fill="var(--vk-fg-ghost)" letterSpacing="1.2">
        STRIKE
      </text>
      <text x="24" y="24" className="vk-mono" fontSize="7" fill="var(--vk-fg-ghost)" letterSpacing="1.2">
        P/L
      </text>
    </svg>
  );
}

/* --------------------------------------------------------------- module */

export function FinanceModule() {
  const main = syntheticSeries(demoInstruments[0].seed, 160, demoInstruments[0].drift);

  return (
    <Container>
      <ModuleHeading index="03" name="FINANCE" subtitle="FINANCIAL RESEARCH" />

      <p className="max-w-[62ch] py-8 text-[15px] leading-[1.75]">
        <Slot className="text-[var(--vk-fg-dim)]">{financeIntro}</Slot>
      </p>

      {/* Terminal */}
      <section className="border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]">
        <div className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
          <Label>SERIES VIEWER</Label>
          <span className="vk-mono text-[9px] tracking-[0.14em] text-[#e8c53c]">
            SYNTHETIC DATA · NOT MARKET DATA
          </span>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="vk-scanlines relative border-b border-[var(--vk-line)] p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-baseline gap-4">
              <span className="vk-mono text-[12px] tracking-[0.16em] text-[var(--vk-fg)]">
                {demoInstruments[0].symbol}
              </span>
              <span className="vk-mono text-[9px] tracking-[0.14em]">
                <Slot>{demoInstruments[0].label}</Slot>
              </span>
              <span className="vk-mono ml-auto text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                160 STEPS
              </span>
            </div>
            <LineChart values={main} />
          </div>

          <div>
            {demoInstruments.map((inst, i) => {
              const s = syntheticSeries(inst.seed, 60, inst.drift);
              return (
                <div
                  key={inst.symbol}
                  className="flex items-center justify-between gap-4 border-b border-[var(--vk-line)] px-4 py-4 last:border-b-0"
                >
                  <div>
                    <div className="vk-mono text-[11px] tracking-[0.14em] text-[var(--vk-fg-dim)]">
                      {inst.symbol}
                    </div>
                    <div className="vk-mono mt-1 text-[9px] tracking-[0.12em]">
                      <Slot>{inst.label}</Slot>
                    </div>
                  </div>
                  <Sparkline values={s} accent={i === 0} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[var(--vk-line)] px-4 py-3">
          <p className="vk-mono text-[9px] leading-relaxed tracking-[0.12em] text-[var(--vk-fg-ghost)]">
            SERIES GENERATED FROM A FIXED SEED FOR INTERFACE DEMONSTRATION.
            NO LIVE FEED IS CONNECTED AND NO FIGURE HERE REFERS TO A REAL INSTRUMENT.
          </p>
        </div>
      </section>

      {/* Areas of study */}
      <section className="pt-20">
        <SectionTitle right={`${String(topics.length).padStart(2, "0")} AREAS`}>
          AREAS OF STUDY
        </SectionTitle>
        <div className="mt-8 grid grid-cols-1 border-l border-t border-[var(--vk-line)] sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => (
            <section
              key={t.id}
              className="group relative border-b border-r border-[var(--vk-line)] p-6 transition-colors hover:bg-[var(--vk-bg-panel)]"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--vk-accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
              <div className="flex items-baseline justify-between">
                <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                  {t.items.length}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] tracking-tight text-[var(--vk-fg)]">{t.title}</h3>
              <ul className="mt-4 space-y-1.5">
                {t.items.map((item, j) => (
                  <li key={j} className="vk-mono text-[10px] tracking-[0.12em]">
                    <Slot className="text-[var(--vk-fg-faint)]">{item}</Slot>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Payoff diagram fills the trailing grid cell */}
          <div className="border-b border-r border-[var(--vk-line)] p-6">
            <Label>ILLUSTRATIVE · LONG CALL PAYOFF</Label>
            <div className="mt-4">
              <PayoffDiagram />
            </div>
            <p className="vk-mono mt-2 text-[9px] leading-relaxed tracking-[0.12em] text-[var(--vk-fg-ghost)]">
              CONCEPT DIAGRAM. NO PRICES IMPLIED.
            </p>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="py-20">
        <SectionTitle right="RESEARCH LOG">NOTES</SectionTitle>
        <ul className="mt-6">
          {notes.map((n) => (
            <li
              key={n.id}
              className="grid gap-x-8 gap-y-3 border-b border-[var(--vk-line)] py-6 lg:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_130px]"
            >
              <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)]">
                {n.id}
              </span>
              <h3 className="text-[16px] tracking-tight">
                <Slot className="text-[var(--vk-fg)]">{n.title}</Slot>
              </h3>
              <p className="max-w-[46ch] text-[13px] leading-relaxed">
                <Slot className="text-[var(--vk-fg-faint)]">{n.body}</Slot>
              </p>
              <div className="lg:text-right">
                <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                  {n.kind}
                </span>
                <div className="vk-mono mt-1 text-[9px] tracking-[0.14em]">
                  <Slot>{n.date}</Slot>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
