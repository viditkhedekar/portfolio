import type { MapEdge, MapNode } from "@/lib/types";
import { liveProjects, slugOf } from "@/lib/data/projects";

/**
 * VKOS/01 — SYSTEM ARCHITECTURE.
 *
 * Layout is deterministic and collision-free by construction: the six domains
 * form a fixed tree down the centre, and project files sit on two vertical
 * rails either side of it. Files are assigned to the rail nearest their primary
 * domain and rebalanced so neither side crowds.
 *
 * Adding a project to the index adds it to the map automatically.
 */

export const domains: MapNode[] = [
  { id: "mathematics", label: "MATHEMATICS", x: 50, y: 11, kind: "domain" },
  { id: "finance", label: "FINANCE", x: 31, y: 33, kind: "domain", href: "/finance" },
  { id: "ai", label: "AI", x: 69, y: 33, kind: "domain" },
  { id: "software", label: "SOFTWARE", x: 50, y: 56, kind: "domain", href: "/projects" },
  { id: "sports", label: "SPORTS", x: 34, y: 80, kind: "domain" },
  { id: "systems", label: "SYSTEMS", x: 66, y: 80, kind: "domain" },
];

const DOMAIN_EDGES: MapEdge[] = [
  { from: "mathematics", to: "finance" },
  { from: "mathematics", to: "ai" },
  { from: "finance", to: "software" },
  { from: "ai", to: "software" },
  { from: "finance", to: "ai" },
  { from: "software", to: "sports" },
  { from: "software", to: "systems" },
];

/** Edges that only appear once one of their endpoints is focused. */
export interface MapLink extends MapEdge {
  secondary?: boolean;
}

const RAIL_LEFT = 9;
const RAIL_RIGHT = 91;
const RAIL_TOP = 14;
const RAIL_BOTTOM = 86;

function domainOf(id: string): MapNode {
  return domains.find((d) => d.id === id) ?? domains[3];
}

function layout(): { nodes: MapNode[]; links: MapLink[] } {
  const entries = liveProjects.map((p) => {
    const primary = domainOf(p.domains?.[0] ?? "software");
    return { project: p, primary };
  });

  const cap = Math.ceil(entries.length / 2);
  const left: typeof entries = [];
  const right: typeof entries = [];

  // Prefer the rail nearest the primary domain, then rebalance.
  for (const e of entries) {
    const wantsLeft = e.primary.x <= 50;
    const target = wantsLeft ? left : right;
    const other = wantsLeft ? right : left;
    (target.length < cap ? target : other).push(e);
  }

  // Ordering by domain height keeps the connector lines from crossing.
  left.sort((a, b) => a.primary.y - b.primary.y);
  right.sort((a, b) => a.primary.y - b.primary.y);

  const nodes: MapNode[] = [];
  const links: MapLink[] = [];

  const place = (list: typeof entries, x: number) => {
    const span = RAIL_BOTTOM - RAIL_TOP;
    list.forEach((e, i) => {
      const y =
        list.length === 1 ? RAIL_TOP + span / 2 : RAIL_TOP + (i / (list.length - 1)) * span;
      nodes.push({
        id: e.project.id,
        label: e.project.id,
        x,
        y,
        kind: "project",
        href: `/projects/${slugOf(e.project)}`,
      });
      links.push({ from: e.project.id, to: e.primary.id });
      for (const d of e.project.domains ?? []) {
        if (d !== e.primary.id) links.push({ from: e.project.id, to: d, secondary: true });
      }
    });
  };

  place(left, RAIL_LEFT);
  place(right, RAIL_RIGHT);

  return { nodes, links };
}

const built = layout();

export const mapNodes: MapNode[] = [...domains, ...built.nodes];
export const mapLinks: MapLink[] = [...DOMAIN_EDGES, ...built.links];

export function neighboursOf(id: string): Set<string> {
  const set = new Set<string>([id]);
  for (const e of mapLinks) {
    if (e.from === id) set.add(e.to);
    if (e.to === id) set.add(e.from);
  }
  return set;
}
