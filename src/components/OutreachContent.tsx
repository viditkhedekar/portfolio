import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { OutreachMotion } from "@/components/OutreachMotion";
import { OutreachWorkflow } from "@/components/OutreachWorkflow";
import { growencyClients, growencyUrl } from "@/lib/data/portfolio";
import "@/app/outreach.css";

const monthlyPrice = 499;
const clients = growencyClients.toReversed();

const cloud = [
  { text: "LinkedIn", weight: "large" },
  { text: "Connection requests", weight: "small" },
  { text: "Cold email", weight: "hero" },
  { text: "Warm introductions", weight: "medium" },
  { text: "Direct messages", weight: "small" },
  { text: "Follow-ups", weight: "medium" },
] as const;

export function OutreachContent() {
  return (
    <OutreachMotion monthlyPrice={monthlyPrice}>
      <header className="outreach-heading">
        <h2>I build and run <span className="outreach-underlined">outbound systems</span> for B2B teams.</h2>
      </header>

      <section className="outreach-clients" aria-label="Worked with" data-outreach-reveal>
        <h3>Worked with</h3>
        <ul>
          {clients.map(({ name, href, detail, logo: { file, width, height, wordmark } }) => (
            <li key={file}>
              <a href={href} className={wordmark ? "outreach-client-wordmark" : "outreach-client"}>
                <Image src={"/projects/growency/logos/" + file + ".webp"} width={width} height={height} alt={wordmark ? name : ""} />
                {!wordmark && <span>{name}</span>}
              </a>
              {detail && <span className="outreach-client-batch">{detail}</span>}
            </li>
          ))}
        </ul>
      </section>

      <OutreachWorkflow />

      <section className="outreach-channels" aria-label="Channels" data-outreach-reveal>
        <h3 className="outreach-section-heading">Channels</h3>
        <ul className="outreach-channel-cloud">
          {cloud.map(({ text, weight }) => <li key={text} data-weight={weight}>{text}</li>)}
        </ul>
        <details className="outreach-channel-details">
          <summary>See all channels <ArrowDownRight size={17} aria-hidden="true" /></summary>
          <dl>
            <div><dt>Cold email</dt><dd>Opening emails and follow-ups for the accounts you want to reach.</dd></div>
            <div><dt>LinkedIn</dt><dd>Connection requests and direct messages where they fit the campaign.</dd></div>
            <div><dt>Warm introductions</dt><dd>Introductions through existing relationships when there’s a good route in.</dd></div>
          </dl>
        </details>
      </section>

      <section className="outreach-pricing" aria-label="Pricing" data-outreach-reveal>
        <h3>Plans start at</h3>
        <p className="outreach-price-line">
          <span data-outreach-price aria-hidden="true">£{monthlyPrice}</span>
          <span className="visually-hidden">£{monthlyPrice}</span>
          <span className="outreach-price-period">/ month</span>
        </p>
        <p className="outreach-per-call">Plus a fee per booked call.</p>
        <p className="outreach-pricing-note">We can discuss alternative pricing, including commissions.</p>
      </section>

      <a className="outreach-booking" href={new URL("book", growencyUrl).href} data-outreach-reveal>
        Book a call
        <span><ArrowUpRight strokeWidth={1.5} aria-hidden="true" /></span>
      </a>
    </OutreachMotion>
  );
}
