import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppProjectBento } from "@/components/AppProjectBento";
import { OutreachContent } from "@/components/OutreachContent";
import { ExternalArrow } from "@/components/PortfolioMedia";
import { PortfolioMetaAds } from "@/components/PortfolioMetaAds";
import { appShowcase, findPortfolioProject, portfolioPath, portfolioSlug } from "@/lib/data/portfolio";
import { liveProjects } from "@/lib/data/projects";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return liveProjects.map((project) => ({ slug: portfolioSlug(project) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = findPortfolioProject((await params).slug);
  if (!project) return { title: "Project not found" };
  return { title: project.name, description: project.summary };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findPortfolioProject(slug);
  if (!project) notFound();
  if (slug !== portfolioSlug(project)) permanentRedirect(portfolioPath(project));

  if (appShowcase.some(({ project: app }) => app.id === project.id)) {
    return (
      <article className="case-study app-bento-case">
        <Link href="/projects" className="small-link"><ArrowLeft size={16} aria-hidden="true" /> Selected work</Link>
        <AppProjectBento project={project} standalone />
      </article>
    );
  }

  return (
    <article className="case-study">
      <header className="page-heading">
        <Link href="/projects" className="small-link"><ArrowLeft size={16} aria-hidden="true" /> Selected work</Link>
        <h1>{project.name}</h1>
        <p>{project.id === "PX-010" ? "I run operations and client delivery at Growency, a go-to-market agency working across cold outreach and Meta ads." : project.summary}</p>
      </header>

      {project.id === "PX-010" ? (
        <>
          <section className="outreach-case" id="outreach" aria-label="Outreach">
            <OutreachContent />
          </section>
          <section className="outreach-case" id="meta-ads" aria-label="Meta Ads">
            <PortfolioMetaAds />
          </section>
        </>
      ) : (
        <>
          {project.media && (
            <div className="case-media">
              {project.media.map((media) => (
                <figure key={media.src}>
                  <div className="app-image"><Image src={media.src} alt={media.alt} fill sizes="(max-width: 700px) 90vw, 46vw" /></div>
                  <figcaption>{media.label.toLowerCase()}</figcaption>
                </figure>
              ))}
            </div>
          )}
          {project.implementation && (
            <section className="case-section">
              <h2>What I built</h2>
              <p>{project.implementation}</p>
              {project.result && <p>{project.result}</p>}
            </section>
          )}
          {project.links?.map(({ href }) => (
            <a key={href} className="work-link" href={href}>Visit {project.name} <ExternalArrow /></a>
          ))}
        </>
      )}
    </article>
  );
}
