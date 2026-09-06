"use client";

import * as React from "react";
import { zoneAt, type Zone } from "@/lib/world";

/**
 * The single source of scroll for the landing page.
 *
 * Two very different consumers need the same number. The render loop wants it
 * sixty times a second and must not cause a React render to get it; the HUD
 * wants to know only when the journey crosses into a new zone. So the raw
 * value lives in a mutable module object the loop reads directly, and zone
 * changes are published separately through a store React can subscribe to.
 */

export const scrollState = {
  /** Where the document actually is, 0..1. */
  target: 0,
  /** Where the camera is, chasing `target`. This is what the world reads. */
  eased: 0,
  /** Signed rate of change, used for motion that should lean into travel. */
  velocity: 0,
};

/* How quickly the camera catches up with the wheel, expressed per sixtieth of
   a second. Low enough that a flick of the trackpad reads as the camera being
   heavy rather than the page being laggy, high enough that it never feels
   disconnected from the input.

   It is applied against real elapsed time rather than per frame, because a
   fixed per-frame fraction chases twice as fast on a 120Hz display as on a
   60Hz one, and the camera would feel like a different weight on different
   machines. */
const CHASE_PER_FRAME = 0.085;

/* --------------------------------------------------------------- zone store */

let currentZone: Zone = zoneAt(0);
const zoneListeners = new Set<() => void>();

function publishZone(): void {
  const next = zoneAt(scrollState.eased);
  if (next.id === currentZone.id) return;
  currentZone = next;
  for (const fn of zoneListeners) fn();
}

function subscribeZone(fn: () => void): () => void {
  zoneListeners.add(fn);
  return () => zoneListeners.delete(fn);
}

function getZone(): Zone {
  return currentZone;
}

function getZoneServer(): Zone {
  return zoneAt(0);
}

/** The zone the camera is currently in. Re-renders only on a border crossing. */
export function useZone(): Zone {
  return React.useSyncExternalStore(subscribeZone, getZone, getZoneServer);
}

/* -------------------------------------------------------------- the driver */

let mounted = 0;
let raf = 0;
let detach: (() => void) | null = null;

function readDocument(): void {
  const travel = document.documentElement.scrollHeight - window.innerHeight;
  scrollState.target = travel > 0 ? window.scrollY / travel : 0;
}

function start(): void {
  readDocument();
  /* Begin where the document already is. Restoring a mid-page scroll position
     must not fly the camera through the whole world to catch up. */
  scrollState.eased = scrollState.target;
  currentZone = zoneAt(scrollState.eased);

  const onScroll = () => readDocument();
  const onResize = () => readDocument();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  let last = performance.now();

  const tick = (now: number) => {
    /* Clamped, so a tab that was in the background does not resume by
       teleporting the camera across the building in one step. */
    const dt = Math.min(80, now - last) / 1000;
    last = now;

    const before = scrollState.eased;
    const k = 1 - Math.pow(1 - CHASE_PER_FRAME, dt * 60);
    scrollState.eased += (scrollState.target - before) * k;
    scrollState.velocity = scrollState.eased - before;
    publishZone();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  detach = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  };
}

/**
 * Runs the driver for as long as any component asks for it.
 *
 * Reference counted because the world, the HUD and the head all want scroll
 * and none of them owns the others.
 */
export function useScrollDriver(): void {
  React.useEffect(() => {
    if (mounted++ === 0) start();
    return () => {
      if (--mounted === 0 && detach) {
        detach();
        detach = null;
      }
    };
  }, []);
}
