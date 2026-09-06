"use client";

/**
 * The world, as film.
 *
 * The landing page's environment is not drawn in the browser. It is a camera
 * flight through the facility, observatory, vault, chamber and array,
 * rendered offline by `scripts/render` and shipped as a numbered sequence of
 * stills. Scroll picks the frame. That is the whole mechanism.
 *
 * It is worth being clear about why, because a 3D engine is the obvious
 * choice and it is the wrong one here. A frame that has to be drawn sixty
 * times a second can afford thin lines in a black void and not much else. A
 * frame rendered once, slowly, can afford lit surfaces, real shadows, bloom
 * and a hundred and sixty metres of hall. The site wanted the second thing.
 *
 * Loading is deliberately out of order. A sparse pass lands first so the
 * whole journey is scrubbable within a second or two, and the gaps fill in
 * behind it. Loading 0, 1, 2, 3 in order would leave someone who scrolls
 * immediately looking at nothing.
 */

export const FILM = {
  count: 240,
  width: 1440,
  height: 810,
  src: (i: number) => `/seq/${String(i).padStart(4, "0")}.webp`,
};

const frames: Array<HTMLImageElement | null> = new Array(FILM.count).fill(null);
let loaded = 0;
let started = false;

const listeners = new Set<() => void>();

function announce() {
  for (const fn of listeners) fn();
}

/** Subscribe to loading progress. Returns an unsubscribe. */
export function onFilmProgress(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function filmProgress(): number {
  return loaded / FILM.count;
}

/**
 * The order frames are fetched in: every twelfth, then every sixth, and so on
 * down to the gaps. Each pass doubles the temporal resolution of the whole
 * film rather than extending a fully-loaded prefix.
 */
function loadOrder(): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const stride of [12, 6, 3, 1]) {
    for (let i = 0; i < FILM.count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

/** How many images are in flight at once. */
const LANES = 6;

export function startFilm(): void {
  if (started) return;
  started = true;

  const queue = loadOrder();
  let cursor = 0;

  const pump = () => {
    if (cursor >= queue.length) return;
    const index = queue[cursor++];

    const img = new Image();
    img.decoding = "async";
    img.src = FILM.src(index);

    const settle = () => {
      frames[index] = img;
      loaded++;
      announce();
      pump();
    };

    /* decode() keeps the first paint of each frame off the main thread. Where
       it is unsupported or rejects, the load event is still good enough. */
    img.onload = () => {
      if (typeof img.decode === "function") img.decode().then(settle, settle);
      else settle();
    };
    img.onerror = () => {
      loaded++;
      pump();
    };
  };

  for (let i = 0; i < LANES; i++) pump();
}

/** The nearest loaded frame to an index, searching outward from it. */
function nearest(want: number): HTMLImageElement | null {
  if (frames[want]) return frames[want];
  for (let step = 1; step < FILM.count; step++) {
    const before = want - step;
    if (before >= 0 && frames[before]) return frames[before];
    const after = want + step;
    if (after < FILM.count && frames[after]) return frames[after];
  }
  return null;
}

/**
 * The best available frame for a position in the film.
 *
 * Before the sequence has fully arrived this is a slightly stale frame rather
 * than a blank canvas.
 */
export function frameAt(progress: number): HTMLImageElement | null {
  const exact = Math.min(1, Math.max(0, progress)) * (FILM.count - 1);
  return nearest(Math.round(exact));
}

/**
 * The two frames either side of a position, and how far between them it is.
 *
 * Scroll lands between frames far more often than on one, and stepping to the
 * nearest is what makes a hundred and eighty stills read as a hundred and
 * eighty stills. Drawing both and cross-fading by the remainder costs one
 * extra draw and buys back most of the motion a film at this frame count is
 * missing. It is much cheaper than shipping more frames.
 */
export interface Blend {
  from: HTMLImageElement | null;
  to: HTMLImageElement | null;
  /** 0 at `from`, 1 at `to`. */
  mix: number;
}

export function blendAt(progress: number, out: Blend): void {
  const exact = Math.min(1, Math.max(0, progress)) * (FILM.count - 1);
  const lower = Math.floor(exact);
  const upper = Math.min(FILM.count - 1, lower + 1);

  out.from = nearest(lower);
  out.to = upper === lower ? out.from : nearest(upper);
  out.mix = exact - lower;

  /* If the far side has not arrived, the near one is drawn on its own rather
     than cross-faded with a frame from somewhere else in the building. */
  if (out.to === out.from) out.mix = 0;
}
