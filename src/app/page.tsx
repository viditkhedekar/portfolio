import Link from "next/link";
import { GtmOpening } from "@/components/GtmOpening";
import { OutreachContent } from "@/components/OutreachContent";
import { PortfolioApps } from "@/components/PortfolioApps";
import { PortfolioMetaAds } from "@/components/PortfolioMetaAds";
import { growencyUrl } from "@/lib/data/portfolio";
import "./gtm-opening.css";

export default function Home() {
  const about = (
    <div className="preview-copy">
      <h2>Hi, I’m Vidit.</h2>
      <p>I’m COO at <a href={growencyUrl}>Growency</a>. We help businesses go to market, offering a range of services including cold outreach, Meta ads and SEO/GEO.</p>
      <p>I’ve had multiple clients, including various YC clients and am looking to scale my agency to $100k MRR.</p>
      <p>If you’re looking to work with me or you are just a genuinely ambitious person, <Link href="/book">let’s call</Link>.</p>
    </div>
  );

  return (
    <GtmOpening
      panels={{ outreach: <OutreachContent />, meta: <PortfolioMetaAds />, apps: <PortfolioApps /> }}
      about={about}
    />
  );
}
