/**
 * 05 — COMMUNICATIONS ARRAY.
 *
 * The building opens out and stops having a ceiling. A hangar with the far
 * end cut away to the night, and a dish on a mast pointing out of it.
 *
 * This is the only room whose subject is outside itself, and the camera's
 * last move is upward, following the transmission rather than arriving
 * anywhere. It is the end of the path, so it gets the one view in the whole
 * world with sky in it at eye level.
 */

import { addDust } from "./kit.mjs";
import { buildFitting } from "./surfaces.mjs";

export const COMMS = { from: -490, to: -580, width: 54, height: 26 };

/** Real channels, mirrored from src/lib/data/identity.ts. */
const CHANNELS = ["EMAIL", "LINKEDIN", "GITHUB"];

export function buildComms(THREE, scene, kit, pool, surfaces) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  scene.add(group);

  const { from, to, width, height } = COMMS;
  const length = from - to;
  const midZ = (from + to) / 2;

  /* ---------------------------------------------------------------- shell */

  const deck = mat.floor.clone();
  deck.map = kit.floorMap.clone();
  deck.map.repeat.set(width / 5, length / 5);
  deck.roughnessMap = kit.floorRough.clone();
  deck.roughnessMap.repeat.copy(deck.map.repeat);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, length), deck);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = midZ;
  floor.receiveShadow = true;
  group.add(floor);

  const wall = mat.wall.clone();
  wall.map = kit.panel.clone();
  wall.map.repeat.set(length / 8, height / 5);

  for (const side of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wall);
    face.rotation.y = (side * -Math.PI) / 2;
    face.position.set((side * width) / 2, height / 2, midZ);
    face.receiveShadow = true;
    group.add(face);
  }

  /* Roof over the near half only. The far half is open, and the line where it
     stops is the most important edge in the room. */
  const roofLength = length * 0.45;
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(width, roofLength), mat.ceiling);
  roof.rotation.x = Math.PI / 2;
  roof.position.set(0, height, from - roofLength / 2);
  group.add(roof);

  const edge = new THREE.Mesh(new THREE.BoxGeometry(width, 1.4, 1.6), mat.steel);
  edge.position.set(0, height - 0.4, from - roofLength);
  edge.castShadow = true;
  group.add(edge);

  /* Roof trusses, and the gantry lights hung off them. */
  for (let z = from; z >= from - roofLength; z -= 9) {
    const truss = new THREE.Mesh(new THREE.BoxGeometry(width, 0.7, 0.9), mat.steel);
    truss.position.set(0, height - 1.1, z);
    group.add(truss);

    for (const x of [-13, 13]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.5), mat.lamp);
      lamp.position.set(x, height - 1.7, z);
      group.add(lamp);

      const near = new THREE.Sprite(haze(0xbcd2e6, 0.34));
      near.position.set(x, height - 2.0, z);
      near.scale.set(9, 4, 1);
      group.add(near);

      pool.add([x, height - 2.4, z], { intensity: 26, distance: 40 });
    }
  }

  /* ----------------------------------------------------------------- night */

  /* Beyond the open end: ground haze and a star field. Deliberately sparse,
     because the point of the opening is that there is nothing out there. */
  const skyGeo = new THREE.BufferGeometry();
  const count = 1800;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 460;
    pos[i * 3 + 1] = Math.random() * 190 - 10;
    pos[i * 3 + 2] = to - Math.random() * 320;
  }
  skyGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  group.add(
    new THREE.Points(
      skyGeo,
      new THREE.PointsMaterial({
        color: 0xc6d8ea,
        size: 0.6,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    ),
  );

  /* --------------------------------------------------------------- the dish */

  const rig = new THREE.Group();
  rig.position.set(0, 0, to + 26);
  group.add(rig);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.3, 17, 16), mat.steel);
  mast.position.y = 8.5;
  mast.castShadow = true;
  rig.add(mast);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.1, 1.1, 32), mat.dark);
  collar.position.y = 0.55;
  rig.add(collar);

  /* Guy wires. Thin, and the only diagonals in the room. */
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const anchor = new THREE.Vector3(Math.cos(a) * 12, 0, Math.sin(a) * 12);
    const top = new THREE.Vector3(0, 13.5, 0);
    const dir = new THREE.Vector3().subVectors(anchor, top);
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, dir.length(), 6),
      mat.steel,
    );
    wire.position.copy(top).addScaledVector(dir, 0.5);
    wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    rig.add(wire);
  }

  /* The dish. A lathe rather than a cone, so its section is a real parabola
     and the rim catches light the way a dish does. */
  const profile = [];
  for (let i = 0; i <= 24; i++) {
    const r = (i / 24) * 11;
    profile.push(new THREE.Vector2(r, (r * r) / 26));
  }
  const dish = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 64),
    new THREE.MeshStandardMaterial({
      color: 0xc9d4de,
      roughness: 0.28,
      metalness: 0.9,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
    }),
  );
  dish.position.y = 18;
  dish.rotation.x = -1.05;
  dish.castShadow = true;
  rig.add(dish);

  /* Feed horn on its tripod, at the focus. */
  /* Uplighters at the rim. Without them the dish is a black disc against the
     sky, which is a shape rather than an object. */
  for (let i = 0; i < 5; i++) {
    const a = -0.4 + (i / 4) * (Math.PI + 0.8);
    pool.add([Math.cos(a) * 9, 13.5, to + 26 + Math.sin(a) * 9 + 2], {
      intensity: 30,
      distance: 26,
    });
  }

  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 16), mat.dark);
  horn.position.set(0, 21.6, 3.6);
  horn.rotation.x = 2.1;
  rig.add(horn);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), mat.accent);
  beacon.position.set(0, 22.6, 3.9);
  rig.add(beacon);

  const beaconHaze = new THREE.Sprite(haze(0xaee83c, 0.5));
  beaconHaze.position.copy(beacon.position);
  beaconHaze.scale.set(9, 9, 1);
  rig.add(beaconHaze);

  pool.add([0, 22.6, to + 30], { intensity: 26, distance: 40, color: 0xaee83c });

  /* ------------------------------------------------------------- channels */

  /* One console per open channel, arranged in an arc facing back up the
     apron so the camera meets them head on rather than edge on. */
  CHANNELS.forEach((_, i) => {
    const spread = 7.5;
    const x = (i - (CHANNELS.length - 1) / 2) * spread;
    const z = 13;

    const box = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.3, 1.8), mat.dark);
    box.position.set(x, 0.65, z);
    box.castShadow = true;
    rig.add(box);

    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.7, 0.4), mat.steel);
    stand.position.set(x, 1.9, z - 0.3);
    rig.add(stand);

    const fitting = buildFitting(THREE, kit, { width: 4.6, height: 2.5, depth: 0.4 });
    fitting.group.position.set(x, 3.6, z + 0.2);
    fitting.group.rotation.x = -0.16;
    rig.add(fitting.group);

    surfaces.add(`channel-${i}`, "console", fitting.face, 4.6, 2.5, { index: i });

    pool.add([x, 3.4, to + 26 + z + 1.6], {
      intensity: 5,
      distance: 10,
      color: 0xaee83c,
    });
  });

  /* The summary board, high on the left wall where the roof runs out. */
  const board = buildFitting(THREE, kit, { width: 12, height: 6.4, depth: 0.5 });
  board.group.position.set(-width / 2 + 0.6, 9.5, from - roofLength - 12);
  board.group.rotation.y = Math.PI / 2;
  group.add(board.group);
  surfaces.add("comms-index", "wall", board.face, 12, 6.4);

  pool.add([-width / 2 + 4, 10, from - roofLength - 12], {
    intensity: 20,
    distance: 26,
  });

  /* Landing lights marking the apron out to the open end, and a mast light
     every third pair so the deck out here is not pitch black. */
  for (let i = 0; i < 9; i++) {
    const z = from - roofLength - i * 6;
    for (const side of [-1, 1]) {
      const pip = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xaee83c }),
      );
      pip.position.set(side * 20, 0.16, z);
      group.add(pip);

      if (i % 3 === 0) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8),
          mat.steel,
        );
        post.position.set(side * 22, 2.75, z);
        group.add(post);

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 0.5), mat.lamp);
        head.position.set(side * 21.4, 5.4, z);
        group.add(head);

        const glow = new THREE.Sprite(haze(0xbcd2e6, 0.3));
        glow.position.set(side * 21.4, 5.2, z);
        glow.scale.set(6, 4, 1);
        group.add(glow);

        pool.add([side * 20.5, 4.8, z], { intensity: 24, distance: 34 });
      }
    }
  }

  addDust(THREE, group, {
    count: 2400,
    box: { x: [-width / 2, width / 2], y: [0, height], z: [to, from] },
    size: 0.026,
    opacity: 0.24,
  });

  return { group };
}
