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
  issuer: string;
  issued: string;
  credentialId?: string;
  summary?: string;
  /** Path under /public to a PDF or image of the credential. */
  evidence?: string;
  evidenceKind?: "pdf" | "image";
  verifyUrl?: string;
}

export interface Subject {
  name: string;
  board?: string;
  note?: string;
}

export interface ResearchItem {
  title: string;
  field: string;
  note: string;
  progress?: number;
}

export interface FinanceTopic {
  id: string;
  title: string;
  items: string[];
}

export interface Channel {
  id: string;
  label: string;
  handle: string;
  href: string;
  primary?: boolean;
}

export interface MapNode {
  id: string;
  label: string;
  /** Percentage coordinates within the map viewport. */
  x: number;
  y: number;
  kind: "domain" | "project";
  href?: string;
}

export interface MapEdge {
  from: string;
  to: string;
}
