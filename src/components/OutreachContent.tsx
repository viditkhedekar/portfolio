import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OutreachMotion } from "@/components/OutreachMotion";
import { OutreachWorkflow } from "@/components/OutreachWorkflow";
import { growencyClients } from "@/lib/data/portfolio";
import "@/app/outreach.css";

const monthlyPrice = 499;
const clients = growencyClients.toReversed();

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

      <div className="outreach-close" data-outreach-reveal>
        <section className="outreach-pricing" aria-label="Pricing">
          <h3>Plans start at</h3>
          <p className="outreach-price-line">
            <span data-outreach-price aria-hidden="true">£{monthlyPrice}</span>
            <span className="visually-hidden">£{monthlyPrice}</span>
            <span className="outreach-price-period">/ month</span>
          </p>
          <p className="outreach-per-call">Plus a fee per booked call.</p>
          <p className="outreach-pricing-note">We can discuss alternative pricing, including commissions.</p>
        </section>

        <Link className="outreach-booking" href="/book">
          Book a call
          <span><ArrowUpRight strokeWidth={1.5} aria-hidden="true" /></span>
        </Link>
      </div>
    </OutreachMotion>
  );
}
