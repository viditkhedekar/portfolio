"use client";

/**
 * Putting HTML on the walls.
 *
 * The render exports two things: where the camera was for every frame, and
 * where every display surface is in the building. Given a scroll position,
 * this file works out where each of those rectangles has landed on screen and
 * hands back a CSS transform that maps a flat element onto it.
 *
 * The projection deliberately reproduces the renderer's own camera rather
 * than approximating it. Same field of view, same aspect, and then the same
 * cover-fit the canvas uses to place the frame in the window. Anything less
 * exact and the text would drift off its bezel as the camera moved, which is
 * worse than not doing this at all.
 */

export interface Surface {
  id: string;
  kind: string;
  /** Half extents in metres. */
  w: number;
  h: number;
  p: [number, number, number];
  q: [number, number, number, number];
  project?: string;
}

export interface Manifest {
  frames: number;
  width: number;
  height: number;
  /** Vertical field of view in degrees. */
  fov: number;
  /** Per frame: x, y, z, then the camera quaternion. */
  camera: number[][];
  surfaces: Surface[];
}

export const MANIFEST_URL = "/seq/manifest.json";

let manifest: Manifest | null = null;
let pending: Promise<Manifest | null> | null = null;

export function getManifest(): Manifest | null {
  return manifest;
}

export function loadManifest(): Promise<Manifest | null> {
  if (manifest) return Promise.resolve(manifest);
  if (pending) return pending;

  pending = fetch(MANIFEST_URL)
    .then((res) => (res.ok ? res.json() : null))
    .then((data: Manifest | null) => {
      manifest = data;
      return data;
    })
    .catch(() => null);

  return pending;
}

/* ------------------------------------------------------------------ camera */

export interface Camera {
  x: number;
  y: number;
  z: number;
  /** Quaternion. */
  qx: number;
  qy: number;
  qz: number;
  qw: number;
}

/**
 * The camera at a point in the film.
 *
 * Interpolated between the two nearest frames, and the rotation is a proper
 * slerp: lerping a quaternion and normalising it is close enough over one
 * frame's worth of turn, but the camera swings hard through the observatory
 * and the error there is visible as the panels sliding on the wall.
 */
export function sampleCamera(m: Manifest, progress: number, out: Camera): void {
  const exact = Math.min(1, Math.max(0, progress)) * (m.frames - 1);
  const i = Math.min(m.frames - 2, Math.floor(exact));
  const t = m.frames > 1 ? exact - i : 0;

  const a = m.camera[i];
  const b = m.camera[Math.min(m.frames - 1, i + 1)];

  out.x = a[0] + (b[0] - a[0]) * t;
  out.y = a[1] + (b[1] - a[1]) * t;
  out.z = a[2] + (b[2] - a[2]) * t;

  let bx = b[3];
  let by = b[4];
  let bz = b[5];
  let bw = b[6];

  let dot = a[3] * bx + a[4] * by + a[5] * bz + a[6] * bw;
  /* Take the short way round. Without this the camera occasionally spins the
     long way between two frames that are barely different. */
  if (dot < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    dot = -dot;
  }

  let s0 = 1 - t;
  let s1 = t;
  if (dot < 0.9995) {
    const theta = Math.acos(dot);
    const sin = Math.sin(theta);
    s0 = Math.sin((1 - t) * theta) / sin;
    s1 = Math.sin(t * theta) / sin;
  }

  out.qx = a[3] * s0 + bx * s1;
  out.qy = a[4] * s0 + by * s1;
  out.qz = a[5] * s0 + bz * s1;
  out.qw = a[6] * s0 + bw * s1;

  const len = Math.hypot(out.qx, out.qy, out.qz, out.qw) || 1;
  out.qx /= len;
  out.qy /= len;
  out.qz /= len;
  out.qw /= len;
}

/** Rotate a vector by a quaternion. */
function rotate(
  q: [number, number, number, number],
  x: number,
  y: number,
  z: number,
  out: [number, number, number],
): void {
  const [qx, qy, qz, qw] = q;
  /* t = 2 * (q_vec x v), then v + qw * t + q_vec x t. */
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  out[0] = x + qw * tx + (qy * tz - qz * ty);
  out[1] = y + qw * ty + (qz * tx - qx * tz);
  out[2] = z + qw * tz + (qx * ty - qy * tx);
}

/** Rotate a vector by the inverse of a camera's rotation. */
function unrotate(cam: Camera, x: number, y: number, z: number, out: [number, number, number]): void {
  rotate([-cam.qx, -cam.qy, -cam.qz, cam.qw], x, y, z, out);
}

/* -------------------------------------------------------------- projection */

/** Where the frame sits in the window, matching the canvas's cover fit. */
export interface Fit {
  scale: number;
  offsetX: number;
  offsetY: number;
  viewportW: number;
  viewportH: number;
}

export function coverFit(m: Manifest, viewportW: number, viewportH: number, out: Fit): void {
  const scale = Math.max(viewportW / m.width, viewportH / m.height);
  out.scale = scale;
  out.offsetX = (viewportW - m.width * scale) / 2;
  out.offsetY = (viewportH - m.height * scale) / 2;
  out.viewportW = viewportW;
  out.viewportH = viewportH;
}

const LOCAL: Array<[number, number]> = [
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

const world: [number, number, number] = [0, 0, 0];
const view: [number, number, number] = [0, 0, 0];
const normal: [number, number, number] = [0, 0, 0];

/** How far in front of the lens a corner has to be to count. */
const NEAR = 0.35;

export interface Placement {
  /** Screen-space corners, clockwise from top-left of the surface. */
  corners: number[];
  /** How square-on the surface is, 0 edge-on to 1 face-on. */
  facing: number;
  /** Rough on-screen height in pixels, for culling and for fading. */
  size: number;
}

/**
 * Project a surface into screen space.
 *
 * Returns false when the surface is behind the camera, facing away, or well
 * off screen, which is most of them most of the time: the building is six
 * hundred metres long and only a few metres of it is ever in shot.
 */
export function placeSurface(
  m: Manifest,
  cam: Camera,
  surface: Surface,
  fit: Fit,
  out: Placement,
): boolean {
  /* Facing: the surface normal is local +Z, so if it points away from the
     camera this is the back of a screen and there is nothing to show. */
  rotate(surface.q, 0, 0, 1, normal);
  const toCamX = cam.x - surface.p[0];
  const toCamY = cam.y - surface.p[1];
  const toCamZ = cam.z - surface.p[2];
  const toCamLen = Math.hypot(toCamX, toCamY, toCamZ) || 1;
  const facing =
    (normal[0] * toCamX + normal[1] * toCamY + normal[2] * toCamZ) / toCamLen;
  if (facing <= 0.06) return false;
  out.facing = facing;

  const aspect = m.width / m.height;
  const f = 1 / Math.tan((m.fov * Math.PI) / 360);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < 4; i++) {
    const [sx, sy] = LOCAL[i];
    rotate(surface.q, sx * surface.w, sy * surface.h, 0, world);
    unrotate(
      cam,
      world[0] + surface.p[0] - cam.x,
      world[1] + surface.p[1] - cam.y,
      world[2] + surface.p[2] - cam.z,
      view,
    );

    /* three's camera looks down its own -Z, so anything with z above -near is
       level with the lens or behind it and cannot be projected at all. */
    if (view[2] > -NEAR) return false;

    const ndcX = (view[0] / -view[2]) * (f / aspect);
    const ndcY = (view[1] / -view[2]) * f;

    const filmX = (ndcX * 0.5 + 0.5) * m.width;
    const filmY = (1 - (ndcY * 0.5 + 0.5)) * m.height;

    const px = fit.offsetX + filmX * fit.scale;
    const py = fit.offsetY + filmY * fit.scale;

    out.corners[i * 2] = px;
    out.corners[i * 2 + 1] = py;

    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }

  /* Off screen, with a generous margin so nothing pops at the edge. */
  const margin = 400;
  if (
    maxX < -margin ||
    minX > fit.viewportW + margin ||
    maxY < -margin ||
    minY > fit.viewportH + margin
  ) {
    return false;
  }

  out.size = maxY - minY;
  return true;
}

/* -------------------------------------------------------------- homography */

/**
 * The CSS transform that maps a `width` by `height` element onto four points.
 *
 * This is a projective transform, not an affine one: a rectangle on a wall
 * seen from an angle is a general quadrilateral, and no combination of
 * rotate, scale and skew can produce one. Solving the eight unknowns and
 * handing the result to `matrix3d` is the only way to land text on a surface
 * that is turned away from the viewer.
 */
export function quadTransform(
  width: number,
  height: number,
  c: number[],
): string | null {
  /* Source corners, in the element's own box, matching LOCAL's order. */
  const src = [0, 0, width, 0, width, height, 0, height];

  /* Eight equations: two per corner, for the eight unknowns of the
     homography with h33 pinned to 1. */
  const a: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const x = src[i * 2];
    const y = src[i * 2 + 1];
    const u = c[i * 2];
    const v = c[i * 2 + 1];

    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }

  const h = solve(a, b);
  if (!h) return null;

  const [m11, m12, m13, m21, m22, m23, m31, m32] = h;

  /* CSS matrix3d is column-major, and the z row is left as identity because
     the element is flat. */
  return `matrix3d(${m11},${m21},0,${m31},${m12},${m22},0,${m32},0,0,1,0,${m13},${m23},0,1)`;
}

/** Gaussian elimination with partial pivoting. Eight by eight, once a frame. */
function solve(a: number[][], b: number[]): number[] | null {
  const n = b.length;

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) return null;

    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      [b[pivot], b[col]] = [b[col], b[pivot]];
    }

    const diag = a[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / diag;
      if (factor === 0) continue;
      for (let k = col; k < n; k++) a[row][k] -= factor * a[col][k];
      b[row] -= factor * b[col];
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];
    for (let k = row + 1; k < n; k++) sum -= a[row][k] * x[k];
    x[row] = sum / a[row][row];
  }
  return x;
}
