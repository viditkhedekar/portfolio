/**
 * VKOS/01 — THE WORLD.
 *
 * The landing page is a single continuous journey through six environments.
 * Scroll does not move a page, it moves a camera, and this file says which
 * slice of the scroll belongs to which place.
 *
 * The camera move itself is no longer here. The world is a flight rendered
 * offline by `scripts/render` and played back frame by frame, so the path,
 * the lighting and the fog all live with the renderer. What survives is the
 * zone model: the HUD, the panels and the destination rail all read it, and
 * the ranges below have to stay in step with the flight `scripts/render/path.mjs`
 * describes or a panel will be on screen while the wrong room is on camera.
 */

import { modules } from "@/lib/data/system";

/* ------------------------------------------------------------------ zones */

export type ZoneId =
  | "origin"
  | "projects"
  | "school"
  | "certifications"
  | "about"
  | "contact";

export interface Zone {
  id: ZoneId;
  /** Rail number, or null for the approach, which is not a module. */
  index: string | null;
  /** Shown in the HUD LOCATION readout. */
  location: string;
  /** Where the module lives, or null when there is nothing to open. */
  href: string | null;
  /**
   * Scroll fraction this zone owns, [start, end).
   *
   * The landing page sizes its sections from these, so a zone's panel is on
   * screen for exactly as long as its environment is. Widening a range gives
   * that environment more scroll without touching anything else.
   *
   * One constraint: a panel is pinned to a full screen, so no zone may work
   * out shorter than the viewport or the browser will stretch it and every
   * range after it will slide. Keep the smallest share above
   * `100vh / --vk-travel`, which is where the travel constant in globals.css
   * comes from.
   */
  range: [number, number];
  /** Centre of the environment on the path, used to place scene objects. */
  z: number;
}

/** Module metadata, keyed so a zone can borrow its rail number and route. */
const M: Record<string, (typeof modules)[number]> = Object.fromEntries(
  modules.map((m) => [m.id, m]),
);

export const zones: Zone[] = [
  {
    id: "origin",
    index: null,
    location: "OUTER FIELD",
    href: null,
    range: [0, 0.13],
    z: 0,
  },
  {
    id: "projects",
    index: M.projects.index,
    location: "PROJECT FACILITY",
    href: M.projects.href,
    range: [0.13, 0.4],
    z: -46,
  },
  {
    id: "school",
    index: M.school.index,
    location: "ACADEMIC OBSERVATORY",
    href: M.school.href,
    range: [0.4, 0.56],
    z: -112,
  },
  {
    id: "certifications",
    index: M.certifications.index,
    location: "CREDENTIAL VAULT",
    href: M.certifications.href,
    range: [0.56, 0.71],
    z: -170,
  },
  {
    id: "about",
    index: M.about.index,
    location: "IDENTITY CHAMBER",
    href: M.about.href,
    range: [0.71, 0.85],
    z: -222,
  },
  {
    id: "contact",
    index: M.contact.index,
    location: "COMMUNICATIONS ARRAY",
    href: M.contact.href,
    range: [0.85, 1],
    z: -272,
  },
];

/** The zone owning a scroll fraction. Never returns undefined. */
export function zoneAt(p: number): Zone {
  for (let i = zones.length - 1; i >= 0; i--) {
    if (p >= zones[i].range[0]) return zones[i];
  }
  return zones[0];
}

/** The zone after this one, or null at the end of the journey. */
export function nextZone(zone: Zone): Zone | null {
  const i = zones.findIndex((z) => z.id === zone.id);
  return i >= 0 && i < zones.length - 1 ? zones[i + 1] : null;
}

/** 0..1 through a single zone, for animation local to that environment. */
export function localProgress(p: number, zone: Zone): number {
  const [a, b] = zone.range;
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
