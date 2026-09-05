/**
 * 04 — IDENTITY CHAMBER.
 *
 * After a hundred metres of archive, everything stops. A small room, one
 * object, one light, and more haze than anywhere else in the building.
 *
 * The restraint is the content: this is the section about the person, and it
 * gets the quietest room. The one thing in it is glass rather than chrome,
 * because a mirror shows you the room and glass shows you what is inside it.
 */

import { addDust } from "./kit.mjs";

export const CHAMBER = { from: -420, to: -474, width: 20, height: 9 };

export function buildChamber(THREE, scene, kit, pool) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  scene.add(group);

  const { from, to, width, height } = CHAMBER;
  const length = from - to;
  const midZ = (from + to) / 2;

  /* ---------------------------------------------------------------- shell */

  const wall = mat.wall.clone();
  wall.color.setHex(0x8e97a0);
  wall.map = kit.panel.clone();
  wall.map.repeat.set(length / 9, height / 5);

  const deck = mat.floor.clone();
  deck.map = kit.floorMap.clone();
  deck.map.repeat.set(width / 5, length / 5);
  deck.roughnessMap = kit.floorRough.clone();
  deck.roughnessMap.repeat.copy(deck.map.repeat);
  /* Polished harder than anywhere else. There is almost nothing in this room,
     so what little there is has to appear twice. */
  deck.roughness = 0.18;
  deck.metalness = 0.6;

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
    face.receiveShadow = true;
    group.add(face);
  }

  /* The far wall, so the room is a room and not another corridor. */
  const back = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wall);
  back.position.set(0, height / 2, to);
  group.add(back);

  /* --------------------------------------------------------------- the file */

  /* Off the walked line, so the camera passes it rather than flying into it. */
  const standZ = midZ + 3;
  const standX = -4.2;

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.9, 0.35, 48), mat.dark);
  base.position.set(standX, 0.175, standZ);
  base.receiveShadow = true;
  group.add(base);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.5, 24), mat.steel);
  column.position.set(standX, 1.05, standZ);
  column.castShadow = true;
  group.add(column);

  /* The identity file itself: a slab of smoked glass, lit from underneath. */
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 0.28), mat.glass);
  slab.position.set(standX, 3.0, standZ);
  slab.rotation.y = 0.5;
  slab.castShadow = true;
  group.add(slab);

  const under = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24),
    mat.accent,
  );
  under.position.set(standX, 1.83, standZ);
  group.add(under);

  pool.add([standX, 2.4, standZ], { intensity: 9, distance: 11, color: 0xaee83c });

  /* One light directly over it, and the cone it makes in the haze. This is
     the only fixture in the room. */
  const canGeo = new THREE.CylinderGeometry(0.42, 0.55, 0.5, 20);
  const can = new THREE.Mesh(canGeo, mat.dark);
  can.position.set(standX, height - 0.3, standZ);
  group.add(can);

  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), mat.lamp);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(standX, height - 0.56, standZ);
  group.add(lens);

  /* The beam, as a real cone of additive haze rather than a sprite: from the
     side a sprite gives itself away immediately, and the camera passes this
     one side on. */
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, height - 1.2, 40, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x9fc0e0,
      transparent: true,
      opacity: 0.055,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  beam.position.set(standX, (height - 1.2) / 2 + 0.3, standZ);
  beam.rotation.x = Math.PI;
  group.add(beam);

  const spot = new THREE.SpotLight(0xbcd6ee, 130, 18, 0.42, 0.55, 2);
  spot.position.set(standX, height - 0.6, standZ);
  spot.target.position.set(standX, 0, standZ);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  group.add(spot, spot.target);

  /* A pool of light on the floor, which is what the eye actually reads as
     "there is a lamp above". */
  const puddle = new THREE.Sprite(haze(0x9fc0e0, 0.16));
  puddle.position.set(standX, 0.05, standZ);
  puddle.scale.set(11, 11, 1);
  group.add(puddle);

  /* ----------------------------------------------------------------- edges */

  /* A single skirting light around the room, dim. Enough to find the walls. */
  for (const side of [-1, 1]) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, length),
      new THREE.MeshBasicMaterial({ color: 0x38424c }),
    );
    line.position.set((side * width) / 2 - side * 0.1, 0.14, midZ);
    group.add(line);
  }

  addDust(THREE, group, {
    count: 2600,
    box: { x: [-width / 2, width / 2], y: [0, height], z: [to, from] },
    size: 0.022,
    opacity: 0.34,
  });

  return { group };
}
