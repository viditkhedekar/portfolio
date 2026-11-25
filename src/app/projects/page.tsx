import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClientList, ExternalArrow } from "@/components/PortfolioMedia";
import { featuredApps, portfolioPath } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Selected work",
  description: "Go-to-market work at Growency and software projects by Vidit Khedekar.",
};

export default function ProjectsPage() {
  return (
    <>
      <header className="page-heading">
        <h1>Selected work.</h1>
      </header>
      <section className="agency-index" aria-labelledby="agency-title">
        <div>
          <h2 id="agency-title">Growency</h2>
          <p>Go-to-market work across cold outreach and Meta ads.</p>
          <Link className="work-link" href="/projects/growency">See Growency work <ExternalArrow /></Link>
        </div>
        <ClientList />
      </section>
      <section className="apps-index" id="apps" aria-labelledby="apps-title">
        <h2 id="apps-title">Apps I’ve built</h2>
        <div className="project-grid">
          {featuredApps.map((project) => {
            const media = project.media?.[1] ?? project.media?.[0];
            return (
              <Link key={project.id} href={portfolioPath(project)} className="project-item">
                {media && (
                  <span className="app-image">
                    <Image src={media.src} alt={media.alt} fill sizes="(max-width: 600px) 90vw, (max-width: 850px) 42vw, 30vw" />
                  </span>
                )}
                <span>{project.name} <ExternalArrow /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
