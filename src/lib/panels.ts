"use client";

import { SURFACE_SCALE, sampleCamera, type Camera, type Manifest } from "@/lib/surfaces";
import { certifications } from "@/lib/data/certifications";

/**
 * The information that travels with you.
 *
 * Rather than hanging on the walls, every panel is planted on the path at a
 * point in the flight. It appears ahead of you, square-on and legible, grows
 * as you approach, and then swings out to one side and passes as you walk
 * through where it was standing.
 *
 * Two things follow from panels facing the camera. There is no perspective
 * skew, so the type stays perfectly crisp at any distance, and placement is
 * only a translate and a scale rather than a projective transform. The
 * building's own consoles and wall panels stay in the render as furniture:
 * lit bezels with dark faces, equipment rather than signage.
 */

export type PanelKind = "card" | "wall" | "plate";

export interface Panel {
  id: string;
  kind: PanelKind;
  /** Where on the flight this is planted, 0 to 1. */
  at: number;
  /** Which way it parts. */
  side: -1 | 1;
  /** Width on screen, in metres, before perspective. */
  width: number;
}

export interface PanelPlacement {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** Distance ahead, in metres. Used for painter ordering. */
  depth: number;
}

/* How the approach reads, in metres ahead of the camera. */
const REACH: Record<PanelKind, number> = {
  /* Big cards announce themselves early. */
  card: 34,
  wall: 34,
  /* Plates are small and would be an unreadable smudge from any distance. */
  plate: 20,
};

/** Below this the panel is level with you and gone. */
const PASSED = 1.4;

/** Where it starts moving out of the way. */
const PART_FROM = 10;

/** The lane it sits in from the start, and how far out it finally swings. */
const LANE = 1.9;
const PART_TO = 7.5;

/** Lifted slightly above the camera's eye line, so it clears the floor. */
const RISE = 0.55;

/* -------------------------------------------------------------- the list */

/**
 * Every panel in the flight, in the order you meet them.
 *
 * The fractions are points on the camera path, so a panel is planted where
 * the camera will be at that moment and you walk straight into it. They sit
 * inside their zone's range (see `src/lib/world.ts`) so a panel and the room
 * it is about are on screen together.
 */
export const panels: Panel[] = [
  /* 01 — the five project files, one per station. */
  { id: "project-PX-001", kind: "card", at: 0.185, side: -1, width: 5.8 },
  { id: "project-PX-002", kind: "card", at: 0.24, side: 1, width: 5.8 },
  { id: "project-PX-003", kind: "card", at: 0.295, side: -1, width: 5.8 },
  { id: "project-PX-004", kind: "card", at: 0.345, side: 1, width: 5.8 },
  { id: "project-PX-005", kind: "card", at: 0.395, side: -1, width: 5.8 },

  /* 02 — the academic record. */
  { id: "school-summary", kind: "wall", at: 0.445, side: 1, width: 6.4 },
  { id: "school-subjects", kind: "wall", at: 0.495, side: -1, width: 7.2 },
  { id: "school-qualification", kind: "wall", at: 0.545, side: 1, width: 5.8 },

  /* 03 — the vault index, then the records themselves as a run of plates. */
  { id: "vault-index", kind: "wall", at: 0.583, side: -1, width: 6.2 },
  /* One plate per record actually held. Counted, never written down: the
     first version of this said thirteen when there were twelve, and the
     thirteenth panel was an empty box nobody could see was empty. */
  ...certifications.map((_, i): Panel => ({
    id: `credential-${i}`,
    kind: "plate",
    at: 0.605 + (i / Math.max(1, certifications.length - 1)) * 0.1,
    side: i % 2 === 0 ? 1 : -1,
    width: 4.2,
  })),

  /* 04 — the identity file. */
  { id: "about-identity", kind: "wall", at: 0.755, side: -1, width: 6.2 },
  { id: "about-statement", kind: "wall", at: 0.815, side: 1, width: 6.8 },

  /* 05 — communications. */
  { id: "comms-index", kind: "wall", at: 0.885, side: -1, width: 6.4 },
  { id: "channel-0", kind: "card", at: 0.925, side: 1, width: 5.2 },
  { id: "channel-1", kind: "card", at: 0.952, side: -1, width: 5.2 },
  { id: "channel-2", kind: "card", at: 0.978, side: 1, width: 5.2 },
];

/* ------------------------------------------------------------- placement */

function easeIn(t: number): number {
  return t * t;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

const anchor: Camera = { x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1 };

/**
 * Where a panel is on screen right now.
 *
 * Works in the camera's own space throughout: the anchor is brought into
 * view space, the sideways drift is applied along view X (which is always
 * screen-right, whatever the camera is doing), and only then is it projected.
 * Going back out to world space to add the offset would need the camera's
 * right vector and would drift whenever the camera rolled.
 */
export function placePanel(
  m: Manifest,
  cam: Camera,
  panel: Panel,
  drawnHeight: number,
  centreX: number,
  centreY: number,
  out: PanelPlacement,
): boolean {
  sampleCamera(m, panel.at, anchor);

  /* Into view space. */
  const dx = anchor.x - cam.x;
  const dy = anchor.y - cam.y + RISE;
  const dz = anchor.z - cam.z;

  const qx = -cam.qx;
  const qy = -cam.qy;
  const qz = -cam.qz;
  const qw = cam.qw;
  const tx = 2 * (qy * dz - qz * dy);
  const ty = 2 * (qz * dx - qx * dz);
  const tz = 2 * (qx * dy - qy * dx);
  let vx = dx + qw * tx + (qy * tz - qz * ty);
  const vy = dy + qw * ty + (qz * tx - qx * tz);
  const vz = dz + qw * tz + (qx * ty - qy * tx);

  const depth = -vz;
  const reach = REACH[panel.kind];
  if (depth <= PASSED || depth > reach) return false;

  /* The parting. Nothing until it is close, then an accelerating swing out
     of the way, so it reads as being walked past rather than dodging. */
  const closeness = Math.min(1, Math.max(0, (PART_FROM - depth) / (PART_FROM - PASSED)));
  vx += panel.side * (LANE + (PART_TO - LANE) * easeIn(closeness));

  const aspect = m.width / m.height;
  const f = 1 / Math.tan((m.fov * Math.PI) / 360);

  const ndcX = (vx / depth) * (f / aspect);
  const ndcY = (vy / depth) * f;

  const half = drawnHeight / 2;
  out.x = centreX + ndcX * half * aspect;
  out.y = centreY - ndcY * half;

  /* Perspective scale: how many screen pixels one metre covers at this
     depth, against the pixels per metre the panel was authored at. */
  out.scale = ((f / depth) * half) / SURFACE_SCALE;
  out.depth = depth;

  /* In from the far limit, out as it goes by. Both are eased so nothing ever
     appears or vanishes on a hard edge. */
  const arriving = smoothstep(Math.min(1, (reach - depth) / (reach * 0.32)));
  const leaving = 1 - smoothstep(Math.min(1, Math.max(0, closeness - 0.55) / 0.45));
  out.opacity = arriving * leaving;

  return out.opacity > 0.01;
}
