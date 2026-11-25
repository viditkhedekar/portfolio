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
      <p>I run operations and client delivery at <a href={growencyUrl}>Growency</a>. We help businesses reach new customers through cold outreach and Meta ads.</p>
      <p>I also build software. GrowthKit AI helps teams track competitors and understand their market. PhysIQal Performance analyses exercise form from video.</p>
    </div>
  );

  return (
    <GtmOpening
      panels={{ outreach: <OutreachContent />, meta: <PortfolioMetaAds />, apps: <PortfolioApps /> }}
      about={about}
    />
  );
}
