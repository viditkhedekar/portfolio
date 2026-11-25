import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { GrowencyAds } from "@/components/PortfolioMedia";
import { featuredApps, portfolioPath, type PortfolioPanels } from "@/lib/data/portfolio";

export function portfolioWorkPanels(eager = false): PortfolioPanels {
  const homeApps = featuredApps.slice(0, 2);
  return {
    outreach: {
      copy: (
        <div className="preview-copy">
          <p className="project-source">Growency</p>
          <h2>Cold outreach</h2>
          <p>Find the right companies, write to the right people and give them a reason to reply.</p>
          <Link className="work-link" href="/projects/growency#outreach">See the outreach work <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      ),
      media: (
        <div className="outreach-graphic">
          <Mail aria-hidden="true" size={27} strokeWidth={1.5} />
          <ol>
            <li>Research the account</li>
            <li>Write the message</li>
            <li>Follow up</li>
          </ol>
        </div>
      ),
    },
    meta: {
      copy: (
        <div className="preview-copy">
          <p className="project-source">Growency</p>
          <h2>Meta Ads</h2>
          <p>We make creative for Facebook and Instagram, test different angles and use the results to decide what to run next.</p>
          <Link className="work-link" href="/projects/growency#meta-ads">See the ad work <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      ),
      media: <GrowencyAds eager={eager} />,
    },
    apps: {
      copy: (
        <div className="preview-copy">
          <h2>Apps I’ve built</h2>
          <p>Market intelligence and competitor tracking with GrowthKit AI. Exercise form analysis with PhysIQal.</p>
          <Link className="work-link" href="/projects#apps">Browse the apps <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      ),
      media: (
        <div className="app-previews">
          {homeApps.map((project) => {
            const media = project.media?.[1];
            if (!media) return null;
            return (
              <Link href={portfolioPath(project)} key={project.id}>
                <span className="app-image">
                  <Image src={media.src} alt={media.alt} fill sizes="(max-width: 650px) 44vw, (max-width: 1430px) 36vw, 490px" loading={eager ? "eager" : "lazy"} />
                </span>
                <span>{project.name} <ArrowUpRight size={15} aria-hidden="true" /></span>
              </Link>
            );
          })}
        </div>
      ),
    },
  };
}
