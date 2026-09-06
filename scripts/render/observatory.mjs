/**
 * 02 — ACADEMIC OBSERVATORY.
 *
 * The hall opens into a drum thirty metres across and open at the top. The
 * camera comes in at floor level and climbs, so the room reveals itself the
 * way a big interior actually does: you see the far wall first, then the
 * galleries above you, then the sky.
 *
 * The hero here is chrome. It is the only mirrored object in the world so
 * far, which is the entire reason it works: put a second one anywhere near it
 * and both stop being special.
 */

import { addDust } from "./kit.mjs";
import { buildFitting } from "./surfaces.mjs";

export const OBSERVATORY = {
  centre: [0, 0, -232],
  radius: 30,
  height: 42,
  /** Where the corridor from the facility breaks through the drum wall. */
  mouthZ: -202,
};

const SUBJECTS = [
  "MATHEMATICS", "ENGLISH", "BIOLOGY", "PHYSICS", "CHEMISTRY",
  "HISTORY", "GEOGRAPHY", "ECONOMICS", "FRENCH",
];

export function buildObservatory(THREE, scene, kit, pool, surfaces) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  const [cx, cy, cz] = OBSERVATORY.centre;
  group.position.set(cx, cy, cz);
  scene.add(group);

  const R = OBSERVATORY.radius;
  const H = OBSERVATORY.height;

  /* ---------------------------------------------------------------- drum */

  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, H, 72, 1, true),
    new THREE.MeshStandardMaterial({
      map: kit.panel.clone(),
      color: 0xc2ccd6,
      roughness: 0.74,
      metalness: 0.28,
      envMapIntensity: 0.85,
      side: THREE.BackSide,
    }),
  );
  drum.material.map.repeat.set(26, 7);
  drum.position.y = H / 2;
  drum.receiveShadow = true;
  group.add(drum);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(R, 72), mat.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  /* Ribs running up the drum, which is what gives the wall its scale. */
  const ribGeo = new THREE.BoxGeometry(0.8, H, 1.2);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, mat.steel);
    rib.position.set(Math.cos(a) * (R - 0.5), H / 2, Math.sin(a) * (R - 0.5));
    rib.rotation.y = -a;
    group.add(rib);
  }

  /* ------------------------------------------------------------ galleries */

  /* Two walkways around the wall. They read as floors you could stand on,
     which is what stops the drum being an abstract tube. */
  for (const [y, width] of [[13, 4.5], [26, 3.6]]) {
    const deck = new THREE.Mesh(
      new THREE.RingGeometry(R - width, R - 0.6, 72),
      mat.dark,
    );
    deck.rotation.x = -Math.PI / 2;
    deck.position.y = y;
    deck.receiveShadow = true;
    group.add(deck);

    const rail = new THREE.Mesh(
      new THREE.TorusGeometry(R - width, 0.07, 8, 96),
      mat.steel,
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.y = y + 1.05;
    group.add(rail);

    /* Balusters, thinned out: at this distance every third one reads the
       same as all of them and costs a third as much. */
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.05, 6);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const post = new THREE.Mesh(postGeo, mat.steel);
      post.position.set(Math.cos(a) * (R - width), y + 0.52, Math.sin(a) * (R - width));
      group.add(post);
    }

    /* Under-deck lighting, which is what makes a gallery float. */
    const strip = new THREE.Mesh(
      new THREE.TorusGeometry(R - width * 0.55, 0.09, 6, 96),
      mat.lamp,
    );
    strip.rotation.x = Math.PI / 2;
    strip.position.y = y - 0.22;
    group.add(strip);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pool.add(
        [cx + Math.cos(a) * (R - width - 1), y - 1.4, cz + Math.sin(a) * (R - width - 1)],
        { intensity: 14, distance: 26 },
      );
    }
  }

  /* ------------------------------------------------------------- armillary */

  const core = new THREE.Group();
  core.position.y = 17;
  group.add(core);

  /* Three chrome rings on different tilts. Torus rather than a line: it has
     a surface, so it can catch a highlight and read as metal. */
  const rings = [
    { r: 9.5, tube: 0.34, tilt: [0.4, 0, 0.18] },
    { r: 13, tube: 0.26, tilt: [-0.72, 0.3, 0] },
    { r: 16.5, tube: 0.2, tilt: [1.2, 0, -0.4] },
  ];
  for (const spec of rings) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.r, spec.tube, 16, 160),
      mat.chrome,
    );
    ring.rotation.set(...spec.tilt);
    ring.castShadow = true;
    core.add(ring);
  }

  /* The lit core the rings are about. */
  /* Bright, not blinding. The first pass ran this at a hundred and twenty and
     it lit the fog in the whole drum, turning a thirty metre room into a flat
     yellow wash with three wires across it. */
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xdfeaf6 }),
  );
  core.add(bulb);

  const bulbHaze = new THREE.Sprite(haze(0xbcd2e6, 0.26));
  bulbHaze.scale.set(12, 12, 1);
  core.add(bulbHaze);

  pool.add([cx, cy + 17, cz], { intensity: 32, distance: 50, color: 0xcfe0f0 });

  /* An armature holding the whole assembly off the floor. */
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.9, 17, 12),
    mat.steel,
  );
  spine.position.y = 8.5;
  group.add(spine);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.6, 1.2, 32), mat.dark);
  base.position.y = 0.6;
  base.receiveShadow = true;
  group.add(base);

  /* ---------------------------------------------------------- wall panels */

  /*
   * The academic record, mounted on the drum.
   *
   * Set on the far half, because the camera enters at the near side and
   * climbs looking across: a panel behind the entrance would never be seen.
   * Facing dead centre, so they are square-on from the middle of the room.
   */
  const WALL_PANELS = [
    { id: "school-summary", angle: 1.15, y: 10 },
    { id: "school-subjects", angle: 1.95, y: 10 },
    { id: "school-qualification", angle: 2.75, y: 10 },
  ];

  for (const panel of WALL_PANELS) {
    const x = Math.cos(panel.angle) * (R - 1.7);
    const z = Math.sin(panel.angle) * (R - 1.7);

    const fitting = buildFitting(THREE, kit, { width: 11, height: 6.4, depth: 0.5 });
    fitting.group.position.set(x, panel.y, z);
    /* Turn the panel's +Z, which is the face, in towards the axis. */
    fitting.group.rotation.y = Math.atan2(-Math.cos(panel.angle), -Math.sin(panel.angle));
    group.add(fitting.group);

    surfaces.add(panel.id, "wall", fitting.face, 11, 6.4);

    pool.add([cx + x * 0.86, panel.y + 1, cz + z * 0.86], {
      intensity: 16,
      distance: 26,
    });
  }

  /* ------------------------------------------------------------- subjects */

  /* One plinth per subject, ringed around the floor under the armillary, each
     with its own nameplate. */
  SUBJECTS.forEach((_, i) => {
    const a = (i / SUBJECTS.length) * Math.PI * 2 + 0.3;
    const x = Math.cos(a) * 21;
    const z = Math.sin(a) * 21;
    const facing = Math.atan2(-Math.cos(a), -Math.sin(a));

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 1.1), mat.dark);
    plinth.position.set(x, 1.4, z);
    plinth.rotation.y = facing;
    plinth.castShadow = true;
    group.add(plinth);

    const plate = buildFitting(THREE, kit, {
      width: 2.1,
      height: 0.62,
      depth: 0.18,
      lit: false,
    });
    plate.group.position.set(x * 0.975, 2.15, z * 0.975);
    plate.group.rotation.y = facing;
    group.add(plate.group);

    surfaces.add(`subject-${i}`, "plate", plate.face, 2.1, 0.62, { index: i });

    pool.add([cx + x * 0.9, 2.6, cz + z * 0.9], {
      intensity: 4,
      distance: 8,
      color: 0xaee83c,
    });
  });

  /* ------------------------------------------------------------------ sky */

  /* Above the drum the roof is off. The stars are the only thing in the whole
     world that is not inside a building. */
  const starGeo = new THREE.BufferGeometry();
  const count = 2600;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const t = Math.acos(Math.random());
    const r = 120 + Math.random() * 80;
    pos[i * 3] = Math.cos(a) * Math.sin(t) * r;
    pos[i * 3 + 1] = H + Math.abs(Math.cos(t)) * r * 0.9;
    pos[i * 3 + 2] = Math.sin(a) * Math.sin(t) * r;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  group.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xcfe0f0,
        size: 0.55,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    ),
  );

  /* The lip of the drum, lit from below, so the sky has an edge. */
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R - 0.4, 0.35, 10, 96), mat.steel);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = H;
  group.add(lip);

  addDust(THREE, group, {
    count: 2200,
    box: { x: [-R, R], y: [0, H], z: [-R, R] },
    size: 0.03,
    opacity: 0.22,
  });

  return { group };
}
