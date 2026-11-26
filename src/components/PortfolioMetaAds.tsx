import { MetaAdCarousel } from "@/components/MetaAdCarousel";
import { MetaServices } from "@/components/MetaServices";
import "@/app/portfolio-showcase.css";
import "@/app/meta-portfolio.css";

export function PortfolioMetaAds() {
  return (
    <div className="showcase meta-showcase">
      <header className="showcase-heading meta-heading">
        <h2>I build and test <span>Facebook and Instagram</span> campaigns at Growency.</h2>
      </header>

      <MetaAdCarousel />
      <MetaServices />
    </div>
  );
}
