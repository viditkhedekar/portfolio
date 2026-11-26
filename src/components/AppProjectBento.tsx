import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { portfolioPath } from "@/lib/data/portfolio";
import type { Project } from "@/lib/types";
import "@/app/portfolio-showcase.css";

const sections = [
  ["objective", "Objective"],
  ["system", "System"],
  ["implementation", "Implementation"],
  ["result", "Result"],
  ["problems", "Problems"],
  ["currentState", "Current state"],
  ["nextIteration", "Next iteration"],
] as const;

export function AppProjectBento({ project, standalone = false }: { project: Project; standalone?: boolean }) {
  const Title = standalone ? "h1" : "h3";
  const Heading = standalone ? "h2" : "h4";
  const media = project.media?.filter(({ src }) => src) ?? [];

  return (
    <div className="app-bento">
      <header className="app-bento-intro">
        <Title className="app-bento-title">{project.name}</Title>
        {project.tagline && <p className="app-bento-tagline">{project.tagline}</p>}
        <p>{project.summary}</p>
        <div className="app-bento-links">
          {project.links?.filter(({ href }) => href).map(({ label, href }) => (
            <a key={href} className="work-link" href={href} aria-label={`Visit ${project.name} at ${label}`}>
              {label} <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
          {!standalone && (
            <Link className="work-link" href={portfolioPath(project)}>Open project <ArrowUpRight size={15} aria-hidden="true" /></Link>
          )}
        </div>
      </header>

      <section className="app-bento-detail app-bento-stack">
        <Heading>Tech stack</Heading>
        <ul className="app-bento-technologies">
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
        <dl className="app-bento-metadata">
          <div><dt>Project ID</dt><dd>{project.id}</dd></div>
          <div><dt>Category</dt><dd>{project.category}</dd></div>
          <div><dt>Status</dt><dd>{project.status}</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
        </dl>
      </section>

      {media.map(({ src, alt, label, ref, kind }) => (
        <figure className="app-bento-image" data-full={media.length === 1 || undefined} key={src}>
          {kind === "video" ? (
            <video className="app-bento-capture" src={src} controls playsInline preload="metadata" aria-label={alt} />
          ) : (
            <a className="app-bento-capture" href={src} target="_blank" rel="noreferrer" aria-label={`Open full-size ${label.toLowerCase()} image`}>
              <Image src={src} alt={alt} fill sizes="(max-width: 700px) 90vw, 44vw" />
            </a>
          )}
          <figcaption><span>{label}</span>{ref && <small>{ref}</small>}</figcaption>
        </figure>
      ))}

      {sections.map(([field, label]) => project[field] && (
        <section className="app-bento-detail" data-full={field === "nextIteration" || undefined} key={field}>
          <Heading>{label}</Heading>
          <p>{project[field]}</p>
        </section>
      ))}
    </div>
  );
}
