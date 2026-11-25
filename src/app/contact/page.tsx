import type { Metadata } from "next";
import { ExternalArrow } from "@/components/PortfolioMedia";
import { channels } from "@/lib/data/identity";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="page-heading">
      <h1>Get in touch.</h1>
      <ul className="contact-list">
        {channels.map(({ id, href, handle }) => (
          <li key={id}><a className="work-link" href={href}>{handle} <ExternalArrow /></a></li>
        ))}
      </ul>
    </section>
  );
}
