import { getProject, liveProjects } from "./projects";
import type { ReactNode } from "react";
import type { Project } from "@/lib/types";

export const growencyUrl = "https://www.trygrowency.com/";

export const portfolioTopics = [
  { id: "outreach", title: "Outreach" },
  { id: "meta", title: "Meta Ads" },
  { id: "apps", title: "Apps" },
] as const;

export type PortfolioTopic = (typeof portfolioTopics)[number]["id"];
export type PortfolioPanels = Record<PortfolioTopic, { copy: ReactNode; media: ReactNode }>;

export function topicArtwork(id: PortfolioTopic) {
  return { felt: "/carousel/" + id + ".webp", glass: "/carousel/" + id + "-glass.webp" };
}

export const growencyClients = [
  { name: "Kairos Health", detail: "YC F26", href: "https://kairoshealthai.com/" },
  { name: "Posting Machine", href: "https://www.postingmachine.ai/" },
  { name: "Infratex.ai", href: "https://www.infratex.ai/" },
];

export const growencyAds = [
  {
    src: "/projects/growency/moonshot-bring-flowers.jpg",
    alt: "A crescent necklace nestled in a bouquet on a dark background",
    label: "Bring flowers",
  },
  {
    src: "/projects/growency/moonshot-for-everything.jpg",
    alt: "Growency jewellery creative for Moonshot Luna",
    label: "For everything after ‘I’ll’",
  },
];

export function portfolioSlug(project: Project) {
  return project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
}

export function portfolioPath(project: Project) {
  return "/projects/" + portfolioSlug(project);
}

export function findPortfolioProject(slug: string) {
  const legacy = getProject(slug);
  if (legacy && !legacy.archived) return legacy;
  return liveProjects.find((project) => portfolioSlug(project) === slug);
}

export const featuredApps = liveProjects.filter(({ id }) =>
  ["PX-001", "PX-002", "PX-003"].includes(id),
);
