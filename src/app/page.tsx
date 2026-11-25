import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GtmOpening } from "@/components/GtmOpening";
import { OutreachContent } from "@/components/OutreachContent";
import { portfolioWorkPanels } from "@/components/PortfolioWorkPanels";
import "./gtm-opening.css";

export default function Home() {
  const about = (
    <div className="preview-copy">
      <h2>Hi, I’m Vidit.</h2>
      <p>I run operations and client delivery at Growency and build software, including GrowthKit AI and PhysIQal Performance.</p>
      <Link className="work-link" href="/about">About me <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </div>
  );

  return <GtmOpening panels={portfolioWorkPanels()} outreach={<OutreachContent />} about={about} />;
}
