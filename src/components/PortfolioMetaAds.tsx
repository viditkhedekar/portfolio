import { MetaAdCarousel } from "@/components/MetaAdCarousel";
import { MetaServices } from "@/components/MetaServices";
import "@/app/portfolio-showcase.css";
import "@/app/meta-portfolio.css";

export function PortfolioMetaAds() {
  return (
    <div className="showcase meta-showcase">
      <header className="showcase-heading">
        <h2>Meta Ads</h2>
        <p>I build and test Facebook and Instagram campaigns at Growency.</p>
      </header>

      <MetaAdCarousel />
      <MetaServices />
    </div>
  );
}
