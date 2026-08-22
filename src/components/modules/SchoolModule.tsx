import { Container, Label, ModuleHeading, SectionTitle, Slot } from "@/components/ui";
import { achievements, research, school, subjects } from "@/lib/data/school";

export function SchoolModule() {
  return (
    <Container>
      <ModuleHeading index="02" name="SCHOOL" subtitle="ACADEMIC SYSTEM" />

      {/* Current level */}
      <section className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-[var(--vk-line)] py-10 lg:grid-cols-4">
        {[
          { label: "CURRENT LEVEL", value: school.currentLevel, accent: true },
          { label: "INSTITUTION", value: school.institution },
          { label: "YEAR GROUP", value: school.yearGroup },
          { label: "COMPLETION", value: school.completion },
        ].map((f) => (
          <div key={f.label}>
            <Label>{f.label}</Label>
            <div
              className={`vk-mono mt-3 text-[19px] tracking-tight ${
                f.accent ? "text-[var(--vk-accent)]" : ""
              }`}
            >
              <Slot className="text-[var(--vk-fg)]">{f.value}</Slot>
            </div>
          </div>
        ))}
      </section>

      {school.note && (
        <p className="max-w-[58ch] py-8 text-[15px] leading-relaxed">
          <Slot className="text-[var(--vk-fg-dim)]">{school.note}</Slot>
        </p>
      )}

      {/* Subjects */}
      <section className="pt-10">
        <SectionTitle right={`${String(subjects.length).padStart(2, "0")} REGISTERED`}>
          SUBJECTS
        </SectionTitle>
        <ul className="mt-8 grid grid-cols-1 border-l border-t border-[var(--vk-line)] sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s, i) => (
            <li
              key={s.name}
              className="group relative border-b border-r border-[var(--vk-line)] p-6 transition-colors hover:bg-[var(--vk-bg-panel)]"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--vk-accent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
              <div className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 text-[17px] tracking-tight text-[var(--vk-fg)]">{s.name}</h3>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <span className="vk-mono text-[9px] tracking-[0.14em]">
                  <Slot className="text-[var(--vk-fg-faint)]">{s.board}</Slot>
                </span>
                <span className="vk-mono text-[9px] tracking-[0.14em]">
                  <Slot>{s.note}</Slot>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Achievements */}
      <section className="pt-20">
        <SectionTitle right="ACADEMIC RECORD">ACHIEVEMENTS</SectionTitle>
        <ul className="mt-6">
          {achievements.map((a, i) => (
            <li
              key={`${a.title}-${i}`}
              className="grid gap-x-8 gap-y-2 border-b border-[var(--vk-line)] py-5 sm:grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[16px] tracking-tight">
                <Slot className="text-[var(--vk-fg)]">{a.title}</Slot>
              </span>
              <span className="flex items-baseline justify-between gap-4 text-[13px]">
                <Slot className="text-[var(--vk-fg-faint)]">{a.detail}</Slot>
                <span className="vk-mono text-[10px] tracking-[0.14em]">
                  <Slot>{a.year}</Slot>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Independent research */}
      <section className="py-20">
        <SectionTitle right="OUTSIDE THE SYLLABUS">CURRENT RESEARCH</SectionTitle>
        <ul className="mt-6">
          {research.map((r, i) => (
            <li
              key={`${r.field}-${i}`}
              className="grid gap-x-8 gap-y-3 border-b border-[var(--vk-line)] py-6 lg:grid-cols-[170px_minmax(0,1fr)_120px]"
            >
              <span className="vk-mono self-start border border-[var(--vk-line)] px-2 py-1 text-center text-[9px] tracking-[0.14em] text-[var(--vk-fg-faint)] lg:justify-self-start">
                {r.field}
              </span>
              <div>
                <h3 className="text-[16px] tracking-tight">
                  <Slot className="text-[var(--vk-fg)]">{r.title}</Slot>
                </h3>
                <p className="mt-1.5 max-w-[54ch] text-[13px] leading-relaxed">
                  <Slot className="text-[var(--vk-fg-faint)]">{r.note}</Slot>
                </p>
              </div>
              <div className="lg:text-right">
                {r.progress ? (
                  <>
                    <span className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-dim)]">
                      {r.progress}%
                    </span>
                    <div className="mt-2 h-px w-full bg-[var(--vk-line)]">
                      <div
                        className="h-px bg-[var(--vk-accent)]"
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                    [ PROGRESS ]
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
