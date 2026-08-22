import type { Project } from "@/lib/types";

/**
 * VKOS/01 — PROJECT INDEX.
 *
 * PX-001..PX-005 are real. Their names, taglines, descriptions, stacks and
 * links are Vidit's own; everything still in [ SQUARE BRACKETS ] is an unfilled
 * slot and renders dimmed on screen until it is written.
 *
 * Do not invent results, metrics or dates for these. The dossier sections are
 * deliberately empty.
 *
 * PX-006..PX-009 are archive placeholders — replace or delete them.
 *
 * To add a project: copy a block, give it the next free PX-0NN id, and fill in
 * the brackets. The index page, archive, telemetry counts, system map and
 * terminal all read from this array — nothing else needs touching.
 *
 * Valid statuses: ACTIVE | BUILDING | R&D | ARCHIVED.
 */

export const projects: Project[] = [
  {
    id: "PX-001",
    name: "GrowthKit AI",
    tagline: "Turn an idea into something people actually want.",
    category: "AI / FOUNDER TOOLS",
    status: "ACTIVE",
    year: "[ YEAR ]",
    summary:
      "GrowthKit AI helps founders work through ideas, understand their market and build a clearer path to growth, with AI woven into the process.",
    technologies: ["[ TECH ]", "[ TECH ]"],
    domains: ["ai", "software"],
    objective: "[ What this project was designed to do, and the problem that made it worth building. ]",
    system: "[ The technical architecture. What the major components are and how data moves between them. ]",
    implementation: "[ How it was actually built. Order of work, key decisions, anything harder than expected. ]",
    result: "[ What actually happened when it ran. Real numbers only, or leave this out. ]",
    problems: "[ What did not work. The failure modes, the wrong assumptions, the parts still broken. ]",
    currentState: "[ Where the project stands today. ]",
    nextIteration: "[ What will be improved next, and why that is the priority. ]",
    media: [
      { src: "", label: "SYSTEM OUTPUT", ref: "PX-001 / BUILD 001", alt: "[ Describe the screenshot ]" },
      { src: "", label: "ARCHITECTURE", ref: "PX-001 / TOPOLOGY", alt: "[ Describe the diagram ]" },
    ],
    links: [{ label: "GROWTHKITAI.COM", href: "https://growthkitai.com" }],
  },
  {
    id: "PX-002",
    name: "PhysIQal Performance",
    tagline: "See how you actually move.",
    category: "COMPUTER VISION / SPORTS",
    status: "ACTIVE",
    year: "[ YEAR ]",
    summary:
      "Physiqal uses computer vision to analyse exercise form, track reps and spot subtle technique issues. It turns a normal workout video into detailed feedback on how you move and where you can improve.",
    technologies: ["Python", "TypeScript"],
    domains: ["sports", "ai"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
    media: [
      { src: "", label: "SYSTEM OUTPUT", ref: "PX-002 / POSE TRACK", alt: "[ Describe the screenshot ]" },
      { src: "", label: "PIPELINE", ref: "PX-002 / TOPOLOGY", alt: "[ Describe the diagram ]" },
    ],
    links: [
      { label: "PHYSIQAL-PERFORMANCE.VERCEL.APP", href: "https://physiqal-performance.vercel.app/" },
    ],
  },
  {
    id: "PX-003",
    name: "Tactix XI",
    tagline: "Football management built around how the game actually works.",
    category: "SIMULATION / FOOTBALL",
    status: "ACTIVE",
    year: "[ YEAR ]",
    summary:
      "Tactix XI is a football simulation focused on tactics, player movement and decision-making. The aim is to make matches feel less like animations and more like 22 players constantly reacting to the game around them.",
    technologies: ["TypeScript"],
    domains: ["sports", "software"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
    media: [
      { src: "", label: "SIMULATION FRAME", ref: "PX-003 / MATCH RUN", alt: "[ Describe the frame ]" },
      { src: "", label: "MOVEMENT MODEL", ref: "PX-003 / TOPOLOGY", alt: "[ Describe the diagram ]" },
    ],
    links: [{ label: "TACTIQ-XI.VERCEL.APP", href: "https://tactiq-xi.vercel.app/" }],
  },
  {
    id: "PX-004",
    name: "BlackOak",
    tagline: "Build, test and trade your ideas.",
    category: "QUANTITATIVE FINANCE / TRADING",
    status: "ACTIVE",
    year: "[ YEAR ]",
    summary:
      "BlackOak is a trading platform built around quantitative strategies. It gives you a place to develop strategies, backtest them against historical markets and paper-trade them before risking real capital.",
    technologies: ["Python", "TypeScript"],
    domains: ["finance", "mathematics"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
    media: [
      { src: "", label: "SYSTEM OUTPUT", ref: "PX-004 / BACKTEST", alt: "[ Describe the screenshot ]" },
      { src: "", label: "ARCHITECTURE", ref: "PX-004 / TOPOLOGY", alt: "[ Describe the diagram ]" },
    ],
    links: [{ label: "BLACK-OAK-BLACK.VERCEL.APP", href: "https://black-oak-black.vercel.app/" }],
  },
  {
    id: "PX-005",
    name: "Keynesium",
    tagline: "Change the economy. See what happens.",
    category: "SIMULATION / MACROECONOMICS",
    status: "ACTIVE",
    year: "[ YEAR ]",
    summary:
      "Keynesium is a macroeconomic sandbox that lets you experiment with an economy and watch the consequences unfold. Change interest rates, taxes, government spending and other economic variables, then see how inflation, growth, unemployment and markets respond.",
    technologies: ["TypeScript", "JavaScript"],
    domains: ["mathematics", "finance"],
    objective: "[ What this project was designed to do. ]",
    system: "[ The technical architecture. ]",
    implementation: "[ How it was built. ]",
    result: "[ What actually happened. ]",
    problems: "[ What did not work. ]",
    currentState: "[ Where the project is now. ]",
    nextIteration: "[ What will be improved next. ]",
    media: [
      { src: "", label: "SYSTEM OUTPUT", ref: "PX-005 / SIM RUN", alt: "[ Describe the screenshot ]" },
      { src: "", label: "MODEL", ref: "PX-005 / TOPOLOGY", alt: "[ Describe the diagram ]" },
    ],
    links: [{ label: "NEW-KEYNESIUM.VERCEL.APP", href: "https://new-keynesium.vercel.app/" }],
  },

  /* ---------- ARCHIVE ----------
     Placeholder slots for earlier work. Replace or delete. */

  {
    id: "PX-006",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["finance"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-007",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
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
    id: "PX-008",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["ai"],
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
    year: "[ YEAR ]",
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
  /** Everything on file, archive included. */
  total: projects.length,
  /** Live entries — what the index and the FILES readouts count. */
  indexed: liveProjects.length,
  active: projects.filter((p) => p.status === "ACTIVE").length,
  building: projects.filter((p) => p.status === "BUILDING").length,
  rd: projects.filter((p) => p.status === "R&D").length,
  archived: archivedProjects.length,
};

/** Statuses actually present in the live index, for the explorer filters. */
export const liveStatuses = [...new Set(liveProjects.map((p) => p.status))];
