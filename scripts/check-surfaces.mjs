/**
 * Checks that HTML lands where the renderer photographed the fitting.
 *
 * This is the one piece of the site that fails invisibly. If the projection
 * or the homography is even slightly wrong, the text slides off its bezel as
 * the camera moves, and a screenshot of a single frame looks fine. So both
 * halves are checked here against something independent of them:
 *
 *   1. the projection, against three's own answer, recorded from the render
 *      harness (`VK.probe`) and pinned below as a fixture
 *   2. the homography, against its own definition: the transform is applied
 *      back to the source rectangle and must reproduce the quad it was built
 *      from
 *
 * It imports the real runtime module rather than a copy, so it cannot drift
 * away from the code it is testing.
 *
 *   node --experimental-strip-types scripts/check-surfaces.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const { sampleCamera, placeSurface, coverFit, quadTransform } = await import(
  path.join(ROOT, "src/lib/surfaces.ts")
);

const manifest = JSON.parse(
  readFileSync(path.join(ROOT, "public/seq/manifest.json"), "utf8"),
);

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("FAIL:", msg);
};

/* ------------------------------------------------- 1. projection vs three */

/*
 * Recorded from the harness with `VK.probe(0.235, ["project-PX-002"])`, in
 * film pixels. Re-record it if the camera path or that station moves.
 */
const FIXTURE = {
  progress: 0.235,
  id: "project-PX-002",
  corners: [1107.93, 333.87, 1421.37, 304.88, 1424.24, 497.72, 1109.1, 492.9],
  /* The probe was taken at this film size; the manifest may since have been
     exported at another, and the projection must be resolution independent
     for the same aspect. */
  width: 1600,
  height: 900,
};

{
  const cam = { x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1 };
  sampleCamera(manifest, FIXTURE.progress, cam);

  const surface = manifest.surfaces.find((s) => s.id === FIXTURE.id);
  if (!surface) {
    fail(`fixture surface ${FIXTURE.id} is not in the manifest`);
  } else {
    /* A viewport exactly the film's shape makes the cover fit the identity,
       so the placement comes back in film pixels and is comparable. */
    const fit = { scale: 1, offsetX: 0, offsetY: 0, viewportW: 0, viewportH: 0 };
    coverFit(manifest, FIXTURE.width, FIXTURE.height, fit);

    const out = { corners: new Array(8).fill(0), facing: 0, size: 0 };
    if (!placeSurface(manifest, cam, surface, fit, out)) {
      fail("fixture surface did not project at all");
    } else {
      const worst = Math.max(
        ...out.corners.map((v, i) => Math.abs(v - FIXTURE.corners[i])),
      );
      if (worst > 2) {
        fail(`projection is ${worst.toFixed(2)}px from three's answer`);
      } else {
        console.log(`projection matches three within ${worst.toFixed(2)}px`);
      }
    }
  }
}

/* ------------------------------------------------ 2. homography round trip */

{
  const cases = [
    [0, 0, 400, 0, 400, 250, 0, 250],
    [120, 60, 900, 20, 940, 500, 90, 470],
    [-200, 100, 640, -40, 700, 600, -260, 520],
    [10, 10, 11, 10, 11, 11, 10, 11],
  ];

  const W = 640;
  const H = 390;
  let worst = 0;

  for (const quad of cases) {
    const css = quadTransform(W, H, quad);
    if (!css) {
      fail(`no transform for quad ${quad.join(",")}`);
      continue;
    }

    const m = css.slice("matrix3d(".length, -1).split(",").map(Number);
    /* Column-major: the homography is rows 1, 2 and 4 of the 4x4. */
    const [a, d, , g, b, e, , h, , , , , c, f] = m;

    const src = [0, 0, W, 0, W, H, 0, H];
    for (let i = 0; i < 4; i++) {
      const x = src[i * 2];
      const y = src[i * 2 + 1];
      const w = g * x + h * y + 1;
      const u = (a * x + b * y + c) / w;
      const v = (d * x + e * y + f) / w;
      worst = Math.max(worst, Math.abs(u - quad[i * 2]), Math.abs(v - quad[i * 2 + 1]));
    }
  }

  if (worst > 1e-6) fail(`homography round trip is off by ${worst}`);
  else console.log(`homography round trips within ${worst.toExponential(1)}`);
}

/* -------------------------------------------------------- 3. sanity checks */

{
  const ids = new Set();
  for (const s of manifest.surfaces) {
    if (ids.has(s.id)) fail(`duplicate surface id ${s.id}`);
    ids.add(s.id);
    if (!(s.w > 0 && s.h > 0)) fail(`surface ${s.id} has no size`);
    const len = Math.hypot(...s.q);
    if (Math.abs(len - 1) > 1e-3) fail(`surface ${s.id} rotation is not a unit quaternion`);
  }
  if (manifest.camera.length !== manifest.frames) {
    fail(`manifest has ${manifest.camera.length} camera samples for ${manifest.frames} frames`);
  }
  console.log(`${manifest.surfaces.length} surfaces, ${manifest.frames} camera samples`);
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall surface checks passed");
