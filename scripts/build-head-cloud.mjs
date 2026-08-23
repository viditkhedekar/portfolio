/**
 * Turn a photogrammetry scan into the point cloud the landing page renders.
 *
 *   node scripts/build-head-cloud.mjs <scan.glb>            # write the asset
 *   node scripts/build-head-cloud.mjs <scan.glb> --inspect  # report only
 *
 * Polycam, Scaniverse and RealityScan all export GLB, so that is what this
 * reads. A raw scan is mostly floor and wall with a person somewhere in it, so
 * the work here is as much about throwing things away as sampling:
 *
 *   1. split the scan into connected components and keep the one that is a
 *      person rather than a room,
 *   2. crop to head, neck and the top of the shoulders,
 *   3. rotate the head upright and facing +z,
 *   4. sample points evenly over the mesh surface, not at its vertices,
 *   5. weight each point using the scan's own texture, so the face reads
 *      brighter than the hair,
 *   6. quantise and write a small binary to public/.
 *
 * Rerun it whenever a better scan turns up.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const TARGET_POINTS = 12000;
const OUTPUT = "public/head-cloud.bin";

/**
 * Calibration for the current scan.
 *
 * These were found by rendering the scan's own texture onto the cloud and
 * stepping through orientations until the face pointed at the camera. Any new
 * scan will land in a different pose and will need them redone, which is why
 * `--inspect` exists.
 */
const CALIBRATION = {
  yaw: 75,
  pitch: 0,
  roll: 0,
  /** Fraction of the subject's height, measured down from the crown, to keep. */
  keep: 0.62,
};

/* ------------------------------------------------------------------- glb */

function readGlb(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("not a glb");

  let offset = 12;
  let json = null;
  let binOffset = 0;
  while (offset < buf.length) {
    const length = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    if (type === 0x4e4f534a) {
      json = JSON.parse(new TextDecoder().decode(buf.subarray(offset + 8, offset + 8 + length)));
    }
    if (type === 0x004e4942) binOffset = offset + 8;
    offset += 8 + length;
  }
  if (!json) throw new Error("glb has no json chunk");

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

  const accessor = (index) => {
    const a = json.accessors[index];
    const bv = json.bufferViews[a.bufferView];
    const n = components[a.type];
    const size = a.componentType === 5121 ? 1 : a.componentType === 5123 ? 2 : 4;
    const start = binOffset + (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const stride = bv.byteStride ?? n * size;

    const out = new Float64Array(a.count * n);
    for (let i = 0; i < a.count; i += 1) {
      for (let c = 0; c < n; c += 1) {
        const at = start + i * stride + c * size;
        out[i * n + c] =
          a.componentType === 5126
            ? view.getFloat32(at, true)
            : a.componentType === 5125
              ? view.getUint32(at, true)
              : a.componentType === 5123
                ? view.getUint16(at, true)
                : view.getUint8(at);
      }
    }
    return out;
  };

  const positions = [];
  const uvs = [];
  const faces = [];
  for (const mesh of json.meshes) {
    for (const prim of mesh.primitives) {
      if ((prim.mode ?? 4) !== 4) continue;
      const base = positions.length / 3;
      const pos = accessor(prim.attributes.POSITION);
      for (let i = 0; i < pos.length; i += 1) positions.push(pos[i]);

      if (prim.attributes.TEXCOORD_0 !== undefined) {
        const uv = accessor(prim.attributes.TEXCOORD_0);
        for (let i = 0; i < uv.length; i += 1) uvs.push(uv[i]);
      } else {
        for (let i = 0; i < pos.length / 3; i += 1) uvs.push(0, 0);
      }

      const idx = accessor(prim.indices);
      for (let i = 0; i < idx.length; i += 1) faces.push(base + idx[i]);
    }
  }

  /* The base colour texture, if the exporter embedded one. Used only to tell
     skin from hair, so a missing texture is not fatal. */
  let texture = null;
  const baseColour = json.materials?.[0]?.pbrMetallicRoughness?.baseColorTexture?.index;
  if (baseColour !== undefined && json.textures?.[baseColour]) {
    const image = json.images[json.textures[baseColour].source];
    const bv = json.bufferViews[image.bufferView];
    const start = binOffset + (bv.byteOffset ?? 0);
    texture = { bytes: buf.subarray(start, start + bv.byteLength), mime: image.mimeType };
  }

  return {
    positions: Float64Array.from(positions),
    uvs: Float64Array.from(uvs),
    faces: Uint32Array.from(faces),
    texture,
  };
}

/* -------------------------------------------------------- component split */

/**
 * Keep the largest connected component that is not room-sized.
 *
 * A scan of a person in a room reconstructs the room too, and the room is
 * usually the component with by far the largest bounding box. Anything under
 * half the scene diagonal is a candidate; of those, the densest wins.
 */
function largestSubject(positions) {
  const count = positions.length / 3;
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < count; i += 1) {
    for (let c = 0; c < 3; c += 1) {
      const v = positions[i * 3 + c];
      if (v < lo[c]) lo[c] = v;
      if (v > hi[c]) hi[c] = v;
    }
  }
  const diagonal = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  const voxel = diagonal / 160;

  const cells = new Map();
  for (let i = 0; i < count; i += 1) {
    const key =
      `${Math.floor((positions[i * 3] - lo[0]) / voxel)},` +
      `${Math.floor((positions[i * 3 + 1] - lo[1]) / voxel)},` +
      `${Math.floor((positions[i * 3 + 2] - lo[2]) / voxel)}`;
    let bucket = cells.get(key);
    if (!bucket) cells.set(key, (bucket = []));
    bucket.push(i);
  }

  const seen = new Set();
  let best = null;
  for (const start of cells.keys()) {
    if (seen.has(start)) continue;
    const stack = [start];
    seen.add(start);
    const members = new Set();
    const clo = [Infinity, Infinity, Infinity];
    const chi = [-Infinity, -Infinity, -Infinity];
    let points = 0;

    while (stack.length) {
      const cur = stack.pop();
      for (const i of cells.get(cur)) {
        members.add(i);
        points += 1;
        for (let c = 0; c < 3; c += 1) {
          const v = positions[i * 3 + c];
          if (v < clo[c]) clo[c] = v;
          if (v > chi[c]) chi[c] = v;
        }
      }
      const [a, b, d] = cur.split(",").map(Number);
      for (let da = -1; da <= 1; da += 1) {
        for (let db = -1; db <= 1; db += 1) {
          for (let dd = -1; dd <= 1; dd += 1) {
            const key = `${a + da},${b + db},${d + dd}`;
            if (cells.has(key) && !seen.has(key)) {
              seen.add(key);
              stack.push(key);
            }
          }
        }
      }
    }

    const size = Math.hypot(chi[0] - clo[0], chi[1] - clo[1], chi[2] - clo[2]);
    if (size > diagonal * 0.5) continue;
    if (!best || points > best.points) best = { members, points, lo: clo, hi: chi, size };
  }

  if (!best) throw new Error("no person-sized component found");
  return best;
}

/* --------------------------------------------------------------- normals */

/** Area-weighted vertex normals, accumulated from the faces that touch each. */
function buildVertexNormals(positions, faces) {
  const normals = new Float64Array(positions.length);
  for (let t = 0; t < faces.length / 3; t += 1) {
    const i = faces[t * 3];
    const j = faces[t * 3 + 1];
    const k = faces[t * 3 + 2];
    const ux = positions[j * 3] - positions[i * 3];
    const uy = positions[j * 3 + 1] - positions[i * 3 + 1];
    const uz = positions[j * 3 + 2] - positions[i * 3 + 2];
    const vx = positions[k * 3] - positions[i * 3];
    const vy = positions[k * 3 + 1] - positions[i * 3 + 1];
    const vz = positions[k * 3 + 2] - positions[i * 3 + 2];
    /* Not normalised, so bigger triangles carry proportionally more weight. */
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    for (const v of [i, j, k]) {
      normals[v * 3] += nx;
      normals[v * 3 + 1] += ny;
      normals[v * 3 + 2] += nz;
    }
  }
  for (let v = 0; v < normals.length / 3; v += 1) {
    const len = Math.hypot(normals[v * 3], normals[v * 3 + 1], normals[v * 3 + 2]) || 1;
    normals[v * 3] /= len;
    normals[v * 3 + 1] /= len;
    normals[v * 3 + 2] /= len;
  }
  return normals;
}

/**
 * Blur the sampled normals against their neighbours.
 *
 * Even vertex normals keep a lot of scan noise, and noise in the normals is
 * what makes a lit point cloud sparkle instead of reading as a surface. A
 * voxel grid gives neighbours cheaply, without building a k-d tree.
 */
function smoothNormals(sampled, count, radius, passes) {
  const cells = new Map();
  const key = (x, y, z) =>
    `${Math.floor(x / radius)},${Math.floor(y / radius)},${Math.floor(z / radius)}`;

  for (let i = 0; i < count; i += 1) {
    const k = key(sampled.x[i], sampled.y[i], sampled.z[i]);
    let bucket = cells.get(k);
    if (!bucket) cells.set(k, (bucket = []));
    bucket.push(i);
  }

  for (let pass = 0; pass < passes; pass += 1) {
    const nx = new Float64Array(count);
    const ny = new Float64Array(count);
    const nz = new Float64Array(count);

    for (let i = 0; i < count; i += 1) {
      const [cx, cy, cz] = key(sampled.x[i], sampled.y[i], sampled.z[i]).split(",").map(Number);
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dz = -1; dz <= 1; dz += 1) {
            const bucket = cells.get(`${cx + dx},${cy + dy},${cz + dz}`);
            if (!bucket) continue;
            for (const j of bucket) {
              /* Only blend with neighbours already facing a similar way, so
                 the nose does not get averaged into the cheek beside it. */
              const dot =
                sampled.nx[i] * sampled.nx[j] +
                sampled.ny[i] * sampled.ny[j] +
                sampled.nz[i] * sampled.nz[j];
              if (dot < 0.35) continue;
              sx += sampled.nx[j];
              sy += sampled.ny[j];
              sz += sampled.nz[j];
            }
          }
        }
      }
      const len = Math.hypot(sx, sy, sz) || 1;
      nx[i] = sx / len;
      ny[i] = sy / len;
      nz[i] = sz / len;
    }

    sampled.nx = Array.from(nx);
    sampled.ny = Array.from(ny);
    sampled.nz = Array.from(nz);
  }
}

/* -------------------------------------------------------------- sampling */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Area-weighted surface sampling, so density does not follow mesh topology. */
function sampleSurface(positions, uvs, faces, keep, count, rand, vertexNormals) {
  const triangles = [];
  let total = 0;

  for (let t = 0; t < faces.length / 3; t += 1) {
    const i = faces[t * 3];
    const j = faces[t * 3 + 1];
    const k = faces[t * 3 + 2];
    if (!keep.has(i) || !keep.has(j) || !keep.has(k)) continue;

    const ux = positions[j * 3] - positions[i * 3];
    const uy = positions[j * 3 + 1] - positions[i * 3 + 1];
    const uz = positions[j * 3 + 2] - positions[i * 3 + 2];
    const vx = positions[k * 3] - positions[i * 3];
    const vy = positions[k * 3 + 1] - positions[i * 3 + 1];
    const vz = positions[k * 3 + 2] - positions[i * 3 + 2];
    const area =
      Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
    if (area <= 0) continue;
    total += area;
    triangles.push({ i, j, k, upto: total });
  }
  if (triangles.length === 0) throw new Error("no triangles survived the crop");

  const out = { x: [], y: [], z: [], u: [], v: [], nx: [], ny: [], nz: [] };
  for (let s = 0; s < count; s += 1) {
    const target = rand() * total;
    let lo = 0;
    let hi = triangles.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (triangles[mid].upto < target) lo = mid + 1;
      else hi = mid;
    }
    const { i, j, k } = triangles[lo];

    let a = rand();
    let b = rand();
    if (a + b > 1) {
      a = 1 - a;
      b = 1 - b;
    }
    const c = 1 - a - b;

    out.x.push(positions[i * 3] * c + positions[j * 3] * a + positions[k * 3] * b);
    out.y.push(positions[i * 3 + 1] * c + positions[j * 3 + 1] * a + positions[k * 3 + 1] * b);
    out.z.push(positions[i * 3 + 2] * c + positions[j * 3 + 2] * a + positions[k * 3 + 2] * b);
    out.u.push(uvs[i * 2] * c + uvs[j * 2] * a + uvs[k * 2] * b);
    out.v.push(uvs[i * 2 + 1] * c + uvs[j * 2 + 1] * a + uvs[k * 2 + 1] * b);

    /* Interpolated vertex normals. Raw face normals off a photogrammetry mesh
       are high-frequency noise and light up like gravel; averaging them at the
       vertices first is what makes the surface read. */
    const nx = vertexNormals[i * 3] * c + vertexNormals[j * 3] * a + vertexNormals[k * 3] * b;
    const ny =
      vertexNormals[i * 3 + 1] * c + vertexNormals[j * 3 + 1] * a + vertexNormals[k * 3 + 1] * b;
    const nz =
      vertexNormals[i * 3 + 2] * c + vertexNormals[j * 3 + 2] * a + vertexNormals[k * 3 + 2] * b;
    const len = Math.hypot(nx, ny, nz) || 1;
    out.nx.push(nx / len);
    out.ny.push(ny / len);
    out.nz.push(nz / len);
  }
  return out;
}

/* --------------------------------------------------------------- texture */

/**
 * Decode the embedded texture to raw RGB using ffmpeg.
 *
 * ffmpeg is a build-time dependency only, and if it is missing the weights
 * fall back to flat, which costs some definition in the face but nothing else.
 */
function decodeTexture(texture, size = 512) {
  if (!texture) return null;
  try {
    const { execFileSync } = require("node:child_process");
    const raw = execFileSync(
      "ffmpeg",
      ["-v", "error", "-i", "pipe:0", "-vf", `scale=${size}:${size}`,
       "-pix_fmt", "rgb24", "-f", "rawvideo", "pipe:1"],
      { input: texture.bytes, maxBuffer: 1 << 28 },
    );
    return { data: raw, size };
  } catch {
    console.warn("  (texture decode failed; weights will be flat)");
    return null;
  }
}

/** Rough skin test. Good enough to separate a face from black hair. */
function isSkin(r, g, b) {
  return r > 70 && r > g + 12 && r - b > 20 && r < 245;
}

/* ------------------------------------------------------------------ main */

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const source = args.find((a) => !a.startsWith("--"));
if (!source) {
  console.error("usage: node scripts/build-head-cloud.mjs <scan.glb> [--inspect]");
  process.exit(1);
}

const { positions, uvs, faces, texture } = readGlb(resolve(source));
console.log(`mesh: ${positions.length / 3} vertices, ${faces.length / 3} triangles`);

const subject = largestSubject(positions);
console.log(
  `subject: ${subject.points} vertices, ` +
    `bbox ${subject.lo.map((v) => v.toFixed(2)).join(",")} -> ` +
    `${subject.hi.map((v) => v.toFixed(2)).join(",")}`,
);

/* Crop to the head, measuring down from the crown so the cut does not depend
   on how much torso the scan happened to catch. */
const crown = subject.hi[1];
const floor = crown - (subject.hi[1] - subject.lo[1]) * CALIBRATION.keep;
const keep = new Set();
for (const i of subject.members) if (positions[i * 3 + 1] >= floor) keep.add(i);
console.log(`head crop: ${keep.size} vertices above y=${floor.toFixed(3)}`);

const rand = mulberry32(0x5eed);
const vertexNormals = buildVertexNormals(positions, faces);
const sampled = sampleSurface(positions, uvs, faces, keep, TARGET_POINTS, rand, vertexNormals);

/* Radius is in scan units: roughly a centimetre on a head this size. */
smoothNormals(sampled, TARGET_POINTS, 0.02, 3);

/* Orient: yaw about the vertical, then pitch, then roll. */
const yaw = (CALIBRATION.yaw * Math.PI) / 180;
const pitch = (CALIBRATION.pitch * Math.PI) / 180;
const roll = (CALIBRATION.roll * Math.PI) / 180;
const [cy, sy] = [Math.cos(yaw), Math.sin(yaw)];
const [cp, sp] = [Math.cos(pitch), Math.sin(pitch)];
const [cr, sr] = [Math.cos(roll), Math.sin(roll)];

/** Apply yaw, then pitch, then roll. Used for positions and normals alike. */
const rotate = (x, y, z) => {
  const x1 = x * cy + z * sy;
  let z1 = -x * sy + z * cy;
  const y1 = y * cp - z1 * sp;
  z1 = y * sp + z1 * cp;
  return [x1 * cr - y1 * sr, x1 * sr + y1 * cr, z1];
};

/* Centre of the raw head, used only to force normals to point outward: mesh
   winding from a scan is not reliably consistent. */
const rawCentre = [0, 1, 2].map((axis) => {
  const key = ["x", "y", "z"][axis];
  const v = [...sampled[key]].sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
});

const oriented = [];
for (let i = 0; i < TARGET_POINTS; i += 1) {
  const [x, y, z] = rotate(sampled.x[i], sampled.y[i], sampled.z[i]);

  let nx = sampled.nx[i];
  let ny = sampled.ny[i];
  let nz = sampled.nz[i];
  const outward =
    nx * (sampled.x[i] - rawCentre[0]) +
    ny * (sampled.y[i] - rawCentre[1]) +
    nz * (sampled.z[i] - rawCentre[2]);
  if (outward < 0) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  const [rnx, rny, rnz] = rotate(nx, ny, nz);

  oriented.push([x, y, z, sampled.u[i], sampled.v[i], rnx, rny, rnz]);
}

/* Centre on the median and scale so the head is 2 units tall. */
const median = (axis) => {
  const v = oriented.map((p) => p[axis]).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
};
const centre = [median(0), median(1), median(2)];
const ys = oriented.map((p) => p[1]).sort((a, b) => a - b);
const height = ys[Math.floor(ys.length * 0.99)] - ys[Math.floor(ys.length * 0.01)];
const scale = 2 / (height || 1);

const decoded = decodeTexture(texture);
let skinCount = 0;

const xyz = new Int16Array(TARGET_POINTS * 3);
const normals = new Int8Array(TARGET_POINTS * 3);
const weights = new Uint8Array(TARGET_POINTS);

for (let i = 0; i < TARGET_POINTS; i += 1) {
  const [x, y, z, u, v, nx, ny, nz] = oriented[i];
  normals[i * 3] = Math.max(-127, Math.min(127, Math.round(nx * 127)));
  normals[i * 3 + 1] = Math.max(-127, Math.min(127, Math.round(ny * 127)));
  normals[i * 3 + 2] = Math.max(-127, Math.min(127, Math.round(nz * 127)));
  const q = (value) => Math.max(-32767, Math.min(32767, Math.round(value * 16000)));
  xyz[i * 3] = q((x - centre[0]) * scale);
  xyz[i * 3 + 1] = q((y - centre[1]) * scale);
  xyz[i * 3 + 2] = q((z - centre[2]) * scale);

  let weight = 0.5;
  if (decoded) {
    const tu = Math.min(decoded.size - 1, Math.max(0, Math.floor((u - Math.floor(u)) * decoded.size)));
    const tv = Math.min(decoded.size - 1, Math.max(0, Math.floor((v - Math.floor(v)) * decoded.size)));
    const o = (tv * decoded.size + tu) * 3;
    const skin = isSkin(decoded.data[o], decoded.data[o + 1], decoded.data[o + 2]);
    if (skin) skinCount += 1;
    /* Face brighter than hair: at this density the features are the likeness. */
    weight = skin ? 1 : 0.42;
  }
  weights[i] = Math.round(weight * 255);
}

console.log(
  `sampled ${TARGET_POINTS} points, ` +
    `${decoded ? `${((skinCount / TARGET_POINTS) * 100).toFixed(0)}% skin` : "flat weights"}`,
);

if (args.includes("--inspect")) {
  const report = (axis, name) => {
    const v = Array.from({ length: TARGET_POINTS }, (_, i) => xyz[i * 3 + axis] / 16000).sort(
      (a, b) => a - b,
    );
    const at = (p) => v[Math.floor(v.length * p)].toFixed(2);
    console.log(`  ${name}: p1=${at(0.01)} p50=${at(0.5)} p99=${at(0.99)}`);
  };
  report(0, "x");
  report(1, "y");
  report(2, "z");
  process.exit(0);
}

/* Header: magic, version, count. Then int16 xyz triples, int8 normal triples,
   then one uint8 weight per point. */
const header = Buffer.alloc(12);
header.write("VKHC", 0, "ascii");
header.writeUInt32LE(2, 4);
header.writeUInt32LE(TARGET_POINTS, 8);

const body = Buffer.concat([
  header,
  Buffer.from(xyz.buffer, xyz.byteOffset, xyz.byteLength),
  Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength),
  Buffer.from(weights.buffer),
]);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, body);
console.log(`wrote ${OUTPUT} (${(body.length / 1024).toFixed(1)} kB, ${TARGET_POINTS} points)`);
