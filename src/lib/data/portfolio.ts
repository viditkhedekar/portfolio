import { getProject, liveProjects } from "./projects";
import { appOutlines } from "./app-outlines";
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
  {
    name: "Kairos Health", detail: "YC F26", href: "https://kairoshealthai.com/",
    logo: { file: "kairos-health", width: 144, height: 125 },
  },
  {
    name: "Posting Machine", href: "https://www.postingmachine.ai/",
    logo: { file: "posting-machine", width: 144, height: 87 },
  },
  {
    name: "Infratex.ai", href: "https://www.infratex.ai/",
    logo: { file: "infratex", width: 440, height: 98, wordmark: true },
  },
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

const appMarks = [
  { id: "PX-001", label: "GrowthKit AI", icon: "growthkit" },
  { id: "PX-002", label: "PhysIQal", icon: "physiqal" },
  { id: "PX-003", label: "Tactix XI", icon: "tactix" },
  { id: "PX-004", label: "BlackOak", icon: "blackoak" },
  { id: "PX-005", label: "Keynesium", icon: "keynesium" },
] as const;

export const appShowcase = appMarks.flatMap(({ id, label, icon }) => {
  const project = liveProjects.find((item) => item.id === id);
  return project ? [{ project, label, icon: "/projects/app-icons/" + icon + ".webp", outline: appOutlines[icon] }] : [];
});
