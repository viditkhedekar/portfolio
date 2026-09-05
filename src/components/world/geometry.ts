import * as THREE from "three";

/**
 * Geometry the world is built from.
 *
 * Almost everything out there is lines. Solid surfaces in a dark, foggy space
 * turn into grey mush, whereas an edge stays an edge at any distance and
 * reads as drawn rather than modelled, which is the register the whole site
 * is in. So these helpers return line geometry, and the scene files stay
 * about placement instead of vertex arithmetic.
 */

/** A wire box: the twelve edges of a cuboid, centred on the origin. */
export function boxFrame(w: number, h: number, d: number): THREE.BufferGeometry {
  const box = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(box);
  box.dispose();
  return edges;
}

/** A rectangle outline in the XY plane, centred on the origin. */
export function rectFrame(w: number, h: number): THREE.BufferGeometry {
  const x = w / 2;
  const y = h / 2;
  return segments([
    -x, -y, 0, x, -y, 0,
    x, -y, 0, x, y, 0,
    x, y, 0, -x, y, 0,
    -x, y, 0, -x, -y, 0,
  ]);
}

/** A circle in the XZ plane, as a closed run of segments. */
export function ring(radius: number, divisions = 96): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i < divisions; i++) {
    const a = (i / divisions) * Math.PI * 2;
    const b = ((i + 1) / divisions) * Math.PI * 2;
    pts.push(
      Math.cos(a) * radius, 0, Math.sin(a) * radius,
      Math.cos(b) * radius, 0, Math.sin(b) * radius,
    );
  }
  return segments(pts);
}

/**
 * A floor grid in the XZ plane spanning [x0,x1] by [z0,z1].
 *
 * Steps are given rather than counts so two grids laid end to end line up.
 */
export function grid(
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  step: number,
  y = 0,
): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) {
    pts.push(x, y, z0, x, y, z1);
  }
  for (let z = Math.ceil(z0 / step) * step; z <= z1; z += step) {
    pts.push(x0, y, z, x1, y, z);
  }
  return segments(pts);
}

/** Raw segment pairs into a geometry. */
export function segments(points: number[]): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geo;
}

/** Points into a geometry. */
export function cloud(points: number[]): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geo;
}

/* ------------------------------------------------------------------ noise */

/** Deterministic RNG so the world is identical on every load. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------- readouts */

/**
 * What a project station is showing on its face.
 *
 * Five patterns for five stations, each a plausible instrument rather than a
 * literal one: this is scenery a camera passes at speed, and the real project
 * material is one click away in HTML where it can actually be read.
 */
export type Readout = "motion" | "pitch" | "market" | "model" | "network";

/** The display pattern for a station, drawn in the XY plane. */
export function readout(kind: Readout, w: number, h: number, seed: number): THREE.BufferGeometry {
  const rand = rng(seed);
  const pts: number[] = [];
  const x0 = -w / 2;
  const y0 = -h / 2;

  switch (kind) {
    /* A figure mid-movement, reduced to a stick of joints and limbs. */
    case "motion": {
      const joints: Array<[number, number]> = [
        [0.5, 0.92], [0.5, 0.74], [0.5, 0.46],
        [0.3, 0.68], [0.18, 0.5],
        [0.7, 0.66], [0.84, 0.46],
        [0.4, 0.26], [0.34, 0.06],
        [0.62, 0.26], [0.72, 0.06],
      ];
      const bones = [[0, 1], [1, 2], [1, 3], [3, 4], [1, 5], [5, 6], [2, 7], [7, 8], [2, 9], [9, 10]];
      for (const [a, b] of bones) {
        pts.push(
          x0 + joints[a][0] * w, y0 + joints[a][1] * h, 0,
          x0 + joints[b][0] * w, y0 + joints[b][1] * h, 0,
        );
      }
      /* Trace lines behind the limbs, the way motion capture is drawn. */
      for (let i = 1; i <= 3; i++) {
        const o = i * 0.035;
        pts.push(
          x0 + (0.84 - o) * w, y0 + (0.46 + o * 0.6) * h, 0,
          x0 + (0.7 - o) * w, y0 + (0.66 + o * 0.3) * h, 0,
        );
      }
      break;
    }

    /* A pitch with the lines a tactical model would care about. */
    case "pitch": {
      const inset = 0.08;
      const px = w * (1 - inset * 2);
      const py = h * (1 - inset * 2);
      const ox = x0 + w * inset;
      const oy = y0 + h * inset;
      pts.push(
        ox, oy, 0, ox + px, oy, 0,
        ox + px, oy, 0, ox + px, oy + py, 0,
        ox + px, oy + py, 0, ox, oy + py, 0,
        ox, oy + py, 0, ox, oy, 0,
        ox + px / 2, oy, 0, ox + px / 2, oy + py, 0,
      );
      /* Boxes at each end. */
      for (const side of [0, 1]) {
        const bx = side ? ox + px - px * 0.16 : ox;
        pts.push(
          bx, oy + py * 0.3, 0, bx + px * 0.16, oy + py * 0.3, 0,
          bx + px * 0.16, oy + py * 0.3, 0, bx + px * 0.16, oy + py * 0.7, 0,
          bx + px * 0.16, oy + py * 0.7, 0, bx, oy + py * 0.7, 0,
        );
      }
      /* Passing lanes between notional players. */
      for (let i = 0; i < 7; i++) {
        pts.push(
          ox + rand() * px, oy + rand() * py, 0,
          ox + rand() * px, oy + rand() * py, 0,
        );
      }
      break;
    }

    /* A price series with a moving average through it. */
    case "market": {
      const n = 42;
      let v = 0.45;
      const series: number[] = [];
      for (let i = 0; i < n; i++) {
        v += (rand() - 0.47) * 0.09;
        v = Math.min(0.92, Math.max(0.12, v));
        series.push(v);
      }
      for (let i = 0; i < n - 1; i++) {
        pts.push(
          x0 + (i / (n - 1)) * w, y0 + series[i] * h, 0,
          x0 + ((i + 1) / (n - 1)) * w, y0 + series[i + 1] * h, 0,
        );
      }
      /* Five-point mean, drawn under the series. */
      for (let i = 4; i < n - 1; i++) {
        const mean = (a: number) =>
          (series[a] + series[a - 1] + series[a - 2] + series[a - 3] + series[a - 4]) / 5;
        pts.push(
          x0 + (i / (n - 1)) * w, y0 + mean(i) * h, 0,
          x0 + ((i + 1) / (n - 1)) * w, y0 + mean(i + 1) * h, 0,
        );
      }
      break;
    }

    /* Stacked indicator bars, the shape an economy dashboard takes. */
    case "model": {
      const bars = 11;
      const gap = w / bars;
      for (let i = 0; i < bars; i++) {
        const bh = (0.16 + rand() * 0.72) * h;
        const bx = x0 + i * gap + gap * 0.22;
        const bw = gap * 0.56;
        pts.push(
          bx, y0, 0, bx, y0 + bh, 0,
          bx, y0 + bh, 0, bx + bw, y0 + bh, 0,
          bx + bw, y0 + bh, 0, bx + bw, y0, 0,
        );
      }
      pts.push(x0, y0 + h * 0.5, 0, x0 + w, y0 + h * 0.5, 0);
      break;
    }

    /* Nodes wired to their nearest neighbours. */
    case "network": {
      const n = 14;
      const nodes: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) nodes.push([rand(), rand()]);
      for (let i = 0; i < n; i++) {
        /* Two nearest, which is enough to look organised without becoming a
           solid mesh at this scale. */
        const order = nodes
          .map((p, j) => ({ j, d: Math.hypot(p[0] - nodes[i][0], p[1] - nodes[i][1]) }))
          .filter((e) => e.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        for (const { j } of order) {
          pts.push(
            x0 + nodes[i][0] * w, y0 + nodes[i][1] * h, 0,
            x0 + nodes[j][0] * w, y0 + nodes[j][1] * h, 0,
          );
        }
        /* A tick marking the node itself. */
        const s = w * 0.012;
        pts.push(
          x0 + nodes[i][0] * w - s, y0 + nodes[i][1] * h, 0,
          x0 + nodes[i][0] * w + s, y0 + nodes[i][1] * h, 0,
        );
      }
      break;
    }
  }

  return segments(pts);
}
