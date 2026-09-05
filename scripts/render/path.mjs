/**
 * The camera flight through the whole building.
 *
 * Hand-placed, and deliberately weaving. A camera running straight down the
 * centre line of a symmetrical hall produces a hundred and sixty metres of
 * one-point perspective and nothing to look at; swinging side to side puts a
 * station in shot at every beat, throws the arches past the lens at an angle,
 * and gives the floor highlights something to slide across.
 *
 * The fractions here are the same ones the landing page uses for its zone
 * ranges, so a panel is on screen exactly while its room is on camera.
 */

const path = [
  /* Entry corridor. Narrow, low and nearly dark, so the hall lands. */
  { at: 0.0, pos: [0, 2.0, 42], look: [0, 2.0, 20] },
  { at: 0.07, pos: [0, 2.0, 22], look: [0, 2.2, 0] },

  /* Through the threshold. The room opens above and to both sides. */
  { at: 0.13, pos: [0, 2.4, 4], look: [0, 2.7, -22] },

  /* Down the hall, past the five stations. */
  { at: 0.19, pos: [-1.8, 2.2, -12], look: [1.6, 2.5, -34] },
  { at: 0.24, pos: [2.7, 2.1, -24], look: [-2.2, 2.6, -46] },
  { at: 0.29, pos: [-2.8, 1.9, -42], look: [2.1, 2.5, -64] },
  { at: 0.34, pos: [2.5, 2.4, -62], look: [-2.0, 2.6, -84] },
  { at: 0.38, pos: [-2.5, 2.0, -86], look: [2.2, 2.4, -108] },
  { at: 0.42, pos: [2.0, 2.3, -108], look: [-1.4, 2.6, -130] },
  { at: 0.46, pos: [0.5, 2.4, -128], look: [0, 2.6, -152] },

  /* Link into the drum. */
  { at: 0.5, pos: [0, 2.2, -162], look: [0, 2.6, -188] },
  { at: 0.53, pos: [0, 2.6, -194], look: [0, 8, -222] },

  /* The observatory. The camera climbs and circles the armillary at a
     distance: close to it, the core is a white disc and nothing else. */
  { at: 0.57, pos: [2.5, 5.5, -207], look: [0, 15, -230] },
  { at: 0.61, pos: [12, 11, -212], look: [-2, 16.5, -234] },
  { at: 0.645, pos: [-8, 13, -246], look: [2, 8, -260] },

  /* Down the far side and into the archive. */
  { at: 0.68, pos: [0, 3.2, -262], look: [0, 2.6, -288] },
  { at: 0.71, pos: [0, 2.4, -284], look: [0, 2.5, -310] },

  /* The vault, weaving so both walls of drawers get seen. */
  { at: 0.75, pos: [1.8, 2.5, -308], look: [-1.8, 2.6, -336] },
  { at: 0.79, pos: [-1.8, 2.4, -336], look: [1.8, 2.6, -364] },
  { at: 0.83, pos: [1.4, 2.5, -364], look: [-1.4, 2.5, -390] },
  { at: 0.86, pos: [0, 2.4, -386], look: [0, 2.4, -414] },

  /* The chamber. Level, slow, and passing the file rather than facing it. */
  { at: 0.9, pos: [1.2, 2.1, -424], look: [-2.2, 2.6, -450] },
  { at: 0.93, pos: [1.6, 2.0, -440], look: [-4.2, 2.8, -456] },
  { at: 0.955, pos: [0.4, 2.2, -464], look: [0, 2.4, -490] },

  /* Out under the open end, and the last move is upward. */
  { at: 0.98, pos: [0, 3.2, -500], look: [0, 7, -528] },
  { at: 1.0, pos: [0, 5.0, -512], look: [0, 15, -548] },
];

/**
 * The air, room by room.
 *
 * Fog does more work than geometry in deciding what a space feels like. The
 * entry corridor is thick so the hall arrives as relief; the drum is thin
 * because the whole point of it is that you can see the far side; the chamber
 * is the heaviest in the building.
 */
const air = [
  { at: 0.0, fog: 0x090c10, density: 0.055, exposure: 0.95 },
  { at: 0.12, fog: 0x090c10, density: 0.04, exposure: 1.0 },
  { at: 0.16, fog: 0x0a0f14, density: 0.0165, exposure: 1.05 },
  { at: 0.46, fog: 0x0a0f14, density: 0.0165, exposure: 1.05 },
  { at: 0.5, fog: 0x0b1016, density: 0.03, exposure: 1.0 },
  { at: 0.56, fog: 0x0b1119, density: 0.0075, exposure: 1.1 },
  { at: 0.65, fog: 0x0b1119, density: 0.0075, exposure: 1.1 },
  { at: 0.7, fog: 0x0d1013, density: 0.026, exposure: 1.0 },
  { at: 0.75, fog: 0x0d1013, density: 0.021, exposure: 1.02 },
  { at: 0.86, fog: 0x0d1013, density: 0.021, exposure: 1.0 },
  { at: 0.9, fog: 0x080b0e, density: 0.042, exposure: 0.92 },
  { at: 0.95, fog: 0x080b0e, density: 0.042, exposure: 0.92 },
  { at: 0.975, fog: 0x030507, density: 0.014, exposure: 1.05 },
  { at: 1.0, fog: 0x020406, density: 0.009, exposure: 1.1 },
];

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function bracket(list, t) {
  let i = 0;
  while (i < list.length - 2 && list[i + 1].at <= t) i++;
  const a = list[i];
  const b = list[i + 1];
  const span = b.at - a.at;
  return { a, b, k: smoothstep(span > 0 ? (t - a.at) / span : 0) };
}

/** Camera position and look target at a fraction of the flight. */
export function samplePath(p, outPos, outLook) {
  const { a, b, k } = bracket(path, Math.min(1, Math.max(0, p)));
  for (let axis = 0; axis < 3; axis++) {
    outPos[axis] = a.pos[axis] + (b.pos[axis] - a.pos[axis]) * k;
    outLook[axis] = a.look[axis] + (b.look[axis] - a.look[axis]) * k;
  }
}

/** Fog colour, density and exposure at a fraction of the flight. */
export function sampleAir(p, out) {
  const { a, b, k } = bracket(air, Math.min(1, Math.max(0, p)));

  const ar = (a.fog >> 16) & 255;
  const ag = (a.fog >> 8) & 255;
  const ab = a.fog & 255;
  const br = (b.fog >> 16) & 255;
  const bg = (b.fog >> 8) & 255;
  const bb = b.fog & 255;

  out.r = (ar + (br - ar) * k) / 255;
  out.g = (ag + (bg - ag) * k) / 255;
  out.b = (ab + (bb - ab) * k) / 255;
  out.density = a.density + (b.density - a.density) * k;
  out.exposure = a.exposure + (b.exposure - a.exposure) * k;
}
