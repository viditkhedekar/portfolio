/**
 * 03 — CREDENTIAL VAULT.
 *
 * A hundred metres of corridor walled with safe doors. Almost all of them are
 * shut and dark; the ones that hold something are lit and carry a nameplate.
 * There are exactly as many lit safes as there are certifications on record,
 * because the count comes from the app's own data over `/counts.json` rather
 * than being written here, so the wall is a true picture of the archive and
 * the empty ones are not padding, they are room.
 *
 * The doors are instanced. There are a couple of hundred and they are the
 * same object, so drawing them one at a time would be a waste of a scene that
 * has better things to spend on.
 */

import { addDust } from "./kit.mjs";
import { buildFitting } from "./surfaces.mjs";

export const VAULT = { from: -300, to: -404, width: 11, height: 8 };

const ROWS = [1.55, 3.85];
const DOOR = 1.9;
const PITCH = 2.25;

export function buildVault(THREE, scene, kit, pool, surfaces, counts) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  scene.add(group);

  const { from, to, width, height } = VAULT;
  const length = from - to;
  const midZ = (from + to) / 2;
  const columns = Math.floor(length / PITCH);
  /* Read from the app's own data, never transcribed. A hand-copied count is
     how this room ended up lighting thirteen safes for twelve records. */
  const filledCount = counts.certifications;

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

  /* ----------------------------------------------------------------- doors */

  const total = columns * ROWS.length * 2;

  /* One instanced mesh per part of a door. Four draw calls for two hundred
     safes, rather than seventeen hundred. */
  const plate = new THREE.InstancedMesh(
    new THREE.BoxGeometry(DOOR, DOOR, 0.26),
    mat.dark,
    total,
  );
  plate.castShadow = true;
  plate.receiveShadow = true;

  const rim = new THREE.InstancedMesh(
    new THREE.TorusGeometry(DOOR * 0.42, 0.045, 8, 32),
    mat.steel,
    total,
  );

  const dial = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.12, 20),
    mat.steel,
    total,
  );

  const handle = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.11, 0.86, 0.11),
    mat.steel,
    total,
  );

  const dummy = new THREE.Object3D();

  /* Which safes hold something: spread down the corridor and alternating
     walls, so the walk past them is paced and lit from both flanks. */
  const slots = columns * ROWS.length;
  const filled = new Map();
  for (let i = 0; i < filledCount; i++) {
    const slot = Math.round(((i + 0.5) / filledCount) * (slots - 1));
    filled.set(slot, i);
  }

  const lit = [];
  let n = 0;

  for (let c = 0; c < columns; c++) {
    const z = from - c * PITCH - PITCH / 2;
    for (let r = 0; r < ROWS.length; r++) {
      const y = ROWS[r];
      const slot = c * ROWS.length + r;
      const record = filled.get(slot);
      const litSide = record === undefined ? 0 : record % 2 === 0 ? 1 : -1;

      for (const side of [-1, 1]) {
        const x = (side * width) / 2 - side * 0.14;
        const facing = (side * -Math.PI) / 2;

        dummy.position.set(x, y, z);
        dummy.rotation.set(0, facing, 0);
        dummy.updateMatrix();
        plate.setMatrixAt(n, dummy.matrix);
        rim.setMatrixAt(n, dummy.matrix);

        dummy.position.set(x - side * 0.16, y, z);
        dummy.rotation.set(Math.PI / 2, 0, facing);
        dummy.updateMatrix();
        dial.setMatrixAt(n, dummy.matrix);

        dummy.position.set(x - side * 0.16, y, z + DOOR * 0.34);
        dummy.rotation.set(0, facing, 0);
        dummy.updateMatrix();
        handle.setMatrixAt(n, dummy.matrix);

        if (record !== undefined && side === litSide) {
          lit.push({ index: record, x, y, z, side, facing });
        }
        n++;
      }
    }
  }

  plate.instanceMatrix.needsUpdate = true;
  rim.instanceMatrix.needsUpdate = true;
  dial.instanceMatrix.needsUpdate = true;
  handle.instanceMatrix.needsUpdate = true;
  group.add(plate, rim, dial, handle);

  /* The records that are actually held: a lit nameplate on the door, and
     enough spill to pick the safe out of the row. */
  for (const rec of lit) {
    const fitting = buildFitting(THREE, kit, {
      width: 1.62,
      height: 0.52,
      depth: 0.16,
      lit: false,
    });
    fitting.group.position.set(rec.x - rec.side * 0.2, rec.y - DOOR * 0.33, rec.z);
    fitting.group.rotation.y = rec.facing;
    group.add(fitting.group);

    surfaces.add(`credential-${rec.index}`, "plate", fitting.face, 1.62, 0.52, {
      index: rec.index,
    });

    const glow = new THREE.Sprite(haze(0xaee83c, 0.2));
    glow.position.set(rec.x - rec.side * 0.6, rec.y, rec.z);
    glow.scale.set(3.4, 3.4, 1);
    group.add(glow);

    pool.add([rec.x - rec.side * 0.9, rec.y, rec.z], {
      intensity: 3.4,
      distance: 6,
      color: 0xaee83c,
    });
  }

  /* The index board, on the end wall where the corridor runs out. */
  const board = buildFitting(THREE, kit, { width: 8.4, height: 4.6, depth: 0.5 });
  board.group.position.set(0, 4.2, to + 0.4);
  board.group.rotation.y = Math.PI;
  group.add(board.group);
  surfaces.add("vault-index", "wall", board.face, 8.4, 4.6);

  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wall);
  endWall.position.set(0, height / 2, to);
  endWall.rotation.y = Math.PI;
  group.add(endWall);

  pool.add([0, 5.4, to + 3], { intensity: 18, distance: 22 });

  /* ------------------------------------------------------------- lighting */

  const run = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, length), mat.lamp);
  run.position.set(0, height - 0.4, midZ);
  group.add(run);

  for (let z = from; z >= to; z -= 7) {
    const near = new THREE.Sprite(haze(0xbcd2e6, 0.3));
    near.position.set(0, height - 0.6, z);
    near.scale.set(5.5, 2.2, 1);
    group.add(near);
    pool.add([0, height - 0.9, z], { intensity: 13, distance: 20 });
  }

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
