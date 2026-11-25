import { CalendarCheck, ClipboardList, ListChecks, Mail, MessageSquare, MoveRight } from "lucide-react";
import type { CSSProperties } from "react";

const steps = [
  { label: "Brief", icon: ClipboardList },
  { label: "Target list", icon: ListChecks },
  { label: "Follow-ups", icon: Mail },
  { label: "Replies", icon: MessageSquare },
  { label: "Meetings", icon: CalendarCheck },
];

export function OutreachWorkflow() {
  return (
    <section className="outreach-workflow" aria-label="Outreach workflow" data-outreach-reveal>
      <h3 className="outreach-section-heading">We handle everything.</h3>
      <ol className="outreach-process">
        {steps.map(({ label, icon: Icon }, index) => (
          <li key={label}>
            <figure tabIndex={0} aria-label={label}>
              <div className="outreach-process-art"><Icon strokeWidth={1.45} aria-hidden="true" /></div>
              <figcaption aria-hidden="true">{label}</figcaption>
            </figure>
            {index < steps.length - 1 && (
              <MoveRight
                className="outreach-process-arrow"
                aria-hidden="true"
                strokeWidth={1.35}
                style={{ "--arrow-delay": `${index * 130}ms` } as CSSProperties}
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
