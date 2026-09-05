/**
 * The camera flight through the facility.
 *
 * Hand-placed, and deliberately weaving: a camera that runs straight down the
 * centre line of a symmetrical hall produces a hundred and sixty metres of
 * one-point perspective and nothing to look at. Swinging side to side puts a
 * station in shot at every beat, throws the arches past the lens at an angle,
 * and gives the floor highlights something to slide across.
 */

const path = [
  /* Entering, still outside the first arch. */
  { at: 0.0, pos: [0, 2.5, 7], look: [0, 2.3, -18] },
  { at: 0.1, pos: [-1.6, 2.2, -6], look: [1.4, 2.5, -30] },

  /* Past PX-001, on the left. */
  { at: 0.22, pos: [2.6, 2.1, -20], look: [-2.2, 2.6, -42] },

  /* PX-002, on the right. */
  { at: 0.36, pos: [-2.8, 1.9, -42], look: [2.0, 2.5, -64] },

  /* PX-003, left. */
  { at: 0.5, pos: [2.4, 2.4, -64], look: [-2.0, 2.6, -86] },

  /* PX-004, right. */
  { at: 0.64, pos: [-2.4, 2.0, -88], look: [2.2, 2.4, -110] },

  /* PX-005, left, and the hall starts to open out ahead. */
  { at: 0.78, pos: [2.0, 2.3, -110], look: [-1.4, 2.8, -132] },

  { at: 0.9, pos: [0.6, 2.8, -126], look: [0, 3.2, -150] },
  { at: 1.0, pos: [0, 3.4, -138], look: [0, 3.8, -162] },
];

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/** Camera position and look target at a fraction of the flight. */
export function samplePath(p, outPos, outLook) {
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
