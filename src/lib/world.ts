/**
 * VKOS/01 — THE WORLD.
 *
 * The landing page is a single continuous journey. Scroll does not move a
 * page, it moves a camera along a fixed path through six environments laid
 * out end to end in one 3D space.
 *
 * This file is the only description of that journey. It holds where each
 * environment sits, which slice of the scroll belongs to it, and where the
 * camera is at any point along the way. Everything else (the scene, the HUD,
 * the HTML panels) reads from here, so the world is retimed or reordered by
 * editing this file alone.
 *
 * Units are metres. The path runs along -Z, +Y is up.
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

/* ------------------------------------------------------------------- path */

interface Waypoint {
  /** Scroll fraction this waypoint is pinned to. */
  at: number;
  pos: [number, number, number];
  /** Where the camera looks from here. */
  look: [number, number, number];
}

/**
 * The camera path.
 *
 * Deliberately hand-placed rather than generated: the drama is in where the
 * camera hesitates, drops and rises, and a formula does not do that.
 * Neighbouring waypoints are blended with a smoothstep, which keeps the
 * travel from overshooting the way a spline through the same points would.
 */
const path: Waypoint[] = [
  /* Outer field. Sitting still in the dark, facing the distance. */
  { at: 0.0, pos: [0, 1.3, 16], look: [0, 1.1, -10] },
  { at: 0.09, pos: [0, 1.5, 6], look: [0, 1.2, -24] },

  /* Approach. The facility resolves out of the fog. */
  { at: 0.17, pos: [1.8, 2.3, -10], look: [0, 1.4, -42] },
  { at: 0.24, pos: [0.4, 1.7, -26], look: [0, 1.4, -56] },

  /* Through the hall, weaving between the stations. */
  { at: 0.3, pos: [-1.7, 1.5, -38], look: [1.0, 1.5, -62] },
  { at: 0.35, pos: [1.5, 1.6, -52], look: [-1.0, 1.5, -74] },
  { at: 0.39, pos: [0, 1.8, -62], look: [0, 2.2, -84] },

  /* Climb out of the facility and up into the observatory. */
  { at: 0.45, pos: [0, 3.6, -82], look: [0, 5.0, -104] },
  { at: 0.5, pos: [-1.2, 5.4, -100], look: [0.6, 4.8, -122] },
  { at: 0.55, pos: [1.0, 4.6, -118], look: [0, 3.4, -140] },

  /* Descend into the vault, running along the face of the records wall. */
  { at: 0.61, pos: [2.4, 2.4, -142], look: [-1.4, 2.0, -164] },
  { at: 0.66, pos: [-2.0, 2.0, -160], look: [1.2, 1.9, -182] },
  { at: 0.7, pos: [0, 1.9, -178], look: [0, 1.7, -200] },

  /* The chamber. Everything quietens and the camera settles level. */
  { at: 0.77, pos: [0, 1.5, -204], look: [0, 1.5, -228] },
  { at: 0.85, pos: [0, 1.5, -228], look: [0, 1.6, -252] },

  /* The array. The last move is upward, into the transmission. */
  { at: 0.92, pos: [0, 1.6, -252], look: [0, 2.6, -276] },
  { at: 1.0, pos: [0, 2.2, -266], look: [0, 5.0, -288] },
];

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Camera position and look target at a scroll fraction.
 *
 * Writes into the arrays it is handed so the render loop allocates nothing.
 */
export function samplePath(
  p: number,
  outPos: [number, number, number],
  outLook: [number, number, number],
): void {
  const t = Math.min(1, Math.max(0, p));

  let i = 0;
  while (i < path.length - 2 && path[i + 1].at <= t) i++;

  const a = path[i];
  const b = path[i + 1];
  const span = b.at - a.at;
  const k = smoothstep(span > 0 ? (t - a.at) / span : 0);

  for (let axis = 0; axis < 3; axis++) {
    outPos[axis] = a.pos[axis] + (b.pos[axis] - a.pos[axis]) * k;
    outLook[axis] = a.look[axis] + (b.look[axis] - a.look[axis]) * k;
  }
}

/* ------------------------------------------------------------ atmosphere */

/**
 * Per-zone atmosphere. Fog colour and density are what actually sell one
 * environment as a different place from the next, more than the geometry in
 * it, so they are tuned here rather than inside each scene.
 */
export interface Air {
  fog: [number, number, number];
  /** Exponential fog density. Higher is closer, tighter, more claustrophobic. */
  density: number;
  /** Key light intensity for the environment. */
  key: number;
}

const AIR: Record<ZoneId, Air> = {
  origin: { fog: [0.031, 0.035, 0.039], density: 0.019, key: 0.8 },
  projects: { fog: [0.04, 0.045, 0.05], density: 0.026, key: 1.0 },
  school: { fog: [0.035, 0.04, 0.052], density: 0.012, key: 0.9 },
  certifications: { fog: [0.045, 0.045, 0.043], density: 0.028, key: 0.95 },
  about: { fog: [0.028, 0.03, 0.032], density: 0.034, key: 0.6 },
  contact: { fog: [0.03, 0.038, 0.036], density: 0.02, key: 0.8 },
};

/** Atmosphere at a scroll fraction, blended across the zone boundary. */
export function sampleAir(p: number, out: Air): void {
  const zone = zoneAt(p);
  const next = nextZone(zone);
  const from = AIR[zone.id];
  const to = next ? AIR[next.id] : from;

  /* Cross-fade over the last fifth of a zone so arriving somewhere new is a
     change in the air before it is a change in what you can see. */
  const local = localProgress(p, zone);
  const k = local > 0.8 ? smoothstep((local - 0.8) / 0.2) : 0;

  out.fog[0] = from.fog[0] + (to.fog[0] - from.fog[0]) * k;
  out.fog[1] = from.fog[1] + (to.fog[1] - from.fog[1]) * k;
  out.fog[2] = from.fog[2] + (to.fog[2] - from.fog[2]) * k;
  out.density = from.density + (to.density - from.density) * k;
  out.key = from.key + (to.key - from.key) * k;
}

/** A blank Air, for callers that need somewhere to sample into. */
export function emptyAir(): Air {
  return { fog: [0, 0, 0], density: 0.02, key: 1 };
}

/* --------------------------------------------------------------- palette */

/**
 * The world's colours, as hex integers for three's materials.
 *
 * These are the CSS tokens in globals.css read back out: the interface and
 * the environment have to agree, or the HUD looks pasted onto someone else's
 * render.
 */
export const WORLD_COLOR = {
  /** Structure at rest: trusses, walls, the far grid. */
  structure: 0x3d444b,
  /** Structure the camera is close to, or that should read as nearer. */
  edge: 0x767f89,
  /** The restrained lime. Used sparingly, and never on large surfaces. */
  accent: 0xaee83c,
  /** Suspended particulate. */
  dust: 0x79818b,
} as const;
