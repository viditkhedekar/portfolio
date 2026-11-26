import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import "./booking.css";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a 30-minute call with Vidit Khedekar.",
};

const calendar = "https://calendly.com/vidit-khedekar/30min";
const embed = new URL(calendar);
embed.search = new URLSearchParams({
  embed_type: "Inline",
  hide_event_type_details: "1",
  hide_landing_page_details: "1",
  background_color: "fcfaf5",
  text_color: "191710",
  primary_color: "76531f",
}).toString();

export default function BookPage() {
  return (
    <section className="booking-page">
      <header className="page-heading">
        <h1>Book a call.</h1>
        <p>Pick a time for a 30-minute call with me.</p>
        <a className="work-link" href={calendar} target="_blank" rel="noreferrer">
          Open in Calendly <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>
      <iframe className="booking-calendar" title="Book a 30-minute call with Vidit Khedekar" src={embed.href} />
    </section>
  );
}
