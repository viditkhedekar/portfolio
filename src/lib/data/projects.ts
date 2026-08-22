import type { Project } from "@/lib/types";

/**
 * VKOS/01 — PROJECT INDEX.
 *
 * TEMPLATE DATA. Every string in [ SQUARE BRACKETS ] is an unfilled slot.
 * Nothing here asserts a real project, result or statistic.
 *
 * To add a project: copy a block, give it the next free PX-0NN id, and fill in
 * the brackets. The index page, archive, telemetry counts, system map and
 * terminal all read from this array — nothing else needs touching.
 */

export const projects: Project[] = [
  {
    id: "PX-001",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ACTIVE",
    year: "2026",
    summary: "[ ONE LINE ON WHAT THIS SYSTEM DOES. ]",
    technologies: ["[ TECH ]", "[ TECH ]", "[ TECH ]", "[ TECH ]"],
    domains: ["ai", "software"],
    objective:
      "[ What this project was designed to do, and the problem that made it worth building. Two or three sentences. ]",
    system:
      "[ The technical architecture. What the major components are and how data moves between them. ]",
    implementation:
      "[ How it was actually built. Order of work, key decisions, anything that was harder than expected. ]",
    result:
      "[ What actually happened when it ran. Be specific and honest — real numbers only, or leave this out. ]",
    problems:
      "[ What did not work. The failure modes, the wrong assumptions, the parts still broken. ]",
    currentState: "[ Where the project stands today. ]",
    nextIteration: "[ What will be improved next, and why that is the priority. ]",
    media: [
      { src: "", label: "SYSTEM OUTPUT", ref: "PX-001 / BUILD 001", alt: "[ Describe the screenshot ]" },
      { src: "", label: "ARCHITECTURE", ref: "PX-001 / TOPOLOGY", alt: "[ Describe the diagram ]" },
    ],
    links: [{ label: "[ REPOSITORY ]", href: "" }],
  },
  {
    id: "PX-002",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "BUILDING",
    year: "2026",
    summary: "[ ONE LINE ON WHAT THIS SYSTEM DOES. ]",
    technologies: ["[ TECH ]", "[ TECH ]", "[ TECH ]"],
    domains: ["finance", "mathematics"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
    media: [{ src: "", label: "SYSTEM OUTPUT", ref: "PX-002 / BUILD 001", alt: "[ Describe the screenshot ]" }],
  },
  {
    id: "PX-003",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "R&D",
    year: "2026",
    summary: "[ ONE LINE ON WHAT THIS SYSTEM DOES. ]",
    technologies: ["[ TECH ]", "[ TECH ]", "[ TECH ]", "[ TECH ]", "[ TECH ]"],
    domains: ["ai", "sports"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
    media: [{ src: "", label: "SIMULATION FRAME", ref: "PX-003 / RUN 001", alt: "[ Describe the frame ]" }],
  },
  {
    id: "PX-004",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ACTIVE",
    year: "2026",
    summary: "[ ONE LINE ON WHAT THIS SYSTEM DOES. ]",
    technologies: ["[ TECH ]", "[ TECH ]"],
    domains: ["software", "systems"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
  },
  {
    id: "PX-005",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "BUILDING",
    year: "2025",
    summary: "[ ONE LINE ON WHAT THIS SYSTEM DOES. ]",
    technologies: ["[ TECH ]", "[ TECH ]", "[ TECH ]"],
    domains: ["mathematics", "software"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
  },
  {
    id: "PX-006",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "R&D",
    year: "2025",
    summary: "[ ONE LINE ON WHAT THIS SYSTEM DOES. ]",
    technologies: ["[ TECH ]", "[ TECH ]", "[ TECH ]"],
    domains: ["finance", "ai"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
  },

  /* ---------- ARCHIVE ---------- */

  {
    id: "PX-007",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "2025",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]", "[ TECH ]"],
    domains: ["finance"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-008",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "2024",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["software"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-009",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "2024",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]", "[ TECH ]"],
    domains: ["ai"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-010",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "2023",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["systems"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    currentState: "Archived. No longer maintained.",
  },
];

export const liveProjects = projects.filter((p) => !p.archived);
export const archivedProjects = projects.filter((p) => p.archived);

export function slugOf(project: Project): string {
  return project.id.toLowerCase();
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.id.toLowerCase() === slug.toLowerCase());
}

/** All counts derive from the array above — nothing is hand-written. */
export const projectStats = {
  total: projects.length,
  active: projects.filter((p) => p.status === "ACTIVE").length,
  building: projects.filter((p) => p.status === "BUILDING").length,
  rd: projects.filter((p) => p.status === "R&D").length,
  archived: archivedProjects.length,
};
