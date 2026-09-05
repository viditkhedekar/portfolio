/**
 * 03 — CREDENTIAL VAULT.
 *
 * A hundred metres of corridor walled floor to ceiling with record drawers.
 * Almost all of them are shut and dark; thirteen are lit, which is exactly
 * how many certifications are on file. The wall is therefore a true picture
 * of the archive rather than a decorative texture, and the empty drawers are
 * not padding, they are room.
 *
 * The drawers are instanced. There are well over a thousand and they are the
 * same box, so drawing them one at a time would be a waste of a scene that
 * has better things to spend on.
 */

import { addDust } from "./kit.mjs";

export const VAULT = { from: -300, to: -404, width: 11, height: 8 };

/** Real record count, mirrored from src/lib/data/certifications.ts. */
const FILLED = 13;

const ROWS = 7;
const ROW_H = 0.95;
const COL_W = 1.15;
const BASE_Y = 0.55;

export function buildVault(THREE, scene, kit, pool) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  scene.add(group);

  const { from, to, width, height } = VAULT;
  const length = from - to;
  const midZ = (from + to) / 2;
  const columns = Math.floor(length / COL_W);

  /* ---------------------------------------------------------------- shell */

  const wall = mat.wall.clone();
  wall.map = kit.panel.clone();
  wall.map.repeat.set(length / 7, height / 4);

  const deck = mat.floor.clone();
  deck.map = kit.floorMap.clone();
  deck.map.repeat.set(width / 4, length / 4);
  deck.roughnessMap = kit.floorRough.clone();
  deck.roughnessMap.repeat.copy(deck.map.repeat);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, length), deck);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = midZ;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, length), mat.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, height, midZ);
  group.add(ceiling);

  for (const side of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wall);
    face.rotation.y = (side * -Math.PI) / 2;
    face.position.set((side * width) / 2, height / 2, midZ);
    group.add(face);
  }

  /* --------------------------------------------------------------- drawers */

  const drawerGeo = new THREE.BoxGeometry(0.34, ROW_H - 0.12, COL_W - 0.1);
  const total = columns * ROWS * 2;

  const shut = new THREE.InstancedMesh(drawerGeo, mat.dark, total);
  shut.castShadow = true;
  shut.receiveShadow = true;

  const handleGeo = new THREE.BoxGeometry(0.12, 0.06, COL_W * 0.45);
  const handles = new THREE.InstancedMesh(handleGeo, mat.steel, total);

  const dummy = new THREE.Object3D();

  /* Which drawers are filled: spread down the corridor rather than clustered,
     so the walk past them is paced. */
  const filled = new Set();
  for (let i = 0; i < FILLED; i++) {
    filled.add(Math.round(((i + 0.5) / FILLED) * (columns * ROWS - 1)));
  }

  const lit = [];
  let n = 0;
  for (let c = 0; c < columns; c++) {
    const z = from - c * COL_W - COL_W / 2;
    for (let r = 0; r < ROWS; r++) {
      const y = BASE_Y + r * ROW_H;
      for (const side of [-1, 1]) {
        const x = (side * width) / 2 - side * 0.17;

        /* A few drawers stand proud of the face. A wall where every single
           unit is perfectly flush reads as wallpaper. */
        const proud = (c * 7 + r * 3 + (side + 1)) % 23 === 0 ? 0.22 : 0;

        dummy.position.set(x - side * proud, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        shut.setMatrixAt(n, dummy.matrix);

        dummy.position.set(x - side * (proud + 0.2), y, z);
        dummy.updateMatrix();
        handles.setMatrixAt(n, dummy.matrix);

        if (side === 1 && filled.has(c * ROWS + r)) lit.push({ x, y, z });
        n++;
      }
    }
  }
  shut.instanceMatrix.needsUpdate = true;
  handles.instanceMatrix.needsUpdate = true;
  group.add(shut, handles);

  /* The filled records: a lit face plate and an indicator that actually
     throws a little light onto the wall around it. */
  const plateGeo = new THREE.PlaneGeometry(COL_W - 0.24, ROW_H - 0.3);
  for (const rec of lit) {
    const plate = new THREE.Mesh(plateGeo, mat.accent);
    plate.position.set(rec.x - 0.19, rec.y, rec.z);
    plate.rotation.y = -Math.PI / 2;
    group.add(plate);

    const bloom = new THREE.Sprite(haze(0xaee83c, 0.3));
    bloom.position.set(rec.x - 0.5, rec.y, rec.z);
    bloom.scale.set(3.2, 2.2, 1);
    group.add(bloom);

    pool.add([rec.x - 0.8, rec.y, rec.z], {
      intensity: 4.5,
      distance: 7,
      color: 0xaee83c,
    });
  }

  /* ------------------------------------------------------------- lighting */

  /* A single continuous run down the crown, which is what an archive corridor
     actually has, and what gives the deck its long unbroken highlight. */
  const runGeo = new THREE.BoxGeometry(0.5, 0.1, length);
  const run = new THREE.Mesh(runGeo, mat.lamp);
  run.position.set(0, height - 0.4, midZ);
  group.add(run);

  for (let z = from; z >= to; z -= 7) {
    const near = new THREE.Sprite(haze(0xbcd2e6, 0.3));
    near.position.set(0, height - 0.6, z);
    near.scale.set(5.5, 2.2, 1);
    group.add(near);
    pool.add([0, height - 0.9, z], { intensity: 13, distance: 20 });
  }

  /* A gantry rail down one side, the thing that would move the drawers. */
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, length), mat.steel);
  rail.position.set(-width / 2 + 1.1, height - 1.3, midZ);
  group.add(rail);

  addDust(THREE, group, {
    count: 1400,
    box: { x: [-width / 2, width / 2], y: [0, height], z: [to, from] },
    size: 0.016,
    opacity: 0.3,
  });

  return { group };
}
