/**
 * VKOS/01 — system configuration.
 *
 * This is the single file to edit for identity, mission and boot copy.
 * Anything in [ SQUARE BRACKETS ] is an unfilled placeholder.
 */

export const system = {
  code: "VKOS/01",
  fullName: "VIDIT KHEDEKAR OPERATING SYSTEM / 01",
  operator: "VIDIT KHEDEKAR",
  /** Shown in the identity file and used for the uptime readout. */
  age: 15,
  /**
   * Set this to an ISO date (e.g. "2011-03-14") to derive age automatically.
   * Left null so nothing is asserted that hasn't been supplied.
   */
  birthDate: null as string | null,
  role: "STUDENT / BUILDER",
  disciplines: ["MATHEMATICS", "ECONOMICS", "FINANCE", "AI / ML"],
  /** The one that renders as active. */
  state: "BUILDING" as "BUILDING" | "ANALYSING" | "LEARNING" | "EXPERIMENTING",
  states: ["BUILDING", "ANALYSING", "LEARNING", "EXPERIMENTING"] as const,
  /** ISO date of the last meaningful content update. */
  lastUpdate: "2026-08-22",
  location: "LONDON, UNITED KINGDOM",
};

export const modules = [
  {
    index: "01",
    id: "projects",
    name: "PROJECTS",
    href: "/projects",
    description: "SELECTED BUILDS",
    status: "ACTIVE",
    primary: true,
  },
  {
    index: "02",
    id: "school",
    name: "SCHOOL",
    href: "/school",
    description: "ACADEMIC SYSTEM",
    status: "ONLINE",
  },
  {
    index: "03",
    id: "certifications",
    name: "CERTIFICATIONS",
    href: "/certifications",
    description: "CREDENTIAL DATABASE",
    status: "ONLINE",
  },
  {
    index: "04",
    id: "about",
    name: "ABOUT",
    href: "/about",
    description: "IDENTITY FILE",
    status: "ONLINE",
  },
  {
    index: "05",
    id: "contact",
    name: "CONTACT",
    href: "/contact",
    description: "COMMUNICATIONS",
    status: "OPEN",
  },
] as const;

/** The persistent mission panel. Edit here; it renders everywhere. */
export const mission = {
  title: "[ CURRENT PROJECT NAME ]",
  status: "R&D",
  objective: "[ WHAT THIS PROJECT IS TRYING TO DO, IN ONE SENTENCE. ]",
  nextTarget: "[ THE NEXT SPECIFIC THING TO IMPROVE. ]",
  since: "[ MONTH YEAR ]",
  /** Optional: link the panel to the relevant project file. */
  projectId: "PX-001" as string | null,
};

export const boot = {
  checks: [
    { label: "CORE", ms: 120 },
    { label: "DATABASE", ms: 150 },
    { label: "PROJECT INDEX", ms: 190 },
    { label: "IDENTITY MODULE", ms: 130 },
    { label: "NETWORK", ms: 170 },
  ],
};

/** Uptime in years — derived from birthDate when supplied. */
export function uptimeYears(): number {
  if (!system.birthDate) return system.age;
  const born = new Date(system.birthDate);
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) years -= 1;
  return years;
}

/** 22.08.2026 */
export function formatDot(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** 22 AUG 2026 */
export function formatLong(iso: string): string {
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const [y, m, d] = iso.split("-");
  return `${d} ${months[Number(m) - 1]} ${y}`;
}
