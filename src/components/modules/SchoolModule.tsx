import { Container, Label, ModuleHeading, SectionTitle } from "@/components/ui";
import { Disclosure } from "@/components/Disclosure";
import { ItemMark } from "@/components/ItemMark";
import {
  achievementSections,
  predicted,
  qualification,
  school,
  subjects,
} from "@/lib/data/school";

function entryCount(id: string): number {
  const section = achievementSections.find((s) => s.id === id);
  return section ? section.groups.reduce((n, g) => n + g.entries.length, 0) : 0;
}

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
              className={`vk-mono mt-3 text-[19px] leading-snug tracking-tight ${
                f.accent ? "text-[var(--vk-accent)]" : "text-[var(--vk-fg)]"
              }`}
            >
              {f.value}
            </div>
          </div>
        ))}
      </section>

      <p className="max-w-[58ch] py-8 text-[15px] leading-relaxed text-[var(--vk-fg-dim)]">
        {school.note}
      </p>

      {/* Grades and the project qualification */}
      <section className="pt-10">
        <SectionTitle right={school.since}>QUALIFICATIONS</SectionTitle>

        <div className="mt-8 grid gap-px border border-[var(--vk-line)] bg-[var(--vk-line)] sm:grid-cols-2">
          <div className="bg-[var(--vk-bg-panel)] p-6">
            <Label>PREDICTED GRADES</Label>
            <div className="vk-mono mt-4 text-[clamp(1.5rem,4vw,2.25rem)] leading-none tracking-[0.14em] text-[var(--vk-fg)]">
              {predicted.grades}
            </div>
            <p className="vk-mono mt-4 text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
              {predicted.caveat}
            </p>
          </div>

          <div className="bg-[var(--vk-bg-panel)] p-6">
            <Label>{qualification.name}</Label>
            <div className="mt-4 flex items-baseline gap-4">
              <span className="vk-mono text-[clamp(1.5rem,4vw,2.25rem)] leading-none tracking-tight text-[var(--vk-accent)]">
                {qualification.grade}
              </span>
              <span className="vk-mono text-[12px] tracking-[0.14em] text-[var(--vk-fg-faint)]">
                {qualification.mark}
              </span>
            </div>
            <p className="mt-4 max-w-[38ch] text-[13px] leading-relaxed text-[var(--vk-fg-dim)]">
              {qualification.detail}
            </p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="pt-20">
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
              <div className="mt-5 flex items-center gap-3">
                <ItemMark itemKey={`subject:${s.name}`} label={s.name} kind="subject" size={32} className="shrink-0" />
                <h3 className="text-[17px] tracking-tight text-[var(--vk-fg)]">{s.name}</h3>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Record — collapsed by default */}
      <section className="py-20">
        <SectionTitle right="ACADEMIC RECORD">ACHIEVEMENTS</SectionTitle>

        <div className="mt-2">
          {achievementSections.map((section, i) => (
            <Disclosure
              key={section.id}
              index={String(i + 1).padStart(2, "0")}
              title={section.title}
              summary={section.summary}
              meta={`${String(entryCount(section.id)).padStart(2, "0")} ENTRIES`}
            >
              <div className="space-y-10 pl-0 sm:pl-8">
                {section.groups.map((group, gi) => (
                  <div key={group.label ?? gi}>
                    {group.label && (
                      <div className="vk-mono mb-5 inline-block border border-[var(--vk-line)] px-2 py-1 text-[9px] tracking-[0.16em] text-[var(--vk-fg-faint)]">
                        {group.label}
                      </div>
                    )}
                    <ul className="border-t border-[var(--vk-line)]">
                      {group.entries.map((e, ei) => (
                        <li
                          key={e.title}
                          className="grid gap-x-8 gap-y-1.5 border-b border-[var(--vk-line)] py-4 sm:grid-cols-[40px_minmax(0,1fr)]"
                        >
                          <span className="flex flex-col gap-1">
                            <ItemMark itemKey={`achievement:${section.id}:${group.label ?? gi}:${e.title}`} label={e.title} kind="achievement" size={29} />
                            <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                              {String(ei + 1).padStart(2, "0")}
                            </span>
                          </span>
                          <div>
                            <p className="text-[15px] leading-snug tracking-tight text-[var(--vk-fg)]">
                              {e.title}
                            </p>
                            {e.detail && (
                              <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-[var(--vk-fg-faint)]">
                                {e.detail}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Disclosure>
          ))}
        </div>
      </section>
    </Container>
  );
}
