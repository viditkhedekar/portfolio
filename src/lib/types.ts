/**
 * VKOS/01 — shared type definitions.
 * Data shapes live here; all content lives in src/lib/data/*.
 */

export type ProjectStatus = "ACTIVE" | "BUILDING" | "R&D" | "ARCHIVED";

export interface ProjectMedia {
  /** Path under /public, or an external URL. */
  src: string;
  /** Rendered as the display caption, e.g. "SYSTEM OUTPUT". */
  label: string;
  /** Rendered as the secondary caption, e.g. "PX-001 / BUILD 042". */
  ref?: string;
  /** Required. Used as the alt text. */
  alt: string;
  kind?: "image" | "video";
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectAssociation {
  id: string;
  name: string;
  context: string;
  links: ProjectLink[];
}

export interface Project {
  /** Stable file ID, e.g. "PX-001". Also the URL slug (lowercased). */
  id: string;
  name: string;
  category: string;
  status: ProjectStatus;
  year: string;
  /** The short hook. Shown in the index and as the lead line on the file page. */
  tagline?: string;
  /** The descriptive paragraph. Shown under the tagline on the file page. */
  summary: string;
  technologies: string[];
  /** Long-form dossier sections. Any may be omitted. */
  objective?: string;
  system?: string;
  implementation?: string;
  result?: string;
  problems?: string;
  currentState?: string;
  nextIteration?: string;
  media?: ProjectMedia[];
  links?: ProjectLink[];
  /** Agency and client organisations connected to this work. */
  associations?: ProjectAssociation[];
  /** Nodes in the system map this project attaches to. */
  domains?: string[];
  /** Archived projects render in /archive instead of the main index. */
  archived?: boolean;
  /** Shown on archived entries only. */
  archiveNote?: string;
}

export interface Certification {
  id: string;
  name: string;
  /** The awarding body. Records are grouped under this on the module page. */
  issuer: string;
  summary?: string;
  /** Path under /public to a PDF or image of the credential. */
  evidence?: string;
  evidenceKind?: "pdf" | "image";
  verifyUrl?: string;
}

/** One provider and every credential taken with them. */
export interface CertificationGroup {
  id: string;
  provider: string;
  /** One line on what the provider is. Optional. */
  note?: string;
  items: Certification[];
}

export interface Subject {
  name: string;
  board?: string;
  note?: string;
}

/** A single line inside a collapsible achievement section. */
export interface AchievementEntry {
  title: string;
  /** Optional second line — context, scale, or what the award was for. */
  detail?: string;
}

/** A labelled run of entries, e.g. "MATHEMATICAL". */
export interface AchievementGroup {
  label?: string;
  entries: AchievementEntry[];
}

/** A whole collapsible block. Rendered closed by default. */
export interface AchievementSection {
  id: string;
  title: string;
  /** Shown on the summary row while the section is closed. */
  summary?: string;
  groups: AchievementGroup[];
}

export interface Channel {
  id: string;
  label: string;
  handle: string;
  href: string;
  primary?: boolean;
}
