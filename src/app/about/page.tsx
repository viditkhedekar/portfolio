import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ViditPortrait } from "@/components/ViditPortrait";
import { growencyUrl } from "@/lib/data/portfolio";
import "./about.css";

export const metadata: Metadata = {
  title: "About",
  description: "I’m Vidit Khedekar. I run operations and client delivery at Growency and build software.",
};

export default function AboutPage() {
  return (
    <section className="about-page" aria-labelledby="about-heading">
      <Link href="/" className="small-link about-home"><ArrowLeft size={16} aria-hidden="true" /> Home</Link>
      <div className="about-intro">
        <div className="about-copy">
          <h1 id="about-heading">Hi, I’m Vidit.</h1>
          <p>I run operations and client delivery at <a href={growencyUrl}>Growency</a>. We help businesses reach new customers through cold outreach and Meta ads.</p>
          <p>I also build software. <Link href="/projects/growthkit-ai">GrowthKit AI</Link> helps teams track competitors and understand their market. <Link href="/projects/physiqal-performance">PhysIQal Performance</Link> analyses exercise form from video.</p>
          <div className="about-links">
            <Link href="/projects" className="work-link">See my work <ArrowUpRight size={17} aria-hidden="true" /></Link>
            <Link href="/contact" className="work-link">Get in touch <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="about-portrait">
          <ViditPortrait sizes="(max-width: 650px) 58vw, 35vw" />
        </div>
      </div>
    </section>
  );
}
