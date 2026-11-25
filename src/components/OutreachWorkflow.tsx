import { CalendarDays, Check, FileText, ListChecks, Mail, MessageSquare, Send } from "lucide-react";

const steps = [
  { id: "brief", title: "Campaign brief", copy: "We agree who to reach, what you’re selling, and what a qualified meeting looks like." },
  { id: "list", title: "Target list", copy: "We research the right accounts and find the people worth contacting at each one." },
  { id: "emails", title: "Emails and follow-ups", copy: "We write the opening email and follow-ups, then test the messaging across your audience." },
  { id: "replies", title: "Reply handling", copy: "We answer questions, follow up on interest, and qualify replies against the brief." },
  { id: "calendar", title: "Meetings booked", copy: "We coordinate a time and put qualified conversations on your calendar." },
] as const;

function WorkflowIllustration({ id }: { id: (typeof steps)[number]["id"] }) {
  switch (id) {
    case "brief":
      return (
        <div className="outreach-picture outreach-picture-brief">
          <div className="outreach-paper">
            <div className="outreach-paper-heading"><FileText aria-hidden="true" /> Campaign brief</div>
            {["Offer", "Target audience", "Qualified meeting"].map((label) => (
              <div className="outreach-paper-row" key={label}><span>{label}</span><i /></div>
            ))}
          </div>
          <span className="outreach-paper-check"><Check aria-hidden="true" /></span>
        </div>
      );
    case "list":
      return (
        <div className="outreach-picture outreach-picture-list">
          <div className="outreach-paper">
            <div className="outreach-paper-heading"><ListChecks aria-hidden="true" /> Target accounts</div>
            <div className="outreach-list-row outreach-list-labels"><span>Account</span><span>Role</span><span>Fit</span></div>
            {["Founder", "Operations", "Growth"].map((role) => (
              <div className="outreach-list-row" key={role}><span className="outreach-list-account"><b /><i /></span><span>{role}</span><Check size={13} aria-hidden="true" /></div>
            ))}
          </div>
        </div>
      );
    case "emails":
      return (
        <div className="outreach-picture outreach-picture-emails">
          <div className="outreach-paper">
            <div className="outreach-paper-heading"><Mail aria-hidden="true" /> First email</div>
            <div className="outreach-paper-lines"><i /><i /><i /></div>
          </div>
          <div className="outreach-paper">
            <div className="outreach-paper-heading"><Send aria-hidden="true" /> Follow-up</div>
            <div className="outreach-paper-lines"><i /><i /></div>
          </div>
        </div>
      );
    case "replies":
      return (
        <div className="outreach-picture outreach-picture-replies">
          <div className="outreach-paper">
            <div className="outreach-paper-heading"><MessageSquare aria-hidden="true" /> Replies</div>
            {["Interested", "Has a question", "Not right now"].map((label) => (
              <div className="outreach-reply" key={label}><i /><span>{label}</span></div>
            ))}
          </div>
        </div>
      );
    case "calendar":
      return (
        <div className="outreach-picture outreach-picture-calendar">
          <div className="outreach-paper">
            <div className="outreach-paper-heading"><CalendarDays aria-hidden="true" /> Calendar</div>
            <div className="outreach-calendar-grid">
              {["M", "T", "W", "T", "F"].map((day, index) => <span key={index}>{day}</span>)}
              {Array.from({ length: 15 }, (_, index) => <i key={index} />)}
            </div>
          </div>
          <span className="outreach-calendar-event"><Check size={15} aria-hidden="true" /> Intro call booked</span>
        </div>
      );
  }
}

export function OutreachWorkflow() {
  return (
    <section className="outreach-workflow" aria-label="From brief to meeting">
      <h3 className="outreach-section-heading" data-outreach-reveal>From brief to meeting, we handle it all.</h3>
      <div className="outreach-workflow-layout" data-outreach-workflow>
        <ol className="outreach-workflow-steps">
          {steps.map(({ id, title, copy }, index) => (
            <li key={id} data-outreach-step data-current={index === 0}>
              <div className="outreach-step-copy" data-outreach-reveal>
                <h4>{title}</h4>
                <p>{copy}</p>
              </div>
              <div className="outreach-mobile-picture" data-outreach-reveal aria-hidden="true"><WorkflowIllustration id={id} /></div>
            </li>
          ))}
        </ol>
        <div className="outreach-workflow-stage" aria-hidden="true">
          {steps.map(({ id }, index) => (
            <div className="outreach-workflow-scene" data-outreach-scene data-current={index === 0} key={id}>
              <WorkflowIllustration id={id} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
