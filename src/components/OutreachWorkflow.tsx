import Image from "next/image";
import { MoveRight } from "lucide-react";
import type { CSSProperties } from "react";

const steps = [
  { label: "Brief", icon: "document" },
  { label: "Target list", icon: "people" },
  { label: "Follow-ups", icon: "mail" },
  { label: "Replies", icon: "message" },
  { label: "Meetings", icon: "calendar" },
];

export function OutreachWorkflow() {
  return (
    <section className="outreach-workflow" aria-label="Outreach workflow" data-outreach-reveal>
      <h3 className="outreach-section-heading">We handle everything.</h3>
      <ol className="outreach-process">
        {steps.map(({ label, icon }, index) => (
          <li key={label}>
            <figure tabIndex={0} aria-label={label}>
              <Image className="outreach-process-art" src={`/projects/growency/workflow/${icon}.svg`} width={68} height={68} alt="" />
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
