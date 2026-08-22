import type { MapEdge, MapNode } from "@/lib/types";
import { projects, slugOf } from "@/lib/data/projects";

/**
 * VKOS/01 — SYSTEM ARCHITECTURE.
 *
 * Domain nodes are hand-placed. Project nodes are derived from
 * `projects[].domains` and fanned out from their parent domain, so adding a
 * project to the index automatically adds it to the map.
 */

export const domains: MapNode[] = [
  { id: "mathematics", label: "MATHEMATICS", x: 50, y: 9, kind: "domain" },
  { id: "finance", label: "FINANCE", x: 20, y: 33, kind: "domain", href: "/finance" },
  { id: "ai", label: "AI", x: 80, y: 33, kind: "domain" },
  { id: "software", label: "SOFTWARE", x: 50, y: 57, kind: "domain", href: "/projects" },
  { id: "sports", label: "SPORTS", x: 24, y: 84, kind: "domain" },
  { id: "systems", label: "SYSTEMS", x: 76, y: 84, kind: "domain" },
];

export const domainEdges: MapEdge[] = [
  { from: "mathematics", to: "finance" },
  { from: "mathematics", to: "ai" },
  { from: "finance", to: "software" },
  { from: "ai", to: "software" },
  { from: "software", to: "sports" },
  { from: "software", to: "systems" },
  { from: "finance", to: "ai" },
];

const CENTER = { x: 50, y: 46 };
const RADIUS = 15;
const SPREAD = 34; // degrees between fanned siblings

function fan(domainId: string, index: number, count: number): { x: number; y: number } {
  const d = domains.find((n) => n.id === domainId) ?? domains[3];
  const base = Math.atan2(d.y - CENTER.y, d.x - CENTER.x) * (180 / Math.PI);
  const offset = (index - (count - 1) / 2) * SPREAD;
  const angle = ((base + offset) * Math.PI) / 180;
  return {
    x: Math.max(6, Math.min(94, d.x + Math.cos(angle) * RADIUS)),
    y: Math.max(6, Math.min(94, d.y + Math.sin(angle) * RADIUS * 0.86)),
  };
}

function buildProjectNodes(): { nodes: MapNode[]; edges: MapEdge[] } {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];
  const byDomain = new Map<string, string[]>();

  for (const p of projects) {
    if (p.archived) continue;
    const primary = p.domains?.[0] ?? "software";
    const list = byDomain.get(primary) ?? [];
    list.push(p.id);
    byDomain.set(primary, list);
  }

  for (const [domainId, ids] of byDomain) {
    ids.forEach((id, i) => {
      const project = projects.find((p) => p.id === id)!;
      const { x, y } = fan(domainId, i, ids.length);
      nodes.push({
        id: project.id,
        label: project.id,
        x,
        y,
        kind: "project",
        href: `/projects/${slugOf(project)}`,
      });
      for (const d of project.domains ?? [domainId]) {
        edges.push({ from: project.id, to: d });
      }
    });
  }

  return { nodes, edges };
}

const built = buildProjectNodes();

export const mapNodes: MapNode[] = [...domains, ...built.nodes];
export const mapEdges: MapEdge[] = [...domainEdges, ...built.edges];

export function neighboursOf(id: string): Set<string> {
  const set = new Set<string>([id]);
  for (const e of mapEdges) {
    if (e.from === id) set.add(e.to);
    if (e.to === id) set.add(e.from);
  }
  return set;
}
