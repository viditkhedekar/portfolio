/**
 * Geometry for the landing-page head.
 *
 * Two sources feed the same structure. `placeholderHead` sculpts a head from
 * maths, which is what renders before the scan arrives and if it ever fails to
 * load; `parseHeadCloud` reads the real scan, prepared offline by
 * `scripts/build-head-cloud.mjs`. The viewer neither knows nor cares which it
 * was handed.
 *
 * Units are normalised: the head sits centred on the origin, roughly 2 units
 * tall, facing +z, with +y up and +x to the subject's left as the viewer sees
 * it. The viewer scales from there.
 */

/**
 * Points are packed flat as x,y,z,weight, with surface normals alongside.
 *
 * The normals are what let the renderer light the cloud. Without them a head
 * reads as a lump of gravel, because a bare dot carries no information about
 * which way the surface under it faces.
 */
export interface PointCloud {
  data: Float32Array;
  normals: Float32Array;
  count: number;
}

/* ------------------------------------------------------------------ noise */

/** Deterministic RNG, so the cloud is identical on every load and never shimmers. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Trilinear value noise in [0,1]. Cheap, and smooth enough for hair curl. */
function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const sz = zf * zf * (3 - 2 * zf);

  const mix = (a: number, b: number, t: number) => a + (b - a) * t;

  const c00 = mix(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), sx);
  const c10 = mix(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), sx);
  const c01 = mix(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), sx);
  const c11 = mix(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), sx);

  return mix(mix(c00, c10, sy), mix(c01, c11, sy), sz);
}

/* --------------------------------------------------------------- sculpting */

/**
 * How far the sculpt leans flattering. Every value is a small nudge: at a few
 * thousand dots there is no skin or texture to speak of, so "more attractive"
 * can only mean clearer structure. Overdoing any of these stops it reading as
 * a particular person.
 */
export interface SculptOptions {
  /** Squarer jaw and a more defined gonial angle. */
  jaw: number;
  /** Cheekbone projection. */
  cheek: number;
  /** Eye socket size. */
  eyes: number;
  /** Brow ridge depth. */
  brow: number;
  /** Pulls the left half toward the mirrored right half. */
  symmetry: number;
  /** Overall hair volume. He has a lot of it, and it carries the silhouette. */
  hair: number;
}

export const DEFAULT_SCULPT: SculptOptions = {
  jaw: 0.62,
  cheek: 0.5,
  eyes: 0.45,
  brow: 0.5,
  symmetry: 0.55,
  hair: 1,
};

/** Smoothstep-gated bump: 1 at `centre`, falling to 0 at `centre ± width`. */
function bump(value: number, centre: number, width: number): number {
  const t = Math.abs(value - centre) / width;
  if (t >= 1) return 0;
  const s = 1 - t;
  return s * s * (3 - 2 * s);
}

/**
 * Map a unit direction onto the head surface.
 *
 * The base is an ellipsoid, and each named feature is a local displacement on
 * top of it. Building it this way means a feature can be dialled without
 * disturbing its neighbours, which matters because the flattering pass only
 * touches four of them.
 */
function surfacePoint(
  dx: number,
  dy: number,
  dz: number,
  o: SculptOptions,
): [number, number, number] {
  /* Semi-axes of the skull. Slightly deeper than wide, as heads are. */
  const a = 0.7;
  const b = 0.98;
  const c = 0.86;

  const r = 1 / Math.sqrt((dx / a) ** 2 + (dy / b) ** 2 + (dz / c) ** 2);
  let x = dx * r;
  const y = dy * r;
  let z = dz * r;

  const front = Math.max(0, dz);

  /* Occiput. The back of a skull sits further out than a plain ellipsoid. */
  if (z < 0) z *= 1 + 0.08 * (-dz);

  /* Jaw. Width tapers below the cheekbones and the chin comes forward. */
  if (y < 0.02) {
    const drop = Math.min(1, -(y - 0.02) / 0.95);
    const taper = 1 - (0.34 + 0.1 * o.jaw) * drop ** 1.5;
    x *= taper;
    /* A squarer jaw holds its width lower before it turns in. */
    x *= 1 + 0.12 * o.jaw * bump(y, -0.42, 0.3);
    z *= 1 - 0.16 * drop ** 2;
  }

  /* Chin. */
  z += front * 0.14 * bump(y, -0.74, 0.26) * (1 - Math.min(1, Math.abs(x) / 0.3));

  /* Face plane. Faces are flatter than the ellipsoid they sit on. */
  if (dz > 0.25 && y < 0.3) z *= 0.955;

  /* Brow ridge. */
  z += front * 0.045 * o.brow * bump(y, 0.17, 0.16) * (1 - Math.min(1, Math.abs(x) / 0.55));

  /* Eye sockets, set either side of the bridge and pressed inward. */
  const socket = 0.052 * (0.7 + o.eyes) * front;
  for (const side of [-1, 1]) {
    const ex = Math.abs(x - side * 0.27) / (0.2 + 0.06 * o.eyes);
    const ey = Math.abs(y - 0.02) / (0.13 + 0.04 * o.eyes);
    const d = Math.sqrt(ex * ex + ey * ey);
    if (d < 1) z -= socket * (1 - d) ** 1.5;
  }

  /* Cheekbones. */
  z +=
    front *
    0.05 *
    o.cheek *
    bump(y, -0.16, 0.26) *
    bump(Math.abs(x), 0.42, 0.24);

  /* Nose. Ramps down the bridge and peaks just above the base. */
  const noseWidth = Math.exp(-((x / 0.115) ** 2));
  if (y < 0.2 && y > -0.5) {
    const t = (0.2 - y) / 0.7;
    const profile = Math.sin(Math.min(1, t) * Math.PI * 0.82) ** 1.4;
    z += front * 0.2 * profile * noseWidth;
  }

  /* Mouth. A shallow step, not a pair of lips. */
  z += front * 0.022 * bump(y, -0.53, 0.13) * (1 - Math.min(1, Math.abs(x) / 0.26));

  /* Temples pull in above the cheekbones. */
  if (y > 0.15) x *= 1 - 0.06 * bump(y, 0.35, 0.35);

  /* Ears, sitting back from the widest point of the skull. */
  for (const side of [-1, 1]) {
    const d = Math.sqrt(
      ((x - side * 0.66) / 0.16) ** 2 + ((y + 0.05) / 0.24) ** 2 + ((z + 0.16) / 0.16) ** 2,
    );
    if (d < 1) x += side * 0.1 * (1 - d);
  }

  return [x, y, z];
}

/** Even directions over a sphere. Fibonacci beats random for surface coverage. */
function fibonacciDirection(i: number, n: number): [number, number, number] {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
}

/* ---------------------------------------------------------------- assembly */

interface Builder {
  push: (x: number, y: number, z: number, w: number) => void;
}

/** The skull and face shell. */
function addSkin(b: Builder, n: number, o: SculptOptions, rand: () => number) {
  for (let i = 0; i < n; i += 1) {
    const [dx, dy, dz] = fibonacciDirection(i, n);

    /* Skip the crown: hair covers it, and dots under hair only muddy things. */
    if (dy > 0.42 - 0.25 * Math.max(0, dz)) continue;

    let [x, y, z] = surfacePoint(dx, dy, dz, o);

    /* Mirror-blend toward the right half. Real faces are asymmetric; this
       keeps a trace of that rather than erasing it. */
    if (x < 0) {
      const [mx, my, mz] = surfacePoint(-dx, dy, dz, o);
      x = x * (1 - o.symmetry) + -mx * o.symmetry;
      y = y * (1 - o.symmetry) + my * o.symmetry;
      z = z * (1 - o.symmetry) + mz * o.symmetry;
    }

    const jitter = 0.006;
    /* Front-facing dots carry the likeness, so they sit brighter. */
    const w = 0.4 + 0.6 * Math.max(0, dz) ** 0.7;
    b.push(
      x + (rand() - 0.5) * jitter,
      y + (rand() - 0.5) * jitter,
      z + (rand() - 0.5) * jitter,
      w,
    );
  }
}

/**
 * Feature lines. A shell alone reads as an egg at this density, so the edges
 * the eye actually uses to recognise a face get their own denser passes.
 */
function addFeatures(b: Builder, n: number, o: SculptOptions, rand: () => number) {
  const curve = (
    count: number,
    weight: number,
    fn: (t: number) => [number, number, number],
  ) => {
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const [dx, dy, dz] = fn(t);
      const [x, y, z] = surfacePoint(dx, dy, dz, o);
      const j = 0.012;
      b.push(
        x + (rand() - 0.5) * j,
        y + (rand() - 0.5) * j,
        z + (rand() - 0.5) * j + 0.012,
        weight,
      );
    }
  };

  const unit = (x: number, y: number, z: number): [number, number, number] => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  };

  const per = Math.max(8, Math.floor(n / 14));

  for (const side of [-1, 1]) {
    /* Brow. */
    curve(per, 1, (t) => unit(side * (0.12 + t * 0.42), 0.2 - 0.05 * t ** 2, 0.9));
    /* Eye opening. */
    curve(per, 1, (t) => {
      const ang = t * Math.PI * 2;
      return unit(
        side * 0.29 + Math.cos(ang) * 0.13,
        0.02 + Math.sin(ang) * 0.06 * (1 + o.eyes),
        0.9,
      );
    });
    /* Jawline, ear down to chin. */
    curve(per * 2, 0.95, (t) => {
      const ang = t * Math.PI * 0.5;
      return unit(side * (0.62 * Math.cos(ang)), -0.1 - 0.72 * Math.sin(ang), 0.35 + 0.5 * t);
    });
  }

  /* Nose ridge and base. */
  curve(per * 2, 1, (t) => unit(0, 0.2 - t * 0.62, 0.85 + t * 0.15));
  curve(per, 0.9, (t) => unit((t - 0.5) * 0.24, -0.42, 0.92));
  /* Mouth. */
  curve(per, 0.9, (t) => unit((t - 0.5) * 0.42, -0.53, 0.9));
}

/** Hair. Thick, curly, and a large part of what makes the silhouette his. */
function addHair(b: Builder, n: number, o: SculptOptions, rand: () => number) {
  let placed = 0;
  let i = 0;
  const budget = n * 6;

  while (placed < n && i < budget) {
    const [dx, dy, dz] = fibonacciDirection(i % 20000, 20000);
    i += 1;

    /* Hairline: high at the temples, lower at the back. */
    const line = 0.3 - 0.34 * dz + 0.12 * Math.abs(dx);
    if (dy < line) continue;

    const [x, y, z] = surfacePoint(dx, dy, dz, o);

    /* Curl noise displaces along the surface normal, in clumps rather than
       evenly, which is what makes it read as curls and not fuzz. */
    const curl = noise3(x * 4.5, y * 4.5, z * 4.5);
    const clump = noise3(x * 1.7 + 11, y * 1.7, z * 1.7);
    const lift = (0.06 + 0.13 * curl * (0.4 + clump)) * o.hair;

    const l = Math.hypot(x, y, z) || 1;
    const scatter = (rand() - 0.5) * 0.05;

    b.push(
      x * (1 + lift / l) + scatter,
      y * (1 + lift / l) + scatter * 0.6,
      z * (1 + lift / l) + scatter,
      0.32 + 0.5 * curl,
    );
    placed += 1;
  }
}

/** Glasses. He wears them in every frame of the reference, so they belong. */
function addGlasses(b: Builder, n: number, o: SculptOptions) {
  const per = Math.max(10, Math.floor(n / 5));
  const push = (x: number, y: number, z: number) => b.push(x, y, z, 1);

  /* Sit the frames just off the face rather than intersecting it. */
  const at = (x: number, y: number) => {
    const l = Math.hypot(x, y, 0.9);
    const [sx, sy, sz] = surfacePoint(x / l, y / l, 0.9 / l, o);
    return [sx, sy, sz + 0.055] as const;
  };

  for (const side of [-1, 1]) {
    /* Lens rim: a rounded rectangle, which is what the reference shows. */
    for (let i = 0; i < per; i += 1) {
      const ang = (i / per) * Math.PI * 2;
      const cs = Math.cos(ang);
      const sn = Math.sin(ang);
      const k = 0.55;
      const rx = Math.sign(cs) * Math.abs(cs) ** k * 0.19;
      const ry = Math.sign(sn) * Math.abs(sn) ** k * 0.115;
      const [x, y, z] = at(side * 0.29 + rx, 0.02 + ry);
      push(x, y, z);
    }
    /* Arm, running back toward the ear. */
    for (let i = 0; i < per; i += 1) {
      const t = i / per;
      const [x, y, z] = at(side * (0.48 + t * 0.2), 0.08);
      push(x * (1 + t * 0.25), y, z - t * 0.75);
    }
  }

  /* Bridge. */
  for (let i = 0; i < Math.floor(per / 2); i += 1) {
    const [x, y, z] = at(((i / (per / 2)) - 0.5) * 0.2, 0.05);
    push(x, y, z);
  }
}

/** Neck and the top of the shoulders, so the head is not floating. */
function addNeck(b: Builder, n: number, rand: () => number) {
  for (let i = 0; i < n; i += 1) {
    const t = rand();
    const ang = rand() * Math.PI * 2;
    const y = -0.95 - t * 0.62;
    /* Widens into the trapezius as it drops. */
    const rx = 0.3 + t * 0.34;
    const rz = 0.26 + t * 0.2;
    b.push(Math.cos(ang) * rx, y, Math.sin(ang) * rz - 0.06, 0.3 * (1 - t * 0.6));
  }
}

/**
 * Build the stand-in head.
 *
 * This is a sculpt, not a scan. It carries his proportions, hair volume and
 * glasses, so it reads as him at a glance, but it is not his geometry and is
 * meant to be replaced by `parsePly` output.
 */
export function placeholderHead(
  total = 4600,
  sculpt: Partial<SculptOptions> = {},
): PointCloud {
  const o = { ...DEFAULT_SCULPT, ...sculpt };
  const rand = mulberry32(0x564b0501);

  const data = new Float32Array(total * 4 * 2);
  const normals = new Float32Array(total * 3 * 2);
  let count = 0;
  const b: Builder = {
    push: (x, y, z, w) => {
      if (count * 4 + 3 >= data.length) return;
      data[count * 4] = x;
      data[count * 4 + 1] = y;
      data[count * 4 + 2] = z;
      data[count * 4 + 3] = w;
      /* The sculpt is close enough to convex that the outward direction from
         the origin is a serviceable normal. A real scan carries proper ones. */
      const len = Math.hypot(x, y, z) || 1;
      normals[count * 3] = x / len;
      normals[count * 3 + 1] = y / len;
      normals[count * 3 + 2] = z / len;
      count += 1;
    },
  };

  addSkin(b, Math.floor(total * 0.46), o, rand);
  addHair(b, Math.floor(total * 0.3), o, rand);
  addFeatures(b, Math.floor(total * 0.12), o, rand);
  addGlasses(b, Math.floor(total * 0.05), o);
  addNeck(b, Math.floor(total * 0.07), rand);

  return { data: data.slice(0, count * 4), normals: normals.slice(0, count * 3), count };
}

/* -------------------------------------------------------------- vkhc input */

/**
 * Read the binary written by `scripts/build-head-cloud.mjs`.
 *
 * Layout: "VKHC", uint32 version, uint32 count, then int16 xyz triples at
 * 1/16000 of a unit, then int8 normal triples, then one uint8 weight per
 * point. Positions are already centred, scaled and oriented by the build
 * script, so nothing here needs to know anything about scans.
 */
export function parseHeadCloud(buffer: ArrayBuffer): PointCloud {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (magic !== "VKHC") throw new Error("head cloud: bad magic");

  const version = view.getUint32(4, true);
  if (version !== 2) throw new Error(`head cloud: unsupported version ${version}`);

  const count = view.getUint32(8, true);
  const normalsAt = 12 + count * 6;
  const weightsAt = normalsAt + count * 3;
  if (buffer.byteLength < weightsAt + count) throw new Error("head cloud: truncated");

  const data = new Float32Array(count * 4);
  const normals = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const at = 12 + i * 6;
    data[i * 4] = view.getInt16(at, true) / 16000;
    data[i * 4 + 1] = view.getInt16(at + 2, true) / 16000;
    data[i * 4 + 2] = view.getInt16(at + 4, true) / 16000;
    data[i * 4 + 3] = view.getUint8(weightsAt + i) / 255;

    normals[i * 3] = view.getInt8(normalsAt + i * 3) / 127;
    normals[i * 3 + 1] = view.getInt8(normalsAt + i * 3 + 1) / 127;
    normals[i * 3 + 2] = view.getInt8(normalsAt + i * 3 + 2) / 127;
  }

  return { data, normals, count };
}
